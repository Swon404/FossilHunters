// FossilHunters – sounds.ts
// All audio is synthesised via Web Audio API. No files required.

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function resume(): Promise<void> {
  const ctx = getCtx();
  return ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
}

// ── Correct ─────────────────────────────────────────────────────
export async function playCorrect(): Promise<void> {
  await resume();
  const ctx = getCtx();
  const now = ctx.currentTime;

  const notes = [523.25, 659.25, 783.99]; // C5 E5 G5 triumphant chord
  notes.forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.08);
    gain.gain.setValueAtTime(0, now + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.22, now + i * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 0.4);
  });
}

// ── Wrong ────────────────────────────────────────────────────────
export async function playWrong(): Promise<void> {
  await resume();
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.linearRampToValueAtTime(150, now + 0.25);
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc.start(now);
  osc.stop(now + 0.3);
}

// ── Collect (specimen discovered — celebratory "discovery" feel) ─
export async function playCollect(): Promise<void> {
  await resume();
  const ctx = getCtx();
  const now = ctx.currentTime;

  const melody = [
    { freq: 523.25, t: 0      },
    { freq: 659.25, t: 0.09   },
    { freq: 783.99, t: 0.18   },
    { freq: 1046.5, t: 0.28   },
    { freq: 1318.5, t: 0.36   },
  ];

  melody.forEach(({ freq, t }) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + t);
    gain.gain.setValueAtTime(0, now + t);
    gain.gain.linearRampToValueAtTime(0.25, now + t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.25);
    osc.start(now + t);
    osc.stop(now + t + 0.25);
  });
}

// ── Streak ───────────────────────────────────────────────────────
export async function playStreak(): Promise<void> {
  await resume();
  const ctx = getCtx();
  const now = ctx.currentTime;

  [0, 0.1, 0.2].forEach((t, i) => {
    const freq = 880 + i * 220;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + t);
    gain.gain.setValueAtTime(0.2, now + t);
    gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.18);
    osc.start(now + t);
    osc.stop(now + t + 0.18);
  });
}

// ── Rank up ──────────────────────────────────────────────────────
export async function playRankUp(): Promise<void> {
  await resume();
  const ctx = getCtx();
  const now = ctx.currentTime;

  const fanfare = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5];
  fanfare.forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.07);
    gain.gain.setValueAtTime(0, now + i * 0.07);
    gain.gain.linearRampToValueAtTime(0.2, now + i * 0.07 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.45);
    osc.start(now + i * 0.07);
    osc.stop(now + i * 0.07 + 0.45);
  });
}

// ── Click (UI feedback) ──────────────────────────────────────────
export async function playClick(): Promise<void> {
  await resume();
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc.start(now);
  osc.stop(now + 0.08);
}

// ── Tick (timer ticking low) ─────────────────────────────────────
export async function playTick(): Promise<void> {
  await resume();
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'square';
  osc.frequency.setValueAtTime(440, now);
  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  osc.start(now);
  osc.stop(now + 0.04);
}
