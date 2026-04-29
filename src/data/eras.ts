export type EraId =
  | 'triassic'
  | 'jurassic'
  | 'cretaceous'
  | 'ice-age'
  | 'paleolithic'
  | 'mesolithic'
  | 'neolithic'
  | 'bronze-age'
  | 'iron-age';

export type Era = {
  id: EraId;
  name: string;
  /** Human-readable time range */
  period: string;
  /** Years ago (approximate midpoint, for sorting) */
  midpointYearsAgo: number;
  color: string;
  emoji: string;
  blurb: string;
};

export const ERAS: Era[] = [
  {
    id: 'triassic',
    name: 'Triassic Period',
    period: '252–201 million years ago',
    midpointYearsAgo: 226_000_000,
    color: '#c0392b',
    emoji: '🌋',
    blurb: 'The age when dinosaurs first appeared on a hot, dry supercontinent called Pangaea.',
  },
  {
    id: 'jurassic',
    name: 'Jurassic Period',
    period: '201–145 million years ago',
    midpointYearsAgo: 173_000_000,
    color: '#27ae60',
    emoji: '🦕',
    blurb: 'Lush jungles full of giant sauropods and the first birds. The classic dinosaur age!',
  },
  {
    id: 'cretaceous',
    name: 'Cretaceous Period',
    period: '145–66 million years ago',
    midpointYearsAgo: 105_000_000,
    color: '#2980b9',
    emoji: '🦖',
    blurb: 'T. rex, Triceratops and flowering plants. Ended with a massive asteroid impact.',
  },
  {
    id: 'ice-age',
    name: 'Ice Age',
    period: '2.6 million–11,700 years ago',
    midpointYearsAgo: 1_300_000,
    color: '#7fb3d3',
    emoji: '🧊',
    blurb: 'Woolly mammoths, sabre-toothed cats and giant sloths roamed a frozen world.',
  },
  {
    id: 'paleolithic',
    name: 'Paleolithic (Old Stone Age)',
    period: '3.3 million–10,000 years ago',
    midpointYearsAgo: 500_000,
    color: '#8e44ad',
    emoji: '🗿',
    blurb: 'Our earliest human ancestors chipped flint, hunted with spears and painted caves.',
  },
  {
    id: 'mesolithic',
    name: 'Mesolithic (Middle Stone Age)',
    period: '10,000–4,000 BC',
    midpointYearsAgo: 10_000,
    color: '#d35400',
    emoji: '🏹',
    blurb: 'Hunter-gatherers became more sophisticated, making tiny blades and domesticating dogs.',
  },
  {
    id: 'neolithic',
    name: 'Neolithic (New Stone Age)',
    period: '4,000–2,300 BC',
    midpointYearsAgo: 5_000,
    color: '#f39c12',
    emoji: '🌾',
    blurb: 'The farming revolution! People built Stonehenge, made pottery and kept animals.',
  },
  {
    id: 'bronze-age',
    name: 'Bronze Age',
    period: '2,300–700 BC',
    midpointYearsAgo: 3_500,
    color: '#cd7f32',
    emoji: '⚔️',
    blurb: 'Copper + tin = bronze! The first metal tools, chariots and long-distance trade.',
  },
  {
    id: 'iron-age',
    name: 'Iron Age',
    period: '700 BC–AD 43 (Britain)',
    midpointYearsAgo: 2_000,
    color: '#555',
    emoji: '🛡️',
    blurb: 'Iron was harder and cheaper than bronze. Hillforts, Celtic art and iron ploughs changed everything.',
  },
];

export function getEra(id: EraId): Era {
  return ERAS.find(e => e.id === id)!;
}
