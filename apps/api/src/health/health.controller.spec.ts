import { Test } from '@nestjs/testing';
import { HealthController } from '@/health/health.controller';
import { HealthService, HealthStatus } from '@/health/health.service';

describe('HealthController', () => {
  let controller: HealthController;
  const check = jest.fn();

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: { check } }],
    }).compile();
    controller = moduleRef.get(HealthController);
  });

  it('delegates to the health service', async () => {
    const status: HealthStatus = { status: 'ok', database: 'up' };
    check.mockResolvedValueOnce(status);
    await expect(controller.check()).resolves.toBe(status);
  });
});
