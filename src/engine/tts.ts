// FossilHunters – tts.ts  (Text-to-Speech via Web Speech API)

const VOICE_KEY = 'fossilhunters_voice';
const RATE_KEY  = 'fossilhunters_voice_rate';

// Preferred voices, tried in order
const PREFERRED_VOICES = [
  'Google UK English Female',
  'Karen',
  'Samantha',
  'Daniel',
  'Microsoft Zira - English (United States)',
  'Microsoft Hazel - English (United Kingdom)',
];

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

function getVoices(): SpeechSynthesisVoice[] {
  return window.speechSynthesis?.getVoices() ?? [];
}

export function getPreferredVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;

  const savedName = localStorage.getItem(VOICE_KEY);
  const voices    = getVoices();

  if (voices.length === 0) return null;

  // Try saved preference first
  if (savedName) {
    const found = voices.find(v => v.name === savedName);
    if (found) { cachedVoice = found; return found; }
  }

  // Try preferred list
  for (const name of PREFERRED_VOICES) {
    const found = voices.find(v => v.name === name);
    if (found) { cachedVoice = found; return found; }
  }

  // Fall back to any English voice
  const anyEnglish = voices.find(v => v.lang.startsWith('en'));
  if (anyEnglish) { cachedVoice = anyEnglish; return anyEnglish; }

  return voices[0] ?? null;
}

export function getAllVoices(): SpeechSynthesisVoice[] {
  return getVoices().filter(v => v.lang.startsWith('en'));
}

export function getSavedVoiceName(): string | null {
  return localStorage.getItem(VOICE_KEY);
}

export function saveVoiceName(name: string): void {
  localStorage.setItem(VOICE_KEY, name);
  cachedVoice = null; // invalidate cache
}

export function getSavedRate(): number {
  const raw = localStorage.getItem(RATE_KEY);
  return raw ? parseFloat(raw) : 0.95;
}

export function saveRate(rate: number): void {
  localStorage.setItem(RATE_KEY, String(rate));
}

export function speak(text: string): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  if (!voicesLoaded) {
    window.speechSynthesis.onvoiceschanged = () => {
      voicesLoaded = true;
    };
  }

  const voice = cachedVoice ?? getPreferredVoice();
  if (voice) utterance.voice = voice;
  utterance.rate   = getSavedRate();
  utterance.pitch  = 1.05;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  window.speechSynthesis?.cancel();
}

export function isTTSSupported(): boolean {
  return 'speechSynthesis' in window;
}
