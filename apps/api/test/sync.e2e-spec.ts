import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '@/app.module';

describe('Sync (e2e)', () => {
  let app: INestApplication;
  let token: string;
  const prisma = new PrismaClient();
  const email = `sync-${Date.now()}@example.com`;
  const password = 'sup3r-secret-pw';

  const clubId = 'a1a1a1a1-0000-4000-8000-000000000001';
  const sessionId = 'a1a1a1a1-0000-4000-8000-000000000002';
  const blockId = 'a1a1a1a1-0000-4000-8000-000000000003';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ bodyParser: false });
    app.setGlobalPrefix('api');
    await app.init();

    const server = app.getHttpServer();
    await request(server).post('/api/auth/sign-up/email').send({ name: 'Sync', email, password });
    await prisma.user.update({ where: { email }, data: { emailVerified: true } });
    const signIn = await request(server).post('/api/auth/sign-in/email').send({ email, password });
    token = signIn.headers['set-auth-token'];
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
    await app.close();
  });

  it('pushes a bag, session and block, then pulls them back', async () => {
    const server = app.getHttpServer();
    const now = new Date().toISOString();

    const push = await request(server)
      .post('/api/sync')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clubs: [{ id: clubId, type: 'IRON_7', label: '7 iron', position: 0, updatedAt: now }],
        trainingSessions: [{ id: sessionId, startedAt: now, updatedAt: now }],
        shotBlocks: [
          {
            id: blockId,
            sessionId,
            clubId,
            ballCount: 10,
            solidCount: 7,
            leftCount: 2,
            centerCount: 6,
            rightCount: 2,
            distanceMeters: 120,
            updatedAt: now,
          },
        ],
      });
    expect(push.status).toBe(201);

    const pull = await request(server)
      .get('/api/sync?since=1970-01-01T00:00:00.000Z')
      .set('Authorization', `Bearer ${token}`);

    expect(pull.status).toBe(200);
    expect(pull.body.clubs).toHaveLength(1);
    expect(pull.body.clubs[0].label).toBe('7 iron');
    expect(pull.body.shotBlocks[0].solidCount).toBe(7);
  });

  it('rejects sync without a bearer token', async () => {
    const res = await request(app.getHttpServer()).get('/api/sync');
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
