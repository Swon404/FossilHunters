import { specimens, type Specimen } from '../data/specimens';
import { ERAS, getEra } from '../data/eras';
import { comparisonData, DANGER_LABELS, formatYearsAgo, formatLength } from '../data/comparisonData';
import { type Difficulty, DIFFICULTY_CONFIG } from './scoring';

// ── Types ────────────────────────────────────────────────────────
export type QuestionCategory =
  | 'name-from-era'
  | 'which-era'
  | 'which-is-older'
  | 'diet'
  | 'size-comparison'
  | 'fun-fact'
  | 'artifact-use'
  | 'discovery'
  | 'silhouette-match'
  | 'fossil-type'
  | 'danger-level'
  | 'true-or-false';

export interface Question {
  id: string;
  category: QuestionCategory;
  specimen: Specimen;
  text: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  imageUrl?: string;
}

// ── Helpers ──────────────────────────────────────────────────────
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickUniqueDistractors<T>(pool: T[], exclude: T, count: number): T[] {
  const available = pool.filter(x => x !== exclude);
  return shuffleArray(available).slice(0, count);
}

function makeChoices(correct: string, distractors: string[]): { choices: string[]; correctIndex: number } {
  const all = shuffleArray([correct, ...distractors]);
  return { choices: all, correctIndex: all.indexOf(correct) };
}

function specimenPool(difficulty: Difficulty): Specimen[] {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  if (cfg.specimenPool === 'famous') {
    return specimens.filter(s =>
      ['trex', 'triceratops', 'stegosaurus', 'brachiosaurus', 'velociraptor',
       'woolly-mammoth', 'sabre-tooth', 'diplodocus', 'pterodactyl',
       'ankylosaurus', 'spinosaurus', 'allosaurus', 'archaeopteryx',
       'pteranodon', 'mosasaurus', 'iguanodon',
       'stonehenge', 'cave-painting', 'hand-axe'].includes(s.id)
    );
  }
  if (cfg.specimenPool === 'creatures') {
    return specimens.filter(s => s.kind !== 'artifact' && s.kind !== 'fossil-type');
  }
  return specimens;
}

