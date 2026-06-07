import type { ClubType } from '@/domain/clubs';

export interface CarryRange {
  beginner: [number, number];
  advanced: [number, number];
  pro: [number, number];
}

// Reference carry distances in metres for a generic adult male player.
// Orientation only: real numbers vary a lot with swing speed, ball and conditions.
export const CARRY_RANGES: Record<ClubType, CarryRange> = {
  DRIVER: { beginner: [150, 190], advanced: [200, 230], pro: [260, 290] },
  HYBRID_4: { beginner: [130, 160], advanced: [170, 195], pro: [215, 235] },
  HYBRID_5: { beginner: [120, 150], advanced: [160, 185], pro: [205, 225] },
  IRON_5: { beginner: [120, 145], advanced: [155, 175], pro: [185, 200] },
  IRON_6: { beginner: [110, 135], advanced: [145, 165], pro: [175, 190] },
  IRON_7: { beginner: [100, 125], advanced: [135, 155], pro: [165, 180] },
  IRON_8: { beginner: [90, 115], advanced: [125, 145], pro: [150, 170] },
  IRON_9: { beginner: [80, 105], advanced: [110, 130], pro: [135, 155] },
  PW: { beginner: [70, 95], advanced: [100, 120], pro: [125, 140] },
  WEDGE_50: { beginner: [55, 80], advanced: [85, 105], pro: [105, 120] },
  WEDGE_56: { beginner: [40, 65], advanced: [70, 90], pro: [85, 100] },
  LOB: { beginner: [25, 50], advanced: [50, 70], pro: [60, 80] },
};

export function carryRange(type: ClubType): CarryRange {
  return CARRY_RANGES[type];
}
