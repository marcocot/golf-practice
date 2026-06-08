import type { Language } from '@/i18n/translations';

// Quick-reference card for the three penalty levels and the common relief
// situations, distilled from the R&A / USGA Rules of Golf (2019/2023).
export type PenaltyLevel = 'one' | 'general' | 'dq';

export interface RuleCase {
  situation: string;
  rule: string;
}

export interface LevelBlock {
  level: PenaltyLevel;
  heading: string;
  oneLiner: string;
  cases: RuleCase[];
}

export interface ReliefOption {
  name: string;
  how: string;
  rule: string;
}

export type Outcome = 'none' | 'general' | 'dash';

export interface GreenRow {
  topic: string;
  what: string;
  outcome: Outcome;
}

export interface UnplayableRow {
  option: string;
  drop: string;
  penalty: string;
  extra?: boolean;
}

export interface ReliefAreaElement {
  name: string;
  meaning: string;
}

export interface MatterType {
  name: string;
  rule: string;
  relief: 'free' | 'none';
  examples: string;
  action: string;
}

export interface MatterMatrix {
  colNatural: string;
  colArtificial: string;
  rowLoose: string;
  rowFixed: string;
  naturalLoose: string;
  artificialLoose: string;
  naturalFixed: string;
  artificialFixed: string;
}

export interface LengthRow {
  measure: string;
  when: string;
  examples: string;
}

export interface DropStep {
  step: string;
  detail: string;
}

export interface RulesContent {
  pageTitle: string;
  pageSubtitle: string;

  levelsTitle: string;
  unlock: string;
  levels: LevelBlock[];

  flowTitle: string;
  flow: {
    trigger: string;
    relief: string;
    play: string;
    dqBranch: string;
    one: string;
    graveQ: string;
    general: string;
    dq: string;
    yes: string;
    no: string;
  };

  casesTitle: string;
  colSituation: string;
  colRule: string;

  reliefTitle: string;
  reliefIntro: string;
  yellow: { title: string; badge: string; options: ReliefOption[] };
  red: { title: string; badge: string; options: ReliefOption[]; note: string };
  colOption: string;
  colHow: string;

  bunkerTitle: string;
  bunkerForbiddenTitle: string;
  bunkerForbidden: string[];
  bunkerAllowedTitle: string;
  bunkerAllowed: string[];
  bunkerUnplayableTitle: string;
  bunkerUnplayable: UnplayableRow[];
  bunkerNote: string;
  colDrop: string;
  colPenalty: string;

  greenTitle: string;
  greenRows: GreenRow[];
  colTopic: string;
  colWhat: string;
  colOutcome: string;
  outcomeNone: string;
  outcomeGeneral: string;

  matterTitle: string;
  matterIntro: string;
  matterMatrix: MatterMatrix;
  matterReliefFree: string;
  matterReliefNone: string;
  matterTypes: MatterType[];

  reliefAreaTitle: string;
  reliefAreaIntro: string;
  reliefAreaDiagramHole: string;
  reliefAreaDiagramRef: string;
  reliefAreaDiagramArea: string;
  reliefAreaDiagramForbidden: string;
  reliefAreaElements: ReliefAreaElement[];
  clubLengthNote: string;
  lengthsTitle: string;
  lengths: LengthRow[];
  colMeasure: string;
  colWhen: string;
  colExamples: string;
  dropTitle: string;
  dropSteps: DropStep[];
  dropNote: string;

  tricksTitle: string;
  tricks: string[];

  disclaimer: string;
}

