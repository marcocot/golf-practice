import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ClubType } from '@prisma/client';

class SyncableDto {
  @IsUUID()
  id!: string;

  @IsDateString()
  updatedAt!: string;

  @IsOptional()
  @IsDateString()
  deletedAt?: string | null;
}

export class ClubInputDto extends SyncableDto {
  @IsEnum(ClubType)
  type!: ClubType;

  @IsString()
  label!: string;

  @IsInt()
  @Min(0)
  position!: number;
}

export class TrainingSessionInputDto extends SyncableDto {
  @IsDateString()
  startedAt!: string;

  @IsOptional()
  @IsString()
  note?: string | null;
}

export class ShotBlockInputDto extends SyncableDto {
  @IsUUID()
  sessionId!: string;

  @IsUUID()
  clubId!: string;

  @IsInt()
  @Min(1)
  @Max(100)
  ballCount!: number;

  @IsInt()
  @Min(0)
  solidCount!: number;

  @IsInt()
  @Min(0)
  leftCount!: number;

  @IsInt()
  @Min(0)
  centerCount!: number;

  @IsInt()
  @Min(0)
  rightCount!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  distanceMeters?: number | null;
}

export class SkillTestResultInputDto extends SyncableDto {
  @IsString()
  testKey!: string;

  @IsInt()
  @Min(0)
  @Max(100)
  score!: number;

  @IsDateString()
  takenAt!: string;
}

export class QuizResultInputDto extends SyncableDto {
  @IsInt()
  quizId!: number;

  @IsString()
  section!: string;

  @IsString()
  level!: string;

  @IsBoolean()
  correct!: boolean;

  @IsDateString()
  answeredAt!: string;
}

export class PushPayloadDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClubInputDto)
  clubs: ClubInputDto[] = [];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingSessionInputDto)
  trainingSessions: TrainingSessionInputDto[] = [];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShotBlockInputDto)
  shotBlocks: ShotBlockInputDto[] = [];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillTestResultInputDto)
  skillTestResults: SkillTestResultInputDto[] = [];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizResultInputDto)
  quizResults: QuizResultInputDto[] = [];
}
