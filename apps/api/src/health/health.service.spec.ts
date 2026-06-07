import { Test } from '@nestjs/testing';
import { PrismaService } from '@/prisma/prisma.service';
import { HealthService } from '@/health/health.service';

describe('HealthService', () => {
  let service: HealthService;
  const queryRaw = jest.fn();

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [HealthService, { provide: PrismaService, useValue: { $queryRaw: queryRaw } }],
    }).compile();
    service = moduleRef.get(HealthService);
    queryRaw.mockReset();
  });

  it('reports ok when the database responds', async () => {
    queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);
    await expect(service.check()).resolves.toEqual({ status: 'ok', database: 'up' });
  });

  it('reports degraded when the database query fails', async () => {
    queryRaw.mockRejectedValueOnce(new Error('connection refused'));
    await expect(service.check()).resolves.toEqual({ status: 'degraded', database: 'down' });
  });
});
