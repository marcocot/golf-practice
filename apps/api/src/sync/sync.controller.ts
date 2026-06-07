import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { PushPayloadDto } from '@/sync/dto/push-payload.dto';
import { SyncService, SyncSnapshot } from '@/sync/sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Get()
  pull(@Session() session: UserSession, @Query('since') since?: string): Promise<SyncSnapshot> {
    return this.sync.pull(session.user.id, since);
  }

  @Post()
  push(
    @Session() session: UserSession,
    @Body() payload: PushPayloadDto
  ): Promise<{ serverTime: string }> {
    return this.sync.push(session.user.id, payload);
  }
}
