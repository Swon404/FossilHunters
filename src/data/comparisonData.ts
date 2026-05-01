/** Per-specimen numeric attributes used for "Which Is Older / Bigger?" comparison questions. */
export type ComparisonAttributes = {
  timelineYearsAgo: number;
  lengthMetres: number | null;
  weightKg: number | null;
  dangerLevel: number;  // 1–10
};

export const comparisonData: Record<string, ComparisonAttributes> = {
  'eoraptor':            { timelineYearsAgo: 231_000_000, lengthMetres: 1,    weightKg: 10,     dangerLevel: 3  },
  'coelophysis':         { timelineYearsAgo: 210_000_000, lengthMetres: 3,    weightKg: 20,     dangerLevel: 5  },
  'plateosaurus':        { timelineYearsAgo: 215_000_000, lengthMetres: 8,    weightKg: 4000,   dangerLevel: 2  },
  'brachiosaurus':       { timelineYearsAgo: 154_000_000, lengthMetres: 26,   weightKg: 56000,  dangerLevel: 2  },
  'stegosaurus':         { timelineYearsAgo: 155_000_000, lengthMetres: 9,    weightKg: 5000,   dangerLevel: 4  },
  'allosaurus':          { timelineYearsAgo: 155_000_000, lengthMetres: 12,   weightKg: 2000,   dangerLevel: 9  },
  'diplodocus':          { timelineYearsAgo: 153_000_000, lengthMetres: 27,   weightKg: 16000,  dangerLevel: 1  },
  'archaeopteryx':       { timelineYearsAgo: 150_000_000, lengthMetres: 0.5,  weightKg: 1,      dangerLevel: 2  },
  'ichthyosaurus':       { timelineYearsAgo: 190_000_000, lengthMetres: 2,    weightKg: 200,    dangerLevel: 5  },
  'pterodactyl':         { timelineYearsAgo: 150_000_000, lengthMetres: 0.5,  weightKg: 1,      dangerLevel: 3  },
  'trex':                { timelineYearsAgo: 68_000_000,  lengthMetres: 12,   weightKg: 9000,   dangerLevel: 10 },
  'triceratops':         { timelineYearsAgo: 67_000_000,  lengthMetres: 9,    weightKg: 12000,  dangerLevel: 7  },
  'velociraptor':        { timelineYearsAgo: 75_000_000,  lengthMetres: 2,    weightKg: 15,     dangerLevel: 7  },
  'spinosaurus':         { timelineYearsAgo: 95_000_000,  lengthMetres: 14,   weightKg: 7000,   dangerLevel: 9  },
  'ankylosaurus':        { timelineYearsAgo: 67_000_000,  lengthMetres: 10,   weightKg: 6000,   dangerLevel: 5  },
  'parasaurolophus':     { timelineYearsAgo: 76_000_000,  lengthMetres: 9,    weightKg: 2500,   dangerLevel: 2  },
  'pteranodon':          { timelineYearsAgo: 86_000_000,  lengthMetres: 1.8,  weightKg: 23,     dangerLevel: 4  },
  'mosasaurus':          { timelineYearsAgo: 70_000_000,  lengthMetres: 18,   weightKg: 15000,  dangerLevel: 10 },
  'pachycephalosaurus':  { timelineYearsAgo: 70_000_000,  lengthMetres: 5,    weightKg: 450,    dangerLevel: 4  },
  'baryonyx':            { timelineYearsAgo: 130_000_000, lengthMetres: 10,   weightKg: 2000,   dangerLevel: 8  },
  'iguanodon':           { timelineYearsAgo: 126_000_000, lengthMetres: 10,   weightKg: 3000,   dangerLevel: 3  },
  'woolly-mammoth':      { timelineYearsAgo: 300_000,     lengthMetres: 5,    weightKg: 6000,   dangerLevel: 6  },
  'sabre-tooth':         { timelineYearsAgo: 200_000,     lengthMetres: 2,    weightKg: 280,    dangerLevel: 9  },
  'cave-bear':           { timelineYearsAgo: 100_000,     lengthMetres: 3.5,  weightKg: 800,    dangerLevel: 7  },
  'neanderthal':         { timelineYearsAgo: 150_000,     lengthMetres: 1.75, weightKg: 80,     dangerLevel: 6  },
  'woolly-rhino':        { timelineYearsAgo: 250_000,     lengthMetres: 3.8,  weightKg: 2500,   dangerLevel: 7  },

  // Paleolithic
  'hand-axe':            { timelineYearsAgo: 500_000,     lengthMetres: null, weightKg: null,   dangerLevel: 3  },
  'fire-control':        { timelineYearsAgo: 400_000,     lengthMetres: null, weightKg: null,   dangerLevel: 1  },
  'flint-blade':         { timelineYearsAgo: 100_000,     lengthMetres: null, weightKg: null,   dangerLevel: 3  },
  'cave-painting':       { timelineYearsAgo: 40_000,      lengthMetres: null, weightKg: null,   dangerLevel: 1  },
  'bone-flute':          { timelineYearsAgo: 35_000,      lengthMetres: null, weightKg: null,   dangerLevel: 1  },
  'cheddar-man':         { timelineYearsAgo: 10_000,      lengthMetres: 1.65, weightKg: 65,     dangerLevel: 4  },

  // Mesolithic
  'microlith':           { timelineYearsAgo: 8_000,       lengthMetres: null, weightKg: null,   dangerLevel: 2  },
  'red-deer-antler':     { timelineYearsAgo: 9_000,       lengthMetres: null, weightKg: null,   dangerLevel: 1  },

  // Neolithic
  'dolmen':              { timelineYearsAgo: 5_500,       lengthMetres: null, weightKg: null,   dangerLevel: 1  },
  'skara-brae':          { timelineYearsAgo: 5_000,       lengthMetres: null, weightKg: null,   dangerLevel: 1  },
  'pottery':             { timelineYearsAgo: 5_000,       lengthMetres: null, weightKg: null,   dangerLevel: 1  },
  'otzi':                { timelineYearsAgo: 5_300,       lengthMetres: 1.6,  weightKg: 50,     dangerLevel: 5  },
  'stonehenge':          { timelineYearsAgo: 4_500,       lengthMetres: null, weightKg: null,   dangerLevel: 1  },
  'stone-circle':        { timelineYearsAgo: 4_000,       lengthMetres: null, weightKg: null,   dangerLevel: 1  },
  'polished-stone-axe':  { timelineYearsAgo: 4_000,       lengthMetres: null, weightKg: null,   dangerLevel: 2  },

  // Bronze Age
  'beaker':              { timelineYearsAgo: 4_500,       lengthMetres: null, weightKg: null,   dangerLevel: 1  },
  'amesbury-archer':     { timelineYearsAgo: 4_300,       lengthMetres: 1.70, weightKg: 70,     dangerLevel: 5  },
  'mold-gold-cape':      { timelineYearsAgo: 3_700,       lengthMetres: null, weightKg: null,   dangerLevel: 1  },
  'bronze-age-axe':      { timelineYearsAgo: 3_800,       lengthMetres: null, weightKg: null,   dangerLevel: 4  },
  'bronze-sword':        { timelineYearsAgo: 3_000,       lengthMetres: null, weightKg: null,   dangerLevel: 6  },
  'chariot':             { timelineYearsAgo: 2_000,       lengthMetres: null, weightKg: null,   dangerLevel: 5  },

  // Iron Age
  'celtic-torc':         { timelineYearsAgo: 2_300,       lengthMetres: null, weightKg: null,   dangerLevel: 1  },
  'iron-sword':          { timelineYearsAgo: 2_400,       lengthMetres: null, weightKg: null,   dangerLevel: 7  },
  'hillfort':            { timelineYearsAgo: 2_500,       lengthMetres: null, weightKg: null,   dangerLevel: 3  },
  'iron-age-roundhouse': { timelineYearsAgo: 2_500,       lengthMetres: null, weightKg: null,   dangerLevel: 1  },
  'iron-plough':         { timelineYearsAgo: 2_000,       lengthMetres: null, weightKg: null,   dangerLevel: 1  },
  'boudicca':            { timelineYearsAgo: 1_960,       lengthMetres: 1.70, weightKg: 70,     dangerLevel: 9  },

  // Fossil types
  'trace-fossil':        { timelineYearsAgo: 100_000_000, lengthMetres: null, weightKg: null,   dangerLevel: 1  },
  'amber':               { timelineYearsAgo: 99_000_000,  lengthMetres: null, weightKg: null,   dangerLevel: 1  },
  'ammonite':            { timelineYearsAgo: 180_000_000, lengthMetres: 1.8,  weightKg: null,   dangerLevel: 1  },
  'trilobite':           { timelineYearsAgo: 450_000_000, lengthMetres: 0.1,  weightKg: null,   dangerLevel: 1  },
};

export const DANGER_LABELS: Record<number, string> = {
  1:  'Completely harmless',
  2:  'About as scary as a golden retriever',
  3:  'Mildly threatening',
  4:  'Would ruin your picnic',
  5:  'Respectable danger',
  6:  'Seriously dangerous',
  7:  'Very dangerous',
  8:  'Extremely dangerous',
  9:  'Run. Just run.',
  10: 'Apex predator — absolutely terrifying',
};

export function formatYearsAgo(years: number): string {
  if (years >= 1_000_000) return `${(years / 1_000_000).toFixed(0)} million years ago`;
  if (years >= 1_000)    return `${(years / 1_000).toFixed(0)},000 years ago`;
  return `${years} years ago`;
}

export function formatLength(metres: number): string {
  if (metres < 1) return `${(metres * 100).toFixed(0)} cm`;
  return `${metres} m`;
}
