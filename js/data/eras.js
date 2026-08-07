/**
 * Era registry — the single source of truth for how each historical era
 * SOUNDS and how the playable keyboard behaves inside it.
 *
 * Each era defines:
 *   id       — matches the `data-era` attribute of a <section> in index.html
 *   year     — display label used by the progress rail
 *   name     — short Chinese name shown in the keyboard dock
 *   range    — playable compass as [lowMidi, highMidi] (inclusive)
 *   timbre   — parameters consumed by AudioEngine's synthesiser
 *   motif    — a short characteristic phrase, [beatTime, midi, durBeats, velocity]
 *   motifBpm — tempo for the motif player
 *
 * Audio replacement convention (see README):
 *   assets/audio/motifs/{id}.mp3    — replaces the synthesised motif
 *   assets/audio/notes/{midi}.mp3   — replaces synthesised single notes
 *   assets/audio/ambience/{id}.mp3  — optional looping room tone per era
 */

const ENGLISH = document.documentElement.lang.startsWith('en');
const t = (zh, en) => ENGLISH ? en : zh;

// Timbre profile cheat-sheet:
//   model: 'struck'   — generic hammered-string additive model
//          'tine'     — electro-mechanical tine (Rhodes-like)
//          'fm'       — 2-operator FM electric piano (DX7-like)
//          'prepared' — muted, percussive prepared-piano thunk
//   brightness — lowpass cutoff as a multiple of the fundamental
//   decay      — release tail in seconds
//   inharmonicity — partial stretching; small early pianos ring "wirier"
//   hammer     — attack-noise amount 0..1
//   gain       — loudness of the instrument itself (era dynamics!)

