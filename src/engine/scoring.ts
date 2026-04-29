export type Difficulty = 'explorer' | 'scientist' | 'professor';

export interface RankInfo {
  name: string;
  minEP: number;
  icon: string;
}

export const RANKS: RankInfo[] = [
  { name: 'Pebble Picker',           minEP: 0,    icon: '🪨' },
  { name: 'Flint Finder',            minEP: 50,   icon: '🔪' },
  { name: 'Bone Spotter',            minEP: 150,  icon: '🦴' },
  { name: 'Fossil Fan',              minEP: 300,  icon: '🐾' },
  { name: 'Dig Site Explorer',       minEP: 500,  icon: '⛏️' },
  { name: 'Junior Curator',          minEP: 800,  icon: '🏺' },
  { name: 'Era Expert',              minEP: 1200, icon: '📅' },
  { name: 'Master Excavator',        minEP: 1800, icon: '🦕' },
  { name: 'Time Traveller',          minEP: 2500, icon: '⏰' },
  { name: 'Chrono Captain',          minEP: 3500, icon: '🤖' },
  { name: 'Legendary Palaeontologist', minEP: 5000, icon: '🏆' },
  { name: 'Time Lord',               minEP: 7500, icon: '✨' },
];

export function getRank(ep: number): RankInfo {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (ep >= r.minEP) rank = r;
  }
  return rank;
}

export function getNextRank(ep: number): RankInfo | null {
  for (const r of RANKS) {
    if (r.minEP > ep) return r;
  }
  return null;
}

export interface DifficultyConfig {
  label: string;
  description: string;
  choices: number;
  timerSeconds: number;
  secondChance: boolean;
  specimenPool: 'famous' | 'creatures' | 'all';
  basePoints: number;
  streakMultiplier: number;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  explorer: {
    label: 'Explorer',
    description: 'For young fossil hunters — famous creatures, simpler questions, second chance!',
    choices: 3,
    timerSeconds: 30,
    secondChance: true,
    specimenPool: 'famous',
    basePoints: 10,
    streakMultiplier: 1.5,
  },
  scientist: {
    label: 'Scientist',
    description: 'For keen learners — more specimens, tougher questions, second chance!',
    choices: 4,
    timerSeconds: 20,
    secondChance: true,
    specimenPool: 'creatures',
    basePoints: 15,
    streakMultiplier: 2,
  },
  professor: {
    label: 'Professor',
    description: 'For time lords only — all specimens, everything goes, no mercy!',
    choices: 5,
    timerSeconds: 15,
    secondChance: false,
    specimenPool: 'all',
    basePoints: 20,
    streakMultiplier: 2.5,
  },
};

export interface ScoreResult {
  points: number;
  isStreak: boolean;
  newTotal: number;
  rankUp: boolean;
  newRank: string;
}

export function calculatePoints(
  difficulty: Difficulty,
  streak: number,
  timeRemainingPercent: number,  // 0–1
  secondAttempt: boolean,
): number {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  let base = cfg.basePoints;
  if (secondAttempt) base = Math.floor(base * 0.4);

  const timeBonusFactor = 1 + timeRemainingPercent * 0.5;
  const streakFactor    = streak >= 3 ? cfg.streakMultiplier : 1;
  return Math.round(base * timeBonusFactor * streakFactor);
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (ep: number, specimensCollected: number, totalQuestions: number) => boolean;
}

export const MILESTONES: Milestone[] = [
  {
    id: 'first_specimen',
    title: 'First Find!',
    description: 'Collected your very first specimen. The adventure begins!',
    icon: '🦴',
    check: (_, s) => s >= 1,
  },
  {
    id: 'five_specimens',
    title: 'Dino Starter Pack',
    description: 'Collected 5 specimens.',
    icon: '🦕',
    check: (_, s) => s >= 5,
  },
  {
    id: 'ten_specimens',
    title: 'Growing Collection',
    description: 'Collected 10 specimens.',
    icon: '🦖',
    check: (_, s) => s >= 10,
  },
  {
    id: 'twenty_five_specimens',
    title: 'Half-Way Curator',
    description: 'Collected 25 of 80 specimens.',
    icon: '🏺',
    check: (_, s) => s >= 25,
  },
  {
    id: 'fifty_specimens',
    title: 'Museum Opening Night!',
    description: 'Collected 50 specimens. The crowds are arriving!',
    icon: '🎉',
    check: (_, s) => s >= 50,
  },
  {
    id: 'all_specimens',
    title: 'Complete Collection!',
    description: 'Collected all 80 specimens. You absolute legend.',
    icon: '✨',
    check: (_, s) => s >= 80,
  },
  {
    id: 'first_ep',
    title: 'First Time Points',
    description: 'Earned your first Excavation Points.',
    icon: '⭐',
    check: (ep) => ep >= 1,
  },
  {
    id: 'ep_500',
    title: 'Digging Deep',
    description: 'Reached 500 Excavation Points.',
    icon: '⛏️',
    check: (ep) => ep >= 500,
  },
  {
    id: 'ep_2500',
    title: 'Time Traveller',
    description: 'Reached 2,500 Excavation Points.',
    icon: '⏰',
    check: (ep) => ep >= 2500,
  },
  {
    id: 'quiz_100',
    title: 'Quiz Centurion',
    description: 'Answered 100 questions.',
    icon: '💯',
    check: (_, __, q) => q >= 100,
  },
];
