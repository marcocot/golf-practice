import type { Language } from '@/i18n/translations';

export interface CheatSheetEntry {
  title: string;
  tips: string[];
}

// Quick reference to glance at between shots on the range.
export const CHEAT_SHEET: Record<Language, CheatSheetEntry[]> = {
  en: [
    {
      title: 'Setup',
      tips: [
        'Feet about shoulder width, balanced weight',
        'Ball centred for short irons, forward for the driver',
        'Neutral grip, relaxed shoulders',
      ],
    },
    {
      title: 'Alignment',
      tips: [
        'Pick a precise target before every shot',
        'Aim feet parallel to the target line, not at the target',
        'Check your shoulders — the most common source of error',
      ],
    },
    {
      title: 'Slice (ball curving right)',
      tips: [
        'Strengthen the grip: rotate hands to the right',
        'Feel like you close the face through impact',
        'Swing more from the inside, not over the line',
      ],
    },
    {
      title: 'Thin / topped shots',
      tips: [
        'Keep your height, do not stand up in the downswing',
        'Watch a fixed point behind the ball',
        'Finish the swing in balance',
      ],
    },
    {
      title: 'Poor contact',
      tips: [
        'Slow, steady tempo — do not force distance',
        'Hit the ball first, then the turf (with irons)',
        'Shorten the swing to find the centre again',
      ],
    },
  ],
  it: [
    {
      title: 'Setup',
      tips: [
        'Piedi larghi quanto le spalle, peso bilanciato',
        'Palla al centro per i ferri corti, avanti per il driver',
        'Presa neutra, spalle rilassate',
      ],
    },
    {
      title: 'Allineamento',
      tips: [
        'Scegli un bersaglio preciso prima di ogni colpo',
        'Allinea i piedi paralleli alla linea, non verso il bersaglio',
        'Controlla le spalle: la causa più comune di errore',
      ],
    },
    {
      title: 'Slice (palla che curva a destra)',
      tips: [
        'Rinforza la presa: ruota le mani a destra',
        'Sensazione di chiudere la faccia all’impatto',
        'Swing più dall’interno, non sopra la linea',
      ],
    },
    {
      title: 'Top (palla rasoterra)',
      tips: [
        'Mantieni l’altezza, non sollevarti in discesa',
        'Guarda un punto fisso dietro la palla',
        'Finisci il colpo in equilibrio',
      ],
    },
    {
      title: 'Contatto scarso',
      tips: [
        'Tempo lento e costante, non forzare la distanza',
        'Colpisci la palla, poi il terreno (con i ferri)',
        'Riduci la lunghezza dello swing per ritrovare il centro',
      ],
    },
  ],
};
