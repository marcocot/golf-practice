export type ClubType =
  | 'DRIVER'
  | 'HYBRID_4'
  | 'HYBRID_5'
  | 'IRON_5'
  | 'IRON_6'
  | 'IRON_7'
  | 'IRON_8'
  | 'IRON_9'
  | 'PW'
  | 'WEDGE_50'
  | 'WEDGE_56'
  | 'LOB';

export interface ClubDefinition {
  type: ClubType;
  label: string;
}

// Default beginner bag, in the order they appear on the range.
export const DEFAULT_BAG: ClubDefinition[] = [
  { type: 'DRIVER', label: 'Driver' },
  { type: 'HYBRID_4', label: 'Hybrid 4' },
  { type: 'HYBRID_5', label: 'Hybrid 5' },
  { type: 'IRON_5', label: '5 iron' },
  { type: 'IRON_6', label: '6 iron' },
  { type: 'IRON_7', label: '7 iron' },
  { type: 'IRON_8', label: '8 iron' },
  { type: 'IRON_9', label: '9 iron' },
  { type: 'PW', label: 'Pitching wedge' },
  { type: 'WEDGE_50', label: '50°' },
  { type: 'WEDGE_56', label: '56°' },
  { type: 'LOB', label: 'Lob wedge' },
];

export function clubLabel(type: ClubType): string {
  return DEFAULT_BAG.find((club) => club.type === type)?.label ?? type;
}