const it: RulesContent = {
  pageTitle: 'Regole e penalità',
  pageSubtitle: 'Regole del Golf R&A / USGA (ed. 2019/2023) · scheda di consultazione rapida.',

  levelsTitle: 'Solo 3 livelli di penalità',
  unlock:
    'Il dubbio «2 colpi vs penalità generale» sparisce: penalità generale = 2 colpi (stroke play) = perdita della buca (match play). Stessa cosa, due nomi a seconda del formato.',
  levels: [
    {
      level: 'one',
      heading: '1 colpo',
      oneLiner:
        'Io e la mia palla: rilievi che scelgo io (area di penalità, ingiocabile, fuori limite/persa) o muovo la mia palla ferma.',
      cases: [
        { situation: 'Rilievo da area di penalità (gialla o rossa)', rule: '17.1d' },
        { situation: 'Palla ingiocabile — 3 opzioni standard', rule: '19.2 / 19.3a' },
        { situation: 'Colpo e distanza: palla fuori limite o persa', rule: '18.1 / 18.2' },
        {
          situation:
            'Sollevi/muovi la tua palla ferma senza permesso, o la fai muovere per sbaglio (poi la rimetti)',
          rule: '9.4b',
        },
      ],
    },
    {
      level: 'general',
      heading: 'Penalità generale',
      oneLiner:
        '2 colpi / perdita buca: hai preso un vantaggio o sbagliato una regola di gioco (palla o luogo sbagliato, migliorare il lie, toccare sabbia/green, consiglio, 15° bastone).',
      cases: [
        { situation: 'Giocare la palla sbagliata', rule: '6.3c' },
        { situation: 'Giocare da luogo sbagliato (non grave)', rule: '14.7a' },
        { situation: 'Migliorare lie, stance, area di swing o linea di gioco', rule: '8.1a' },
        { situation: 'Toccare la sabbia del bunker prima del colpo / testarla', rule: '12.2b' },
        {
          situation: 'Provare il green (sfregare la superficie o far rotolare una palla)',
          rule: '13.1e',
        },
        { situation: 'Chiedere/dare consiglio indebito', rule: '10.2a' },
        { situation: 'Caddie posizionato dietro al giocatore allo stance', rule: '10.2b' },
        { situation: 'Più di 14 bastoni — per buca, max 2 buche (→ max 4 colpi)', rule: '4.1b' },
        { situation: 'Partenza in ritardo entro 5 minuti', rule: '5.3a' },
        { situation: 'Gioco lento ripetuto / ritardo eccessivo', rule: '5.6a' },
        { situation: 'Deviare/fermare deliberatamente la palla in movimento', rule: '11.2' },
      ],
    },
    {
      level: 'dq',
      heading: 'Squalifica',
      oneLiner:
        'Punteggio falsato, attrezzatura non conforme, accordo per ignorare una regola, grave scorrettezza o grave violazione non corretta.',
      cases: [
        {
          situation: 'Cartellino con punteggio più basso del reale, o non firmato/non consegnato',
          rule: '3.3b',
        },
        {
          situation:
            'Non imbucare e non correggere prima del tee successivo / di lasciare il green',
          rule: '3.3c',
        },
        { situation: 'Usare bastone/pallina non conforme', rule: '4.1a / 4.2' },
        { situation: 'Accordarsi per ignorare una regola o una penalità', rule: '1.3b' },
        { situation: 'Grave scorrettezza di comportamento', rule: '1.2a' },
        { situation: 'Grave violazione del luogo sbagliato non corretta', rule: '14.7b' },
        { situation: 'Partenza con più di 5 minuti di ritardo', rule: '5.3a' },
        { situation: 'Allenarsi sul percorso in stroke play (violazione ripetuta)', rule: '5.2b' },
      ],
    },
  ],

  flowTitle: 'Flowchart decisionale',
  flow: {
    trigger: 'È successo qualcosa di penalizzabile?',
    relief: 'Ho usato un rilievo o ho mosso la mia palla ferma?',
    play: 'Ho violato una regola di gioco (vantaggio, luogo, attrezzatura in eccesso)?',
    dqBranch: 'Riguarda punteggio, attrezzatura illegale, frode, accordi illeciti?',
    one: '1 colpo',
    graveQ: 'È grave e NON corretto?',
    general: 'Penalità generale — 2 colpi / perdita buca',
    dq: 'Squalifica',
    yes: 'sì',
    no: 'no',
  },

  casesTitle: 'Tabella dei casi per livello',
  colSituation: 'Situazione',
  colRule: 'Regola',

  reliefTitle: 'Opzioni di rilievo: area di penalità',
  reliefIntro:
    'Tutte le opzioni da area di penalità costano 1 colpo. Cambia solo il numero di opzioni: rossa = gialla + il rilievo laterale.',
  yellow: {
    title: 'Area GIALLA — 2 opzioni',
    badge: '+1 colpo',
    options: [
      {
        name: 'Colpo e distanza',
        how: 'Rigioco dal punto del colpo precedente.',
        rule: '17.1d(1)',
      },
      {
        name: 'Dietro sulla linea',
        how: 'Tengo il punto in cui la palla ha attraversato il margine tra me e la buca, vado indietro quanto voglio su quella linea e droppo.',
        rule: '17.1d(2)',
      },
    ],
  },
  red: {
    title: 'Area ROSSA — 3 opzioni',
    badge: '+1 colpo',
    options: [
      { name: 'Colpo e distanza', how: 'Come sopra.', rule: '17.1d(1)' },
      { name: 'Dietro sulla linea', how: 'Come sopra.', rule: '17.1d(2)' },
      {
        name: 'Rilievo laterale',
        how: 'Solo rossa: entro 2 lunghezze di bastone dal punto stimato di attraversamento del margine, non più vicino alla buca.',
        rule: '17.1d(3)',
      },
    ],
    note: 'Il vecchio drop sul lato opposto equidistante è stato eliminato nel 2019, salvo Local Rule.',
  },
  colOption: 'Opzione',
  colHow: 'Come',

  bunkerTitle: 'Bunker',
  bunkerForbiddenTitle: 'Vietato → penalità generale (12.2b)',
  bunkerForbidden: [
    'Toccare la sabbia per testarne le condizioni',
    'Toccare la sabbia con il bastone subito davanti/dietro la palla',
    'Toccare la sabbia nel backswing di prova',
    "Toccare la sabbia nel movimento all'indietro per il colpo",
  ],
  bunkerAllowedTitle: 'Consentito (nessuna penalità)',
  bunkerAllowed: [
    'Rimuovere impedimenti sciolti e ostruzioni (dal 2019)',
    'Appoggiarsi al bastone per riposare/stabilizzarsi',
    'Toccare la sabbia cadendo o per cura del campo, fuori dall’azione',
    'Marcare il proprio percorso entrando/uscendo',
  ],
  bunkerUnplayableTitle: 'Palla ingiocabile nel bunker (19.3)',
  bunkerUnplayable: [
    { option: 'Colpo e distanza', drop: 'punto precedente', penalty: '+1' },
    { option: 'Dietro sulla linea — dentro il bunker', drop: 'nel bunker', penalty: '+1' },
    { option: 'Laterale (2 lunghezze) — dentro il bunker', drop: 'nel bunker', penalty: '+1' },
    {
      option: 'Extra: dietro sulla linea FUORI dal bunker',
      drop: 'fuori dal bunker',
      penalty: '+2',
      extra: true,
    },
  ],
  bunkerNote:
    'Per uscire dal bunker con palla ingiocabile paghi 2 colpi (19.3b); restando dentro, 1 colpo (19.3a).',
  colDrop: 'Drop',
  colPenalty: 'Penalità',

  greenTitle: 'Green (putting green) — Regola 13',
  greenRows: [
    {
      topic: 'Riparare danni (13.1c)',
      what: 'Puoi riparare pitch mark, segni di scarpe, vecchi buchi, danni da animali. NON danni naturali / fori di aerazione.',
      outcome: 'none',
    },
    {
      topic: 'Palla/marker mossi per sbaglio (13.1d)',
      what: 'Sul green è concesso: rimetti a posto.',
      outcome: 'none',
    },
    {
      topic: 'Provare il green (13.1e)',
      what: 'Vietato sfregare la superficie o far rotolare una palla di prova.',
      outcome: 'general',
    },
    {
      topic: 'Bandiera (13.2)',
      what: 'Dal 2019 puoi puttare con la bandiera nel buca; nessuna penalità se la palla la colpisce.',
      outcome: 'none',
    },
    {
      topic: 'Palla sul bordo (13.3)',
      what: 'Tempo ragionevole per raggiungere il buca + 10 secondi di attesa perché cada.',
      outcome: 'dash',
    },
    {
      topic: 'Pulire / sabbia (13.1b)',
      what: 'Puoi marcare, sollevare e pulire la palla; puoi rimuovere sabbia e terra sciolta (solo qui).',
      outcome: 'none',
    },
  ],
  colTopic: 'Tema',
  colWhat: 'Cosa puoi / non puoi fare',
  colOutcome: 'Esito',
  outcomeNone: 'nessuna penalità',
  outcomeGeneral: 'pen. generale',

  matterTitle: 'Impedimenti e ostruzioni',
  matterIntro:
    'Due domande: è naturale o artificiale? È spostabile o fisso? La combinazione dice cosa puoi fare. La regola d’oro: naturale sciolto e artificiale (movibile o no) danno sollievo gratuito; il naturale fisso/in crescita è parte del campo.',
  matterMatrix: {
    colNatural: 'Naturale',
    colArtificial: 'Artificiale',
    rowLoose: 'Sciolto / movibile',
    rowFixed: 'Fisso / inamovibile',
    naturalLoose: 'Impedimento sciolto · 15.1',
    artificialLoose: 'Ostruzione movibile · 15.2',
    naturalFixed: 'Parte del campo · nessun rilievo',
    artificialFixed: 'Ostruzione inamovibile · 16.1',
  },
  matterReliefFree: 'rilievo gratuito',
  matterReliefNone: 'nessun rilievo',
  matterTypes: [
    {
      name: 'Impedimento sciolto (15.1)',
      rule: '15.1',
      relief: 'free',
      examples: 'Sassi, foglie, rami staccati, pigne, escrementi, vermi e insetti, palline d’aria.',
      action:
        'Puoi rimuoverlo ovunque, senza penalità. Se muovendolo fai muovere la palla (fuori dal green) → +1 colpo e rimetti.',
    },
    {
      name: 'Ostruzione movibile (15.2)',
      rule: '15.2',
      relief: 'free',
      examples: 'Rastrelli, bottiglie, paletti rimovibili, attrezzi, segnaposto.',
      action:
        'Puoi rimuoverla ovunque, senza penalità. Se la palla si muove, la rimetti senza penalità.',
    },
    {
      name: 'Ostruzione inamovibile (16.1)',
      rule: '16.1',
      relief: 'free',
      examples: 'Cart path, irrigatori, edifici, paletti di distanza fissi, panchine.',
      action:
        'Se interferisce: rilievo gratuito. Punto più vicino di rilievo completo + 1 lunghezza di bastone, non più vicino alla buca.',
    },
    {
      name: 'Naturale fisso / in crescita',
      rule: '—',
      relief: 'none',
      examples: 'Alberi, cespugli, erba attaccata, radici fisse, rocce infisse nel terreno.',
      action:
        'Nessun rilievo gratuito: è il campo. Giochi com’è, oppure dichiari ingiocabile (+1 colpo).',
    },
  ],

  reliefAreaTitle: 'Area dove ovviare — Regola 14.3',
  reliefAreaIntro:
    'È la zona in cui DEVI droppare quando ovvi. Sempre definita da 3 elementi: punto di riferimento, dimensione, limiti.',
  reliefAreaDiagramHole: 'buca',
  reliefAreaDiagramRef: 'punto di riferimento',
  reliefAreaDiagramArea: 'area dove ovviare (1–2 lunghezze)',
  reliefAreaDiagramForbidden: 'non più vicino alla buca',
  reliefAreaElements: [
    {
      name: 'Punto di riferimento',
      meaning:
        'Il punto da cui misuri: punto più vicino di rilievo completo (gratuito), oppure attraversamento del margine / posizione della palla (laterale).',
    },
    {
      name: 'Dimensione',
      meaning: '1 o 2 lunghezze di bastone dal punto di riferimento.',
    },
    {
      name: 'Limiti',
      meaning:
        'Non più vicino alla buca del punto di riferimento; e nell’area del campo richiesta dalla regola.',
    },
  ],
  clubLengthNote:
    'Lunghezza di bastone = il bastone più lungo della sacca escluso il putter (di solito il driver), uguale per tutta la tornata.',
  lengthsTitle: 'Quante lunghezze? Dipende dalla regola',
  lengths: [
    {
      measure: '1 lunghezza',
      when: 'Rilievo SENZA penalità (gratuito)',
      examples:
        'Ostruzione inamovibile, terreno in riparazione, condizioni anomale (16.1), palla incorporata (16.3), wrong green (13.1f)',
    },
    {
      measure: '2 lunghezze',
      when: 'Rilievo laterale CON penalità',
      examples: 'Area di penalità rossa laterale (17.1d(3)), palla ingiocabile laterale (19.2c)',
    },
  ],
  colMeasure: 'Misura',
  colWhen: 'Quando',
  colExamples: 'Esempi',
  dropTitle: 'Come si droppa (14.3b–c)',
  dropSteps: [
    {
      step: 'Altezza del ginocchio',
      detail:
        'Lascia cadere la palla dall’altezza del ginocchio stando in piedi; non deve toccare te o l’attrezzatura prima del suolo.',
    },
    { step: "Dentro l'area", detail: "Deve cadere dentro e fermarsi dentro l'area dove ovviare." },
    { step: 'Se esce → ridroppa', detail: 'Se rotola fuori, droppa una 2ª volta.' },
    {
      step: 'Se esce ancora → piazza',
      detail: 'Al 2° drop fuori, piazza la palla nel punto in cui ha toccato il suolo.',
    },
  ],
  dropNote:
    'Drop errato (troppo in alto, o fuori area senza correggere): se giochi da lì → penalità generale per luogo sbagliato.',

  tricksTitle: 'Trucchi per ricordare',
  tricks: [
    '1 colpo = io e la mia palla: rilievi che scelgo io o casi in cui muovo la mia palla ferma.',
    'Generale = vantaggio rubacchiato o gioco sbagliato → 2 colpi o buca persa.',
    'Squalifica = ho mentito, barato o usato roba illegale.',
    'Match vs stroke: ogni «2 colpi» in match play diventa «perdo la buca». Stesse cause.',
    'Gialla < Rossa: 2 opzioni vs 3 (la rossa aggiunge il laterale). Sempre +1 colpo.',
    'Bunker ingiocabile: dentro = +1, fuori = +2.',
    'Grave + non corretto = sale a squalifica.',
    'Area dove ovviare: 1 lunghezza = gratis, 2 lunghezze = laterale con penalità. Drop dal ginocchio, deve fermarsi dentro.',
  ],

  disclaimer:
    'Scheda di studio da appunti personali sulle Regole del Golf R&A/USGA 2019/2023. Verifica sempre il testo ufficiale per i casi limite.',
};

