import { Injectable } from '@nestjs/common';
import {
  Club,
  Prisma,
  QuizResult,
  ShotBlock,
  SkillTestResult,
  TrainingSession,
} from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import {
  ClubInputDto,
  PushPayloadDto,
  QuizResultInputDto,
  ShotBlockInputDto,
  SkillTestResultInputDto,
  TrainingSessionInputDto,
} from '@/sync/dto/push-payload.dto';

export interface SyncSnapshot {
  serverTime: string;
  clubs: Club[];
  trainingSessions: TrainingSession[];
  shotBlocks: ShotBlock[];
  skillTestResults: SkillTestResult[];
  quizResults: QuizResult[];
}

interface Versioned {
  userId: string;
  updatedAt: Date;
}

@Injectable()
export class SyncService {
  constructor(private readonly prisma: PrismaService) {}

  async pull(userId: string, since?: string): Promise<SyncSnapshot> {
    const cursor = since ? new Date(since) : new Date(0);
    const serverTime = new Date();
    const where = { userId, updatedAt: { gt: cursor } };

    const [clubs, trainingSessions, shotBlocks, skillTestResults, quizResults] =
      await this.prisma.$transaction([
        this.prisma.club.findMany({ where }),
        this.prisma.trainingSession.findMany({ where }),
        this.prisma.shotBlock.findMany({ where }),
        this.prisma.skillTestResult.findMany({ where }),
        this.prisma.quizResult.findMany({ where }),
      ]);

    return {
      serverTime: serverTime.toISOString(),
      clubs,
      trainingSessions,
      shotBlocks,
      skillTestResults,
      quizResults,
    };
  }

  async push(userId: string, payload: PushPayloadDto): Promise<{ serverTime: string }> {
    await this.prisma.$transaction(async (tx) => {
      for (const club of payload.clubs ?? []) {
        await this.applyClub(tx, userId, club);
      }
      for (const session of payload.trainingSessions ?? []) {
        await this.applyTrainingSession(tx, userId, session);
      }
      for (const block of payload.shotBlocks ?? []) {
        await this.applyShotBlock(tx, userId, block);
      }
      for (const result of payload.skillTestResults ?? []) {
        await this.applySkillTestResult(tx, userId, result);
      }
      for (const result of payload.quizResults ?? []) {
        await this.applyQuizResult(tx, userId, result);
      }
    });

    return { serverTime: new Date().toISOString() };
  }

  private optionalDate(value?: string | null): Date | null {
    return value ? new Date(value) : null;
  }

  private wins(existing: Versioned | null, userId: string, incomingUpdatedAt: string): boolean {
    if (!existing) {
      return true;
    }
    if (existing.userId !== userId) {
      return false;
    }
    return new Date(incomingUpdatedAt).getTime() > existing.updatedAt.getTime();
  }

  private async applyClub(
    tx: Prisma.TransactionClient,
    userId: string,
    input: ClubInputDto
  ): Promise<void> {
    const existing = await tx.club.findUnique({ where: { id: input.id } });
    if (!this.wins(existing, userId, input.updatedAt)) {
      return;
    }
    const data = {
      type: input.type,
      label: input.label,
      position: input.position,
      updatedAt: new Date(input.updatedAt),
      deletedAt: this.optionalDate(input.deletedAt),
    };
    await tx.club.upsert({
      where: { id: input.id },
      create: { id: input.id, userId, ...data },
      update: data,
    });
  }

  private async applyTrainingSession(
    tx: Prisma.TransactionClient,
    userId: string,
    input: TrainingSessionInputDto
  ): Promise<void> {
    const existing = await tx.trainingSession.findUnique({ where: { id: input.id } });
    if (!this.wins(existing, userId, input.updatedAt)) {
      return;
    }
    const data = {
      startedAt: new Date(input.startedAt),
      note: input.note ?? null,
      updatedAt: new Date(input.updatedAt),
      deletedAt: this.optionalDate(input.deletedAt),
    };
    await tx.trainingSession.upsert({
      where: { id: input.id },
      create: { id: input.id, userId, ...data },
      update: data,
    });
  }

  private async applyShotBlock(
    tx: Prisma.TransactionClient,
    userId: string,
    input: ShotBlockInputDto
  ): Promise<void> {
    const existing = await tx.shotBlock.findUnique({ where: { id: input.id } });
    if (!this.wins(existing, userId, input.updatedAt)) {
      return;
    }
    const data = {
      sessionId: input.sessionId,
      clubId: input.clubId,
      ballCount: input.ballCount,
      solidCount: input.solidCount,
      leftCount: input.leftCount,
      centerCount: input.centerCount,
      rightCount: input.rightCount,
      distanceMeters: input.distanceMeters ?? null,
      updatedAt: new Date(input.updatedAt),
      deletedAt: this.optionalDate(input.deletedAt),
    };
    await tx.shotBlock.upsert({
      where: { id: input.id },
      create: { id: input.id, userId, ...data },
      update: data,
    });
  }

  private async applySkillTestResult(
    tx: Prisma.TransactionClient,
    userId: string,
    input: SkillTestResultInputDto
  ): Promise<void> {
    const existing = await tx.skillTestResult.findUnique({ where: { id: input.id } });
    if (!this.wins(existing, userId, input.updatedAt)) {
      return;
    }
    const data = {
      testKey: input.testKey,
      score: input.score,
      takenAt: new Date(input.takenAt),
      updatedAt: new Date(input.updatedAt),
      deletedAt: this.optionalDate(input.deletedAt),
    };
    await tx.skillTestResult.upsert({
      where: { id: input.id },
      create: { id: input.id, userId, ...data },
      update: data,
    });
  }

  private async applyQuizResult(
    tx: Prisma.TransactionClient,
    userId: string,
    input: QuizResultInputDto
  ): Promise<void> {
    const existing = await tx.quizResult.findUnique({ where: { id: input.id } });
    if (!this.wins(existing, userId, input.updatedAt)) {
      return;
    }
    const data = {
      quizId: input.quizId,
      section: input.section,
      level: input.level,
      correct: input.correct,
      answeredAt: new Date(input.answeredAt),
      updatedAt: new Date(input.updatedAt),
      deletedAt: this.optionalDate(input.deletedAt),
    };
    await tx.quizResult.upsert({
      where: { id: input.id },
      create: { id: input.id, userId, ...data },
      update: data,
    });
  }
}
