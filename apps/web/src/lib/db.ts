import Dexie, { type Table } from 'dexie';
import type { ClubType } from '@/domain/clubs';

export interface ClubRecord {
  id: string;
  type: ClubType;
  label: string;
  position: number;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TrainingSessionRecord {
  id: string;
  startedAt: string;
  note: string | null;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ShotBlockRecord {
  id: string;
  sessionId: string;
  clubId: string;
  ballCount: number;
  solidCount: number;
  leftCount: number;
  centerCount: number;
  rightCount: number;
  distanceMeters: number | null;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SkillTestResultRecord {
  id: string;
  testKey: string;
  score: number;
  takenAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface QuizResultRecord {
  id: string;
  quizId: number;
  section: string;
  level: string;
  correct: boolean;
  answeredAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface MetaRecord {
  key: string;
  value: string;
}

export class GolfDb extends Dexie {
  clubs!: Table<ClubRecord, string>;
  trainingSessions!: Table<TrainingSessionRecord, string>;
  shotBlocks!: Table<ShotBlockRecord, string>;
  skillTestResults!: Table<SkillTestResultRecord, string>;
  quizResults!: Table<QuizResultRecord, string>;
  meta!: Table<MetaRecord, string>;

  constructor(name = 'golf-practice') {
    super(name);
    this.version(1).stores({
      clubs: 'id, position, updatedAt',
      trainingSessions: 'id, startedAt, updatedAt',
      shotBlocks: 'id, sessionId, clubId, updatedAt',
      meta: 'key',
    });
    this.version(2).stores({
      skillTestResults: 'id, testKey, updatedAt',
    });
    this.version(3).stores({
      quizResults: 'id, quizId, updatedAt',
    });
  }
}

export const db = new GolfDb();