const en: RulesContent = {
  pageTitle: 'Rules & penalties',
  pageSubtitle: 'Rules of Golf R&A / USGA (2019/2023 ed.) · quick-reference card.',

  levelsTitle: 'Only 3 penalty levels',
  unlock:
    'The «2 strokes vs general penalty» doubt disappears: general penalty = 2 strokes (stroke play) = loss of hole (match play). Same thing, two names depending on the format.',
  levels: [
    {
      level: 'one',
      heading: '1 stroke',
      oneLiner:
        'Me and my ball: relief I choose myself (penalty area, unplayable, out of bounds/lost) or moving my own ball at rest.',
      cases: [
        { situation: 'Relief from a penalty area (yellow or red)', rule: '17.1d' },
        { situation: 'Unplayable ball — 3 standard options', rule: '19.2 / 19.3a' },
        { situation: 'Stroke and distance: ball out of bounds or lost', rule: '18.1 / 18.2' },
        {
          situation:
            'Lift/move your ball at rest without permission, or move it accidentally (then replace it)',
          rule: '9.4b',
        },
      ],
    },
    {
      level: 'general',
      heading: 'General penalty',
      oneLiner:
        '2 strokes / loss of hole: you gained an advantage or broke a playing rule (wrong ball or place, improving the lie, touching sand/green, advice, 15th club).',
      cases: [
        { situation: 'Playing the wrong ball', rule: '6.3c' },
        { situation: 'Playing from a wrong place (not serious)', rule: '14.7a' },
        { situation: 'Improving lie, stance, swing area or line of play', rule: '8.1a' },
        { situation: 'Touching the bunker sand before the stroke / testing it', rule: '12.2b' },
        { situation: 'Testing the green (rubbing the surface or rolling a ball)', rule: '13.1e' },
        { situation: 'Asking for / giving improper advice', rule: '10.2a' },
        { situation: 'Caddie standing behind the player at the stance', rule: '10.2b' },
        { situation: 'More than 14 clubs — per hole, max 2 holes (→ max 4 strokes)', rule: '4.1b' },
        { situation: 'Starting late within 5 minutes', rule: '5.3a' },
        { situation: 'Repeated slow play / undue delay', rule: '5.6a' },
        { situation: 'Deliberately deflecting/stopping a ball in motion', rule: '11.2' },
      ],
    },
    {
      level: 'dq',
      heading: 'Disqualification',
      oneLiner:
        'Falsified score, non-conforming equipment, agreeing to ignore a rule, serious misconduct or a serious breach left uncorrected.',
      cases: [
        { situation: 'Scorecard lower than actual, or unsigned/not returned', rule: '3.3b' },
        {
          situation: 'Not holing out and not correcting before the next tee / leaving the green',
          rule: '3.3c',
        },
        { situation: 'Using a non-conforming club/ball', rule: '4.1a / 4.2' },
        { situation: 'Agreeing to ignore a rule or penalty', rule: '1.3b' },
        { situation: 'Serious misconduct', rule: '1.2a' },
        { situation: 'Serious wrong-place breach left uncorrected', rule: '14.7b' },
        { situation: 'Starting more than 5 minutes late', rule: '5.3a' },
        { situation: 'Practising on the course in stroke play (repeated breach)', rule: '5.2b' },
      ],
    },
  ],

  flowTitle: 'Decision flowchart',
  flow: {
    trigger: 'Did something penalizable happen?',
    relief: 'Did I take relief or move my own ball at rest?',
    play: 'Did I break a playing rule (advantage, place, excess equipment)?',
    dqBranch: 'Is it about the score, illegal equipment, fraud, illicit agreements?',
    one: '1 stroke',
    graveQ: 'Serious and NOT corrected?',
    general: 'General penalty — 2 strokes / loss of hole',
    dq: 'Disqualification',
    yes: 'yes',
    no: 'no',
  },

  casesTitle: 'Cases by level',
  colSituation: 'Situation',
  colRule: 'Rule',

  reliefTitle: 'Relief options: penalty area',
  reliefIntro:
    'Every penalty-area option costs 1 stroke. Only the number of options changes: red = yellow + lateral relief.',
  yellow: {
    title: 'YELLOW area — 2 options',
    badge: '+1 stroke',
    options: [
      {
        name: 'Stroke and distance',
        how: 'Replay from where the previous stroke was made.',
        rule: '17.1d(1)',
      },
      {
        name: 'Back-on-the-line',
        how: 'Keep the point where the ball last crossed the edge between you and the hole, go back as far as you like on that line and drop.',
        rule: '17.1d(2)',
      },
    ],
  },
  red: {
    title: 'RED area — 3 options',
    badge: '+1 stroke',
    options: [
      { name: 'Stroke and distance', how: 'As above.', rule: '17.1d(1)' },
      { name: 'Back-on-the-line', how: 'As above.', rule: '17.1d(2)' },
      {
        name: 'Lateral relief',
        how: 'Red only: within 2 club-lengths of the estimated crossing point, not nearer the hole.',
        rule: '17.1d(3)',
      },
    ],
    note: 'The old equidistant drop on the opposite side was removed in 2019, unless a Local Rule applies.',
  },
  colOption: 'Option',
  colHow: 'How',

  bunkerTitle: 'Bunker',
  bunkerForbiddenTitle: 'Forbidden → general penalty (12.2b)',
  bunkerForbidden: [
    'Touching the sand to test its condition',
    'Touching the sand with the club right in front of/behind the ball',
    'Touching the sand on a practice backswing',
    'Touching the sand on the backswing for the stroke',
  ],
  bunkerAllowedTitle: 'Allowed (no penalty)',
  bunkerAllowed: [
    'Removing loose impediments and obstructions (since 2019)',
    'Leaning on the club to rest/steady yourself',
    'Touching the sand when falling or caring for the course, outside the action',
    'Marking your path going in/out',
  ],
  bunkerUnplayableTitle: 'Unplayable ball in the bunker (19.3)',
  bunkerUnplayable: [
    { option: 'Stroke and distance', drop: 'previous spot', penalty: '+1' },
    { option: 'Back-on-the-line — inside the bunker', drop: 'in the bunker', penalty: '+1' },
    { option: 'Lateral (2 lengths) — inside the bunker', drop: 'in the bunker', penalty: '+1' },
    {
      option: 'Extra: back-on-the-line OUTSIDE the bunker',
      drop: 'outside the bunker',
      penalty: '+2',
      extra: true,
    },
  ],
  bunkerNote:
    'To get out of the bunker with an unplayable ball you pay 2 strokes (19.3b); staying inside, 1 stroke (19.3a).',
  colDrop: 'Drop',
  colPenalty: 'Penalty',

  greenTitle: 'Green (putting green) — Rule 13',
  greenRows: [
    {
      topic: 'Repairing damage (13.1c)',
      what: 'You may repair pitch marks, shoe marks, old holes, animal damage. NOT natural damage / aeration holes.',
      outcome: 'none',
    },
    {
      topic: 'Ball/marker moved accidentally (13.1d)',
      what: 'Allowed on the green: replace it.',
      outcome: 'none',
    },
    {
      topic: 'Testing the green (13.1e)',
      what: 'No rubbing the surface or rolling a test ball.',
      outcome: 'general',
    },
    {
      topic: 'Flagstick (13.2)',
      what: 'Since 2019 you may putt with the flagstick in the hole; no penalty if the ball hits it.',
      outcome: 'none',
    },
    {
      topic: 'Ball on the edge (13.3)',
      what: 'Reasonable time to reach the hole + 10 seconds waiting for it to drop.',
      outcome: 'dash',
    },
    {
      topic: 'Cleaning / sand (13.1b)',
      what: 'You may mark, lift and clean the ball; you may remove sand and loose soil (only here).',
      outcome: 'none',
    },
  ],
  colTopic: 'Topic',
  colWhat: 'What you can / cannot do',
  colOutcome: 'Outcome',
  outcomeNone: 'no penalty',
  outcomeGeneral: 'general pen.',

  matterTitle: 'Loose impediments & obstructions',
  matterIntro:
    'Two questions: natural or artificial? Movable or fixed? The combination tells you what you can do. Rule of thumb: loose natural and any artificial (movable or not) give free relief; fixed/growing natural is part of the course.',
  matterMatrix: {
    colNatural: 'Natural',
    colArtificial: 'Artificial',
    rowLoose: 'Loose / movable',
    rowFixed: 'Fixed / immovable',
    naturalLoose: 'Loose impediment · 15.1',
    artificialLoose: 'Movable obstruction · 15.2',
    naturalFixed: 'Part of the course · no relief',
    artificialFixed: 'Immovable obstruction · 16.1',
  },
  matterReliefFree: 'free relief',
  matterReliefNone: 'no relief',
  matterTypes: [
    {
      name: 'Loose impediment (15.1)',
      rule: '15.1',
      relief: 'free',
      examples:
        'Stones, leaves, detached branches, pine cones, droppings, worms and insects, clumps of air.',
      action:
        'You may remove it anywhere, no penalty. If moving it causes your ball to move (off the green) → +1 stroke and replace.',
    },
    {
      name: 'Movable obstruction (15.2)',
      rule: '15.2',
      relief: 'free',
      examples: 'Rakes, bottles, removable stakes, tools, markers.',
      action:
        'You may remove it anywhere, no penalty. If the ball moves, replace it with no penalty.',
    },
    {
      name: 'Immovable obstruction (16.1)',
      rule: '16.1',
      relief: 'free',
      examples: 'Cart paths, sprinkler heads, buildings, fixed distance posts, benches.',
      action:
        'If it interferes: free relief. Nearest point of complete relief + 1 club-length, not nearer the hole.',
    },
    {
      name: 'Fixed / growing natural',
      rule: '—',
      relief: 'none',
      examples: 'Trees, bushes, attached grass, fixed roots, rocks set in the ground.',
      action:
        'No free relief: it is the course. Play it as it lies, or declare it unplayable (+1 stroke).',
    },
  ],

  reliefAreaTitle: 'Relief area — Rule 14.3',
  reliefAreaIntro:
    'The zone where you MUST drop when taking relief. Always defined by 3 elements: reference point, size, limits.',
  reliefAreaDiagramHole: 'hole',
  reliefAreaDiagramRef: 'reference point',
  reliefAreaDiagramArea: 'relief area (1–2 lengths)',
  reliefAreaDiagramForbidden: 'not nearer the hole',
  reliefAreaElements: [
    {
      name: 'Reference point',
      meaning:
        'The point you measure from: nearest point of complete relief (free relief), or the crossing point / ball position (lateral relief).',
    },
    {
      name: 'Size',
      meaning: '1 or 2 club-lengths from the reference point.',
    },
    {
      name: 'Limits',
      meaning:
        'Not nearer the hole than the reference point; and in the area of the course required by the rule.',
    },
  ],
  clubLengthNote:
    'Club-length = the longest club in the bag excluding the putter (usually the driver), the same for the whole round.',
  lengthsTitle: 'How many lengths? Depends on the rule',
  lengths: [
    {
      measure: '1 length',
      when: 'Relief WITHOUT penalty (free)',
      examples:
        'Immovable obstruction, ground under repair, abnormal course conditions (16.1), embedded ball (16.3), wrong green (13.1f)',
    },
    {
      measure: '2 lengths',
      when: 'Lateral relief WITH penalty',
      examples: 'Red penalty area lateral (17.1d(3)), unplayable lateral (19.2c)',
    },
  ],
  colMeasure: 'Measure',
  colWhen: 'When',
  colExamples: 'Examples',
  dropTitle: 'How to drop (14.3b–c)',
  dropSteps: [
    {
      step: 'Knee height',
      detail:
        'Let the ball fall from knee height while standing; it must not touch you or your equipment before the ground.',
    },
    {
      step: 'Inside the area',
      detail: 'It must fall inside and come to rest inside the relief area.',
    },
    { step: 'If it leaves → re-drop', detail: 'If it rolls out, drop a 2nd time.' },
    {
      step: 'If it leaves again → place',
      detail: 'On the 2nd drop out, place the ball where it first touched the ground.',
    },
  ],
  dropNote:
    'Wrong drop (too high, or out of the area without correcting): if you play from there → general penalty for wrong place.',

  tricksTitle: 'Memory tricks',
  tricks: [
    '1 stroke = me and my ball: relief I choose, or cases where I move my own ball at rest.',
    'General = stolen advantage or wrong play → 2 strokes or loss of hole.',
    'Disqualification = I lied, cheated or used illegal gear.',
    'Match vs stroke: every «2 strokes» in match play becomes «I lose the hole». Same causes.',
    'Yellow < Red: 2 options vs 3 (red adds the lateral). Always +1 stroke.',
    'Unplayable bunker: inside = +1, outside = +2.',
    'Serious + uncorrected = escalates to disqualification.',
    'Relief area: 1 length = free, 2 lengths = lateral with penalty. Drop from the knee, must stay inside.',
  ],

  disclaimer:
    'Study card from personal notes on the R&A/USGA Rules of Golf 2019/2023. Always check the official text for edge cases.',
};

export const RULES: Record<Language, RulesContent> = { en, it };