export const ERAS = [
  {
    id: 'prelude',
    year: t('序', 'PROLOGUE'),
    name: t('序章', 'Prologue'),
    range: [21, 108],
    timbre: { model: 'struck', brightness: 9, decay: 3.2, inharmonicity: 0.00035, hammer: 0.5, gain: 0.9 },
    motifBpm: 66,
    motif: [
      [0, 57, 2, 0.5], [0, 64, 2, 0.4], [0.5, 69, 2, 0.5], [1, 73, 2.5, 0.55],
    ],
  },
  {
    id: 'cristofori',
    year: '1700',
    name: t('克里斯托福里 · 佛罗伦萨', 'Cristofori · Florence'),
    rangeLabel: t('约四个八度 · C2–C6', 'c. four octaves · C2–C6'),
    range: [36, 84],
    timbre: { model: 'struck', brightness: 5, decay: 1.6, inharmonicity: 0.0012, hammer: 0.75, gain: 0.42 },
    motifBpm: 76,
    motif: [
      // A gentle broken chord, narrow and quiet — paper hammers on thin strings
      [0, 60, 0.9, 0.45], [1, 64, 0.9, 0.5], [2, 67, 0.9, 0.55], [3, 72, 1.8, 0.62],
      [5, 71, 0.9, 0.4], [6, 67, 0.9, 0.35], [7, 64, 2.2, 0.3],
    ],
  },
  {
    id: 'maffei',
    year: '1711',
    name: t('马费伊的报道', 'Maffei’s published account'),
    rangeLabel: t('约四个八度 · C2–C6', 'c. four octaves · C2–C6'),
    range: [36, 84],
    timbre: { model: 'struck', brightness: 5, decay: 1.6, inharmonicity: 0.0012, hammer: 0.75, gain: 0.42 },
    motifBpm: 76,
    motif: [
      // The same instrument, heard twice: piano … e forte
      [0, 60, 0.8, 0.22], [1, 64, 0.8, 0.22], [2, 67, 1.6, 0.24],
      [4, 60, 0.8, 0.72], [5, 64, 0.8, 0.75], [6, 67, 2.4, 0.8],
    ],
  },
  {
    id: 'silbermann',
    year: '1730s',
    name: t('西尔伯曼 · 弗赖贝格', 'Silbermann · Freiberg'),
    rangeLabel: t('约四个半八度', 'c. four and a half octaves'),
    range: [36, 89],
    timbre: { model: 'struck', brightness: 6, decay: 1.9, inharmonicity: 0.0009, hammer: 0.7, gain: 0.5 },
    motifBpm: 60,
    motif: [
      // First notes of the "Royal Theme" from Bach's Musical Offering (1747)
      [0, 48, 1, 0.6], [1, 51, 1, 0.6], [2, 55, 1, 0.62], [3, 56, 1.5, 0.64],
      [4.5, 47, 1.5, 0.6], [6, 46, 2, 0.55],
    ],
  },
  {
    id: 'vienna',
    year: '1777',
    name: t('维也纳式击弦机 · 施泰因与莫扎特', 'Viennese action · Stein and Mozart'),
    rangeLabel: t('五个八度 · F1–F6', 'five octaves · F1–F6'),
    range: [29, 89],
    timbre: { model: 'struck', brightness: 7.5, decay: 1.3, inharmonicity: 0.0006, hammer: 0.55, gain: 0.58 },
    motifBpm: 116,
    motif: [
      // Opening gesture of Mozart K.545 over an Alberti bass
      [0, 72, 1.8, 0.6], [0, 48, 0.45, 0.4], [0.5, 55, 0.45, 0.32], [1, 52, 0.45, 0.34], [1.5, 55, 0.45, 0.32],
      [2, 76, 1.8, 0.62], [2, 48, 0.45, 0.4], [2.5, 55, 0.45, 0.32], [3, 52, 0.45, 0.34], [3.5, 55, 0.45, 0.32],
      [4, 79, 0.9, 0.64], [4, 47, 0.45, 0.4], [4.5, 55, 0.45, 0.32],
      [5, 83, 0.45, 0.6], [5.5, 84, 0.45, 0.62], [5, 50, 0.45, 0.34], [5.5, 55, 0.45, 0.3],
      [6, 84, 1.8, 0.66], [6, 48, 0.45, 0.42], [6.5, 55, 0.45, 0.3], [7, 52, 0.45, 0.32],
    ],
  },
  {
    id: 'london',
    year: '1818',
    name: t('英式击弦机 · 布罗德伍德与贝多芬', 'English action · Broadwood and Beethoven'),
    rangeLabel: t('六个八度 · C1–C7', 'six octaves · C1–C7'),
    range: [24, 96],
    timbre: { model: 'struck', brightness: 6.5, decay: 2.8, inharmonicity: 0.0005, hammer: 0.65, gain: 0.78 },
    motifBpm: 100,
    motif: [
      // A Hammerklavier-like B-flat fanfare — weight the English grand could carry
      [0, 34, 0.4, 0.85], [0.5, 46, 0.5, 0.9], [0.5, 53, 0.5, 0.85], [0.5, 58, 0.5, 0.85], [0.5, 62, 0.5, 0.9],
      [1.6, 46, 1.6, 0.92], [1.6, 58, 1.6, 0.9], [1.6, 65, 1.6, 0.88], [1.6, 70, 1.6, 0.92],
      [4, 24, 3, 0.8], [4, 36, 3, 0.75],
    ],
  },
  {
    id: 'erard',
    year: '1821',
    name: t('埃拉尔 · 双重擒纵', 'Érard · double escapement'),
    rangeLabel: t('六个半八度', 'c. six and a half octaves'),
    range: [24, 101],
    timbre: { model: 'struck', brightness: 8, decay: 3, inharmonicity: 0.0004, hammer: 0.55, gain: 0.8 },
    motifBpm: 138,
    motif: [
      // Rapid repeated notes — the very thing double escapement made possible
      [0, 76, 0.4, 0.5], [0.5, 76, 0.4, 0.55], [1, 76, 0.4, 0.6], [1.5, 76, 0.4, 0.65],
      [2, 76, 0.25, 0.7], [2.33, 76, 0.25, 0.72], [2.66, 76, 0.25, 0.74],
      [3, 76, 0.2, 0.76], [3.25, 76, 0.2, 0.78], [3.5, 76, 0.2, 0.8], [3.75, 76, 0.2, 0.8],
      [4, 77, 0.4, 0.8], [4.5, 79, 0.4, 0.78], [5, 81, 0.4, 0.76], [5.5, 83, 0.4, 0.78], [6, 88, 2.4, 0.85],
    ],
  },
  {
    id: 'anatomy',
    year: t('解剖', 'ACTION'),
    name: t('击弦机解剖室', 'Inside the piano action'),
    rangeLabel: t('六个半八度', 'c. six and a half octaves'),
    range: [24, 101],
    timbre: { model: 'struck', brightness: 8, decay: 3, inharmonicity: 0.0004, hammer: 0.55, gain: 0.8 },
    motifBpm: 120,
    motif: [[0, 60, 1, 0.7]],
  },
  {
    id: 'iron',
    year: '1859',
    name: t('钢铁与交叉弦 · 施坦威', 'Iron and overstringing · Steinway'),
    rangeLabel: t('八十五键 · A0–A7', '85 keys · A0–A7'),
    range: [21, 105],
    timbre: { model: 'struck', brightness: 8.5, decay: 3.8, inharmonicity: 0.00032, hammer: 0.6, gain: 0.95 },
    motifBpm: 84,
    motif: [
      // Rolling power across the brand-new bass register
      [0, 21, 1, 0.9], [0.5, 33, 1, 0.85], [1, 40, 1, 0.8], [1.5, 45, 1, 0.78],
      [2, 52, 1, 0.75], [2.5, 57, 1, 0.75], [3, 64, 1, 0.78], [3.5, 69, 1, 0.8],
      [4, 76, 0.8, 0.8], [4.5, 81, 0.8, 0.82], [5, 88, 2.5, 0.85],
      [5, 21, 2.5, 0.88], [5, 28, 2.5, 0.8],
    ],
  },
  {
    id: 'compass',
    year: t('音域', 'RANGE'),
    name: t('音域的三百年', 'Three centuries of compass'),
    rangeLabel: t('八十五键 · A0–A7', '85 keys · A0–A7'),
    range: [21, 105],
    timbre: { model: 'struck', brightness: 8.5, decay: 3.8, inharmonicity: 0.00032, hammer: 0.6, gain: 0.95 },
    motifBpm: 100,
    motif: [[0, 21, 2, 0.85], [1, 108, 2, 0.7]],
  },
  {
    id: 'liszt',
    year: '1840s',
    name: t('李斯特 · 炫技时代', 'Liszt · the virtuoso age'),
    rangeLabel: t('八十五键', '85 keys'),
    range: [21, 105],
    timbre: { model: 'struck', brightness: 9.5, decay: 3.4, inharmonicity: 0.0003, hammer: 0.7, gain: 1 },
    motifBpm: 152,
    motif: [
      // Glittering chromatic ascent into ringing octaves, campanella-high
      [0, 68, 0.22, 0.6], [0.25, 69, 0.22, 0.62], [0.5, 70, 0.22, 0.64], [0.75, 71, 0.22, 0.66],
      [1, 72, 0.22, 0.68], [1.25, 74, 0.22, 0.7], [1.5, 76, 0.22, 0.72], [1.75, 78, 0.22, 0.74],
      [2, 80, 0.22, 0.78], [2.25, 84, 0.22, 0.8],
      [2.5, 92, 0.5, 0.82], [3, 80, 0.5, 0.7], [3.5, 92, 0.5, 0.84], [4, 80, 0.5, 0.7],
      [4.5, 92, 0.4, 0.86], [4.9, 91, 0.4, 0.8], [5.3, 92, 1.8, 0.9], [5.3, 44, 1.8, 0.85], [5.3, 56, 1.8, 0.8],
    ],
  },
  {
    id: 'roll',
    year: '1900s',
    name: t('自动钢琴 · 纸卷时代', 'Player piano · the paper-roll era'),
    rangeLabel: t('八十八键 · A0–C8', '88 keys · A0–C8'),
    range: [21, 108],
    timbre: { model: 'struck', brightness: 8, decay: 2.6, inharmonicity: 0.0004, hammer: 0.8, gain: 0.9 },
    motifBpm: 96,
    motif: [
      // Mechanically even — every note the same velocity, like a cheap roll
      [0, 72, 0.4, 0.7], [0.5, 76, 0.4, 0.7], [1, 79, 0.4, 0.7], [1.5, 84, 0.4, 0.7],
      [2, 79, 0.4, 0.7], [2.5, 76, 0.4, 0.7], [3, 72, 0.4, 0.7], [3.5, 67, 0.4, 0.7],
      [4, 72, 1.5, 0.7], [4, 48, 1.5, 0.7],
    ],
  },
  {
    id: 'modern20',
    year: '1940',
    name: t('二十世纪 · 预置与即兴', 'Twentieth century · prepared and improvised'),
    rangeLabel: t('八十八键', '88 keys'),
    range: [21, 108],
    timbre: { model: 'prepared', brightness: 4, decay: 0.9, inharmonicity: 0.003, hammer: 1, gain: 0.85 },
    motifBpm: 108,
    motif: [
      // A Cage-like prepared pattern: gamelan thunks in an odd little loop
      [0, 53, 0.4, 0.8], [0.75, 58, 0.4, 0.6], [1.5, 51, 0.4, 0.75], [2, 63, 0.4, 0.55],
      [2.75, 53, 0.4, 0.8], [3.5, 46, 0.4, 0.7], [4, 58, 0.4, 0.6], [4.5, 51, 0.4, 0.78],
      [5.25, 63, 0.4, 0.5], [5.75, 53, 1.2, 0.85],
    ],
  },
  {
    id: 'electric',
    year: '1965',
    name: t('电与磁 · Rhodes 与 Wurlitzer', 'Electric and magnetic · Rhodes and Wurlitzer'),
    rangeLabel: t('七十三键 · E1–E7', '73 keys · E1–E7'),
    range: [28, 100],
    timbre: { model: 'tine', brightness: 6, decay: 3.5, inharmonicity: 0, hammer: 0.3, gain: 0.85 },
    motifBpm: 76,
    motif: [
      // A slow soul cadence: Dm9 — G13 — Cmaj9, rolled like warm honey
      [0, 38, 2, 0.6], [0.1, 57, 2, 0.5], [0.2, 60, 2, 0.5], [0.3, 64, 2, 0.5], [0.4, 69, 2.2, 0.55],
      [2.5, 43, 2, 0.6], [2.6, 59, 2, 0.5], [2.7, 64, 2, 0.5], [2.8, 65, 2, 0.45], [2.9, 71, 2.2, 0.55],
      [5, 36, 3, 0.6], [5.1, 55, 3, 0.5], [5.2, 62, 3, 0.5], [5.3, 64, 3, 0.5], [5.4, 71, 3.2, 0.5],
    ],
  },
  {
    id: 'digital',
    year: '1983',
    name: t('数字时代 · DX7 与 MIDI', 'Digital era · DX7 and MIDI'),
    rangeLabel: t('八十八键', '88 keys'),
    range: [21, 108],
    timbre: { model: 'fm', brightness: 7, decay: 3, inharmonicity: 0, hammer: 0.2, gain: 0.8 },
    motifBpm: 72,
    motif: [
      // The inevitable 80s ballad arpeggio, glassy FM bell-piano
      [0, 48, 0.5, 0.6], [0.5, 55, 0.5, 0.55], [1, 60, 0.5, 0.55], [1.5, 64, 0.5, 0.6],
      [2, 47, 0.5, 0.6], [2.5, 55, 0.5, 0.55], [3, 59, 0.5, 0.55], [3.5, 62, 0.5, 0.6],
      [4, 45, 0.5, 0.6], [4.5, 52, 0.5, 0.55], [5, 57, 0.5, 0.55], [5.5, 60, 0.5, 0.6],
      [6, 41, 0.5, 0.6], [6.5, 53, 0.5, 0.55], [7, 57, 0.5, 0.55], [7.5, 60, 1.5, 0.62],
    ],
  },
  {
    id: 'coda',
    year: t('今日', 'TODAY'),
    name: t('终章 · 三百年之后', 'Coda · three centuries later'),
    rangeLabel: t('八十八键 · A0–C8', '88 keys · A0–C8'),
    range: [21, 108],
    timbre: { model: 'struck', brightness: 9, decay: 4, inharmonicity: 0.0003, hammer: 0.55, gain: 0.95 },
    motifBpm: 60,
    motif: [
      // One quiet chord containing the whole compass: lowest A, highest C
      [0, 21, 4, 0.55], [0.25, 45, 4, 0.4], [0.5, 64, 4, 0.45], [0.75, 76, 4, 0.5],
      [1, 88, 4, 0.5], [1.25, 108, 4, 0.42],
    ],
  },
];

export const ERA_BY_ID = Object.fromEntries(ERAS.map((era) => [era.id, era]));

/** Ordered ids used by the progress rail; mirrors the section order in index.html. */
export const ERA_ORDER = ERAS.map((era) => era.id);
