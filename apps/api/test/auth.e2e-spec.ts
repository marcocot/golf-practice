import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '@/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();
  const email = `e2e-${Date.now()}@example.com`;
  const password = 'sup3r-secret-pw';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ bodyParser: false });
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
    await app.close();
  });

  it('registers a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .send({ name: 'E2E Player', email, password });
    expect(res.status).toBe(200);
  });

  it('blocks sign-in until the email is verified', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .send({ email, password });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('allows sign-in after verifying the email and returns a bearer token', async () => {
    await prisma.user.update({ where: { email }, data: { emailVerified: true } });

    const res = await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.headers['set-auth-token']).toBeDefined();
  });
});
