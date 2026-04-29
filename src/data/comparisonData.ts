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
