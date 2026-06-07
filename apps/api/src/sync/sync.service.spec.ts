import { Test } from '@nestjs/testing';
import { PrismaService } from '@/prisma/prisma.service';
import { PushPayloadDto } from '@/sync/dto/push-payload.dto';
import { SyncService } from '@/sync/sync.service';

type ModelMock = {
  findMany: jest.Mock;
  findUnique: jest.Mock;
  upsert: jest.Mock;
};

function model(): ModelMock {
  return { findMany: jest.fn(), findUnique: jest.fn(), upsert: jest.fn() };
}

describe('SyncService', () => {
  let service: SyncService;
  let prisma: {
    club: ModelMock;
    trainingSession: ModelMock;
    shotBlock: ModelMock;
    $transaction: jest.Mock;
  };

  const userId = '11111111-1111-1111-1111-111111111111';

  beforeEach(async () => {
    prisma = {
      club: model(),
      trainingSession: model(),
      shotBlock: model(),
      $transaction: jest.fn((arg) => (Array.isArray(arg) ? Promise.all(arg) : arg(prisma))),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [SyncService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(SyncService);
  });

  describe('pull', () => {
    it('queries each model after the given cursor', async () => {
      prisma.club.findMany.mockResolvedValue([{ id: 'c1' }]);
      prisma.trainingSession.findMany.mockResolvedValue([]);
      prisma.shotBlock.findMany.mockResolvedValue([]);

      const snapshot = await service.pull(userId, '2026-01-01T00:00:00.000Z');

      expect(prisma.club.findMany).toHaveBeenCalledWith({
        where: { userId, updatedAt: { gt: new Date('2026-01-01T00:00:00.000Z') } },
      });
      expect(snapshot.clubs).toEqual([{ id: 'c1' }]);
      expect(typeof snapshot.serverTime).toBe('string');
    });

    it('defaults the cursor to the epoch when no since is provided', async () => {
      prisma.club.findMany.mockResolvedValue([]);
      prisma.trainingSession.findMany.mockResolvedValue([]);
      prisma.shotBlock.findMany.mockResolvedValue([]);

      await service.pull(userId);

      expect(prisma.club.findMany).toHaveBeenCalledWith({
        where: { userId, updatedAt: { gt: new Date(0) } },
      });
    });
  });

  describe('push', () => {
    it('creates a record that does not yet exist', async () => {
      prisma.club.findUnique.mockResolvedValue(null);
      const payload: PushPayloadDto = {
        clubs: [
          {
            id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            type: 'IRON_7',
            label: '7 iron',
            position: 0,
            updatedAt: '2026-02-01T00:00:00.000Z',
            deletedAt: '2026-02-02T00:00:00.000Z',
          },
        ],
        trainingSessions: [],
        shotBlocks: [],
      };

      await service.push(userId, payload);

      expect(prisma.club.upsert).toHaveBeenCalledTimes(1);
      expect(prisma.club.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
          create: expect.objectContaining({
            userId,
            type: 'IRON_7',
            deletedAt: new Date('2026-02-02T00:00:00.000Z'),
          }),
        })
      );
    });

    it('skips a record the server already has a newer version of', async () => {
      prisma.club.findUnique.mockResolvedValue({
        userId,
        updatedAt: new Date('2026-05-01T00:00:00.000Z'),
      });
      const payload: PushPayloadDto = {
        clubs: [
          {
            id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            type: 'DRIVER',
            label: 'Driver',
            position: 0,
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        trainingSessions: [],
        shotBlocks: [],
      };

      await service.push(userId, payload);

      expect(prisma.club.upsert).not.toHaveBeenCalled();
    });

    it('skips a record owned by another user', async () => {
      prisma.club.findUnique.mockResolvedValue({
        userId: 'someone-else',
        updatedAt: new Date('2020-01-01T00:00:00.000Z'),
      });
      const payload: PushPayloadDto = {
        clubs: [
          {
            id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            type: 'DRIVER',
            label: 'Driver',
            position: 0,
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        trainingSessions: [],
        shotBlocks: [],
      };

      await service.push(userId, payload);

      expect(prisma.club.upsert).not.toHaveBeenCalled();
    });

    it('skips training sessions and shot blocks the server already has newer', async () => {
      prisma.trainingSession.findUnique.mockResolvedValue({
        userId,
        updatedAt: new Date('2030-01-01T00:00:00.000Z'),
      });
      prisma.shotBlock.findUnique.mockResolvedValue({
        userId,
        updatedAt: new Date('2030-01-01T00:00:00.000Z'),
      });
      const payload: PushPayloadDto = {
        clubs: [],
        trainingSessions: [
          {
            id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            startedAt: '2026-03-01T09:00:00.000Z',
            updatedAt: '2026-03-01T10:00:00.000Z',
          },
        ],
        shotBlocks: [
          {
            id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
            sessionId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            clubId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            ballCount: 10,
            solidCount: 6,
            leftCount: 2,
            centerCount: 6,
            rightCount: 2,
            updatedAt: '2026-03-01T10:05:00.000Z',
          },
        ],
      };

      await service.push(userId, payload);

      expect(prisma.trainingSession.upsert).not.toHaveBeenCalled();
      expect(prisma.shotBlock.upsert).not.toHaveBeenCalled();
    });

    it('applies training sessions and shot blocks', async () => {
      prisma.trainingSession.findUnique.mockResolvedValue(null);
      prisma.shotBlock.findUnique.mockResolvedValue(null);
      const payload: PushPayloadDto = {
        clubs: [],
        trainingSessions: [
          {
            id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            startedAt: '2026-03-01T09:00:00.000Z',
            note: 'range warm up',
            updatedAt: '2026-03-01T10:00:00.000Z',
          },
        ],
        shotBlocks: [
          {
            id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
            sessionId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            clubId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            ballCount: 10,
            solidCount: 6,
            leftCount: 2,
            centerCount: 6,
            rightCount: 2,
            updatedAt: '2026-03-01T10:05:00.000Z',
          },
        ],
      };

      await service.push(userId, payload);

      expect(prisma.trainingSession.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ userId, note: 'range warm up', deletedAt: null }),
        })
      );
      expect(prisma.shotBlock.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ userId, distanceMeters: null, ballCount: 10 }),
        })
      );
    });
  });
});