function uniqueId(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ── Individual question generators ──────────────────────────────

function makeNameFromEra(specimen: Specimen, pool: Specimen[], choices: number): Question | null {
  const eraName = getEra(specimen.eraId).name;
  const distractors = pickUniqueDistractors(
    pool.filter(s => s.eraId === specimen.eraId),
    specimen,
    choices - 1
  );
  if (distractors.length < choices - 1) return null;
  const { choices: ch, correctIndex } = makeChoices(
    specimen.name,
    distractors.map(s => s.name)
  );
  return {
    id: uniqueId(),
    category: 'name-from-era',
    specimen,
    text: `Which of these lived during the ${eraName}? ${specimen.emoji}`,
    choices: ch,
    correctIndex,
    explanation: `${specimen.name} lived during the ${eraName} — ${specimen.funFact}`,
  };
}

function makeWhichEra(specimen: Specimen, choices: number): Question {
  const correctEra = getEra(specimen.eraId);
  const distractors = pickUniqueDistractors(ERAS, correctEra, choices - 1).map(e => e.name);
  const { choices: ch, correctIndex } = makeChoices(correctEra.name, distractors);
  return {
    id: uniqueId(),
    category: 'which-era',
    specimen,
    text: `${specimen.emoji} Which era did the ${specimen.name} come from?`,
    choices: ch,
    correctIndex,
    explanation: `The ${specimen.name} lived during the ${correctEra.name} (around ${formatYearsAgo(specimen.timelineYearsAgo)}).`,
  };
}

function makeDietQuestion(specimen: Specimen, _pool: Specimen[], choices: number): Question | null {
  if (!specimen.diet) return null;
  const dietLabel: Record<string, string> = {
    carnivore: 'Carnivore 🥩 (meat eater)',
    herbivore: 'Herbivore 🌿 (plant eater)',
    omnivore:  'Omnivore 🍽️ (eats anything)',
    piscivore: 'Piscivore 🐟 (fish eater)',
    insectivore: 'Insectivore 🪲 (insect eater)',
  };
  const correct = dietLabel[specimen.diet] ?? specimen.diet;
  const diets   = Object.values(dietLabel).filter(d => d !== correct);
  const dist    = shuffleArray(diets).slice(0, choices - 1);
  const { choices: ch, correctIndex } = makeChoices(correct, dist);
  return {
    id: uniqueId(),
    category: 'diet',
    specimen,
    text: `${specimen.emoji} What did the ${specimen.name} eat?`,
    choices: ch,
    correctIndex,
    explanation: `${specimen.name} was a ${specimen.diet}. ${pickRandom(specimen.additionalFacts)}`,
  };
}

function makeFunFactQuestion(specimen: Specimen): Question {
  const correct = 'TRUE — ' + specimen.funFact;
  const fakeFacts = [
    `FALSE — ${specimen.name} could actually fly at 200 km/h`,
    `FALSE — ${specimen.name} was actually smaller than a house cat`,
    `FALSE — ${specimen.name} could hold its breath for 3 hours`,
    `FALSE — ${specimen.name} was actually bright pink`,
    `FALSE — Scientists think ${specimen.name} could count to ten`,
  ];
  const distractors = shuffleArray(fakeFacts).slice(0, 3);
  const { choices, correctIndex } = makeChoices(correct, distractors);
  return {
    id: uniqueId(),
    category: 'fun-fact',
    specimen,
    text: `${specimen.emoji} True or false: "${specimen.funFact}"`,
    choices,
    correctIndex,
    explanation: `${specimen.funny ?? specimen.funFact}`,
  };
}

function makeSizeComparison(specimenA: Specimen, specimenB: Specimen, choices: number): Question | null {
  const dataA = comparisonData[specimenA.id];
  const dataB = comparisonData[specimenB.id];
  if (!dataA || !dataB || !dataA.lengthMetres || !dataB.lengthMetres) return null;
  if (dataA.lengthMetres === dataB.lengthMetres) return null;

  const biggerOne = dataA.lengthMetres > dataB.lengthMetres ? specimenA : specimenB;
  const correct   = biggerOne.name;
  const wrong     = biggerOne.id === specimenA.id ? specimenB.name : specimenA.name;
  const extra     = ['A blue whale (33 m)', 'A school bus (12 m)', 'A golden retriever (0.6 m)'];
  const distractors = [wrong, ...shuffleArray(extra).slice(0, choices - 2)];
  const { choices: ch, correctIndex } = makeChoices(correct, distractors);
  return {
    id: uniqueId(),
    category: 'size-comparison',
    specimen: specimenA,
    text: `Which was longer: ${specimenA.emoji} ${specimenA.name} (${formatLength(dataA.lengthMetres)}) or ${specimenB.emoji} ${specimenB.name} (${formatLength(dataB.lengthMetres)})?`,
    choices: ch,
    correctIndex,
    explanation: `${biggerOne.name} was ${formatLength(comparisonData[biggerOne.id].lengthMetres!)} long, making it the bigger beast!`,
  };
}

function makeWhichIsOlder(specimenA: Specimen, specimenB: Specimen, choices: number): Question | null {
  const dataA = comparisonData[specimenA.id];
  const dataB = comparisonData[specimenB.id];
  if (!dataA || !dataB) return null;
  if (dataA.timelineYearsAgo === dataB.timelineYearsAgo) return null;

  const olderOne = dataA.timelineYearsAgo > dataB.timelineYearsAgo ? specimenA : specimenB;
  const correct  = olderOne.name;
  const wrong    = olderOne.id === specimenA.id ? specimenB.name : specimenA.name;
  const extra    = ['They were the same age!', 'Neither — they were both recent'];
  const distractors = [wrong, ...shuffleArray(extra).slice(0, choices - 2)];
  const { choices: ch, correctIndex } = makeChoices(correct, distractors);
  return {
    id: uniqueId(),
    category: 'which-is-older',
    specimen: specimenA,
    text: `Which came first: ${specimenA.emoji} ${specimenA.name} or ${specimenB.emoji} ${specimenB.name}?`,
    choices: ch,
    correctIndex,
    explanation: `${olderOne.name} lived ${formatYearsAgo(comparisonData[olderOne.id].timelineYearsAgo)}, making it older.`,
  };
}

function makeDangerQuestion(specimen: Specimen, choices: number): Question | null {
  const data = comparisonData[specimen.id];
  if (!data) return null;
  const level   = data.dangerLevel;
  const correct = DANGER_LABELS[level] ?? String(level);
  const otherLabels = Object.values(DANGER_LABELS).filter(l => l !== correct);
  const distractors = shuffleArray(otherLabels).slice(0, choices - 1);
  const { choices: ch, correctIndex } = makeChoices(correct, distractors);
  return {
    id: uniqueId(),
    category: 'danger-level',
    specimen,
    text: `${specimen.emoji} How dangerous was the ${specimen.name}? (rated 1–10)`,
    choices: ch,
    correctIndex,
    explanation: `${specimen.name} scores ${level}/10 on the danger scale — ${correct}. ${specimen.funny ?? ''}`,
  };
}

function makeArtifactUse(specimen: Specimen, pool: Specimen[], choices: number): Question | null {
  if (!specimen.uses?.length) return null;
  const correctUse = pickRandom(specimen.uses);
  const otherArtifacts = pool.filter(s => s.uses?.length && s.id !== specimen.id);
  if (otherArtifacts.length < choices - 1) return null;
  const distractors = shuffleArray(otherArtifacts)
    .slice(0, choices - 1)
    .map(s => pickRandom(s.uses!));
  const { choices: ch, correctIndex } = makeChoices(correctUse, distractors);
  return {
    id: uniqueId(),
    category: 'artifact-use',
    specimen,
    text: `${specimen.emoji} What was a ${specimen.name} used for?`,
    choices: ch,
    correctIndex,
    explanation: `The ${specimen.name} was used for ${correctUse}. ${pickRandom(specimen.additionalFacts)}`,
  };
}

function makeDiscoveryQuestion(specimen: Specimen, pool: Specimen[], choices: number): Question | null {
  if (!specimen.discoveryCountry) return null;
  const correct = specimen.discoveryCountry;
  const otherCountries = pool
    .filter(s => s.discoveryCountry && s.discoveryCountry !== correct)
    .map(s => s.discoveryCountry!);
  if (otherCountries.length < choices - 1) return null;
  const distractors = pickUniqueDistractors(otherCountries, correct, choices - 1);
  const { choices: ch, correctIndex } = makeChoices(correct, distractors);
  return {
    id: uniqueId(),
    category: 'discovery',
    specimen,
    text: `${specimen.emoji} In which country was the ${specimen.name} first discovered?`,
    choices: ch,
    correctIndex,
    explanation: `The first ${specimen.name} was discovered in ${correct}${specimen.discoveredBy ? ` by ${specimen.discoveredBy}` : ''}.`,
  };
}

function makeTrueOrFalse(specimen: Specimen): Question {
  const fact = pickRandom(specimen.additionalFacts);
  const isTrue = Math.random() > 0.4;
  const answer = isTrue ? 'TRUE ✅' : 'FALSE ❌';
  const text    = isTrue ? fact : `${specimen.name} was actually first discovered on the Moon`;
  const { choices, correctIndex } = makeChoices(answer, [isTrue ? 'FALSE ❌' : 'TRUE ✅']);
  return {
    id: uniqueId(),
    category: 'true-or-false',
    specimen,
    text: `True or false? "${text}"`,
    choices,
    correctIndex,
    explanation: isTrue
      ? `That's true! ${pickRandom(specimen.additionalFacts)}`
      : `Ha! ${specimen.name} was definitely NOT discovered on the Moon. ${fact}`,
  };
}

// ── Public API ───────────────────────────────────────────────────
export function generateQuiz(difficulty: Difficulty, count: number): Question[] {
  const pool    = specimenPool(difficulty);
  const cfgChoices = DIFFICULTY_CONFIG[difficulty].choices;
  const questions: Question[] = [];
  const usedIds = new Set<string>();

  const shuffled = shuffleArray(pool);

  for (const specimen of shuffled) {
    if (questions.length >= count) break;
    if (usedIds.has(specimen.id)) continue;

    const candidates: Array<() => Question | null> = [
      () => makeWhichEra(specimen, cfgChoices),
      () => makeFunFactQuestion(specimen),
      () => makeDietQuestion(specimen, pool, cfgChoices),
      () => makeDiscoveryQuestion(specimen, pool, cfgChoices),
      () => makeArtifactUse(specimen, pool, cfgChoices),
      () => makeTrueOrFalse(specimen),
    ];

    const fn   = pickRandom(candidates);
    const q    = fn();
    if (q) {
      questions.push(q);
      usedIds.add(specimen.id);
    }
  }

  // Pad with 'which-era' if we're short
  for (const specimen of shuffleArray(pool)) {
    if (questions.length >= count) break;
    if (usedIds.has(specimen.id)) continue;
    questions.push(makeWhichEra(specimen, cfgChoices));
    usedIds.add(specimen.id);
  }

  return shuffleArray(questions).slice(0, count);
}

export function generateDeepDiveQuiz(specimenId: string, difficulty: Difficulty, count: number): Question[] {
  const specimen = specimens.find(s => s.id === specimenId);
  if (!specimen) return generateQuiz(difficulty, count);

  const pool    = specimenPool(difficulty);
  const cfgChoices = DIFFICULTY_CONFIG[difficulty].choices;

  const allQ: Array<Question | null> = [
    makeWhichEra(specimen, cfgChoices),
    makeFunFactQuestion(specimen),
    makeDietQuestion(specimen, pool, cfgChoices),
    makeDiscoveryQuestion(specimen, pool, cfgChoices),
    makeArtifactUse(specimen, pool, cfgChoices),
    makeTrueOrFalse(specimen),
    makeDangerQuestion(specimen, cfgChoices),
    makeNameFromEra(specimen, pool, cfgChoices),
  ];

  const valid = allQ.filter((q): q is Question => q !== null);
  return shuffleArray(valid).slice(0, count);
}

export function generateComparisonQuiz(difficulty: Difficulty, count: number): Question[] {
  const pool    = specimenPool(difficulty).filter(s => comparisonData[s.id]);
  const cfgChoices = DIFFICULTY_CONFIG[difficulty].choices;
  const questions: Question[] = [];

  const shuffled = shuffleArray(pool);
  for (let i = 0; i < shuffled.length - 1 && questions.length < count; i++) {
    const a = shuffled[i];
    const b = shuffled[i + 1];
    const fn = pickRandom([
      () => makeWhichIsOlder(a, b, cfgChoices),
      () => makeSizeComparison(a, b, cfgChoices),
      () => makeDangerQuestion(a, cfgChoices),
    ]);
    const q = fn();
    if (q) questions.push(q);
  }
  return questions.slice(0, count);
}

/** For Memory Game – returns shuffled pairs of [emojiCard, nameCard] */
export function getMemoryPairs(difficulty: Difficulty): Array<{ id: string; content: string; pairId: string }> {
  const pool = specimenPool(difficulty);
  const count = difficulty === 'explorer' ? 8 : difficulty === 'scientist' ? 12 : 16;
  const selected = shuffleArray(pool).slice(0, count);
  const pairs: Array<{ id: string; content: string; pairId: string }> = [];
  selected.forEach(s => {
    pairs.push({ id: uniqueId(), content: s.emoji,  pairId: s.id });
    pairs.push({ id: uniqueId(), content: s.name,   pairId: s.id });
  });
  return shuffleArray(pairs);
}

/** For Timeline Order – returns specimens to order oldest → newest */
export function getTimelineSet(difficulty: Difficulty): Specimen[] {
  const pool = specimenPool(difficulty).filter(s => comparisonData[s.id]);
  const count = difficulty === 'explorer' ? 4 : difficulty === 'scientist' ? 6 : 8;
  return shuffleArray(pool).slice(0, count);
}

/** For Silhouette Pick – returns question objects */
export function generateSilhouetteQuiz(difficulty: Difficulty, count: number): Question[] {
  const pool       = specimenPool(difficulty);
  const cfgChoices = DIFFICULTY_CONFIG[difficulty].choices;
  const selected   = shuffleArray(pool).slice(0, count);

  return selected.map(specimen => {
    const distractors = pickUniqueDistractors(pool, specimen, cfgChoices - 1).map(s => s.name);
    const { choices, correctIndex } = makeChoices(specimen.name, distractors);
    return {
      id: uniqueId(),
      category: 'silhouette-match' as QuestionCategory,
      specimen,
      text: `🔮 Which creature is this? (shown as silhouette)`,
      choices,
      correctIndex,
      explanation: `That's ${specimen.name}! ${specimen.funFact}`,
    };
  });
}
