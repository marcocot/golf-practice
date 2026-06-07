import { Test } from '@nestjs/testing';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PushPayloadDto } from '@/sync/dto/push-payload.dto';
import { SyncController } from '@/sync/sync.controller';
import { SyncService } from '@/sync/sync.service';

describe('SyncController', () => {
  let controller: SyncController;
  const pull = jest.fn();
  const push = jest.fn();
  const session = { user: { id: 'user-1' } } as UserSession;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SyncController],
      providers: [{ provide: SyncService, useValue: { pull, push } }],
    }).compile();
    controller = moduleRef.get(SyncController);
    pull.mockReset();
    push.mockReset();
  });

  it('pulls for the session user with the since cursor', async () => {
    const snapshot = { serverTime: 't', clubs: [], trainingSessions: [], shotBlocks: [] };
    pull.mockResolvedValueOnce(snapshot);

    await expect(controller.pull(session, '2026-01-01T00:00:00.000Z')).resolves.toBe(snapshot);
    expect(pull).toHaveBeenCalledWith('user-1', '2026-01-01T00:00:00.000Z');
  });

  it('pushes the payload for the session user', async () => {
    const payload: PushPayloadDto = {
      clubs: [],
      trainingSessions: [],
      shotBlocks: [],
      skillTestResults: [],
    };
    push.mockResolvedValueOnce({ serverTime: 't' });

    await controller.push(session, payload);
    expect(push).toHaveBeenCalledWith('user-1', payload);
  });
});
