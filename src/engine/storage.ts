// ─────────────────────────────────────────────────────────────────
// FossilHunters – storage.ts
// All persistence is localStorage only. No servers, no accounts.
// ─────────────────────────────────────────────────────────────────
const KEYS = {
  profiles:      'fossilhunters_profiles',
  activeProfile: 'fossilhunters_active_profile',
  introSeen:     'fossilhunters_intro_seen',
  twoPlayerNames:'fossilhunters_2p_names',
  voice:         'fossilhunters_voice',
  voiceRate:     'fossilhunters_voice_rate',
  customDinos:   'fossilhunters_custom_dinos',
} as const;

// ── Progress types ──────────────────────────────────────────────
export interface PlayerProgress {
  ep: number;                       // Excavation Points
  specimensCollected: string[];     // specimen ids
  totalQuestionsAnswered: number;
  correctAnswers: number;
  streakBest: number;
  quizzesCompleted: number;
  milestonesEarned: string[];
}

export interface PlayerProfile {
  id: string;
  name: string;
  createdAt: number;
  progress: PlayerProgress;
}

function defaultProgress(): PlayerProgress {
  return {
    ep: 0,
    specimensCollected: [],
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    streakBest: 0,
    quizzesCompleted: 0,
    milestonesEarned: [],
  };
}

// ── Custom Dino (Dino Builder creations) ───────────────────────
export interface CustomDino {
  id: string;
  name: string;
  bodyType: 'long-neck' | 'horned' | 'armoured' | 'bipedal';
  headStyle: 'flat' | 'crest' | 'horns' | 'beak';
  colour: string;
  diet: 'carnivore' | 'herbivore' | 'omnivore';
  createdAt: number;
}

// ── Profile CRUD ────────────────────────────────────────────────
function loadProfiles(): PlayerProfile[] {
  try {
    const raw = localStorage.getItem(KEYS.profiles);
    return raw ? (JSON.parse(raw) as PlayerProfile[]) : [];
  } catch {
    return [];
  }
}

function saveProfiles(profiles: PlayerProfile[]): void {
  localStorage.setItem(KEYS.profiles, JSON.stringify(profiles));
}

export function getProfiles(): PlayerProfile[] {
  return loadProfiles();
}

export function createProfile(name: string): PlayerProfile {
  const profiles = loadProfiles();
  const profile: PlayerProfile = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    createdAt: Date.now(),
    progress: defaultProgress(),
  };
  profiles.push(profile);
  saveProfiles(profiles);
  return profile;
}

export function updateProfile(profile: PlayerProfile): void {
  const profiles = loadProfiles();
  const idx = profiles.findIndex(p => p.id === profile.id);
  if (idx !== -1) {
    profiles[idx] = profile;
    saveProfiles(profiles);
  }
}

export function deleteProfile(id: string): void {
  const profiles = loadProfiles().filter(p => p.id !== id);
  saveProfiles(profiles);
  if (getActiveProfileId() === id) {
    clearActiveProfile();
  }
}

// ── Active profile ───────────────────────────────────────────────
export function getActiveProfileId(): string | null {
  return localStorage.getItem(KEYS.activeProfile);
}

export function setActiveProfile(id: string): void {
  localStorage.setItem(KEYS.activeProfile, id);
}

export function clearActiveProfile(): void {
  localStorage.removeItem(KEYS.activeProfile);
}

export function getActiveProfile(): PlayerProfile | null {
  const id = getActiveProfileId();
  if (!id) return null;
  return loadProfiles().find(p => p.id === id) ?? null;
}

// ── Progress helpers ─────────────────────────────────────────────
export function collectSpecimen(progress: PlayerProgress, specimenId: string): PlayerProgress {
  if (progress.specimensCollected.includes(specimenId)) return progress;
  return { ...progress, specimensCollected: [...progress.specimensCollected, specimenId] };
}

export function addEP(progress: PlayerProgress, ep: number): PlayerProgress {
  return { ...progress, ep: progress.ep + ep };
}

export function recordAnswer(progress: PlayerProgress, correct: boolean, streak: number): PlayerProgress {
  return {
    ...progress,
    totalQuestionsAnswered: progress.totalQuestionsAnswered + 1,
    correctAnswers: progress.correctAnswers + (correct ? 1 : 0),
    streakBest: Math.max(progress.streakBest, streak),
  };
}

export function incrementQuizzes(progress: PlayerProgress): PlayerProgress {
  return { ...progress, quizzesCompleted: progress.quizzesCompleted + 1 };
}

export function addMilestone(progress: PlayerProgress, milestoneId: string): PlayerProgress {
  if (progress.milestonesEarned.includes(milestoneId)) return progress;
  return { ...progress, milestonesEarned: [...progress.milestonesEarned, milestoneId] };
}

// ── Intro flag ────────────────────────────────────────────────────
export function isIntroSeen(): boolean {
  return localStorage.getItem(KEYS.introSeen) === 'true';
}

export function markIntroSeen(): void {
  localStorage.setItem(KEYS.introSeen, 'true');
}

// ── Two-player names ──────────────────────────────────────────────
export function getTwoPlayerNames(): [string, string] {
  try {
    const raw = localStorage.getItem(KEYS.twoPlayerNames);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length === 2) return parsed as [string, string];
  } catch { /* ignore */ }
  return ['Player 1', 'Player 2'];
}

export function saveTwoPlayerNames(names: [string, string]): void {
  localStorage.setItem(KEYS.twoPlayerNames, JSON.stringify(names));
}

// ── Custom Dinos ──────────────────────────────────────────────────
export function getCustomDinos(): CustomDino[] {
  try {
    const raw = localStorage.getItem(KEYS.customDinos);
    return raw ? (JSON.parse(raw) as CustomDino[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomDino(dino: CustomDino): void {
  const dinos = getCustomDinos();
  dinos.push(dino);
  localStorage.setItem(KEYS.customDinos, JSON.stringify(dinos));
}

export function deleteCustomDino(id: string): void {
  const dinos = getCustomDinos().filter(d => d.id !== id);
  localStorage.setItem(KEYS.customDinos, JSON.stringify(dinos));
}
