import { useState } from 'react';
import { getTimelineSet } from '../engine/questionGenerator';
import { comparisonData, formatYearsAgo } from '../data/comparisonData';
import { type Difficulty } from '../engine/scoring';
import { type PlayerProfile } from '../engine/storage';
import { type Specimen } from '../data/specimens';
import Chrono from '../components/Chrono';
import { playCorrect, playWrong } from '../engine/sounds';
import { speak, isTTSSupported } from '../engine/tts';

interface Props {
  profile: PlayerProfile | null;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export default function TimelineOrderScreen({ onComplete, onBack }: Omit<Props, 'profile'> & { profile?: Props['profile'] }) {
  const [phase, setPhase]             = useState<'setup' | 'playing' | 'result'>('setup');
  const [difficulty, setDifficulty]   = useState<Difficulty>('scientist');
  const [specimens, setSpecimens]     = useState<Specimen[]>([]);
  const [placed, setPlaced]           = useState<Specimen[]>([]);
  const [wrong, setWrong]             = useState<string | null>(null);
  const [score, setScore]             = useState(0);

  function startGame() {
    const pool = getTimelineSet(difficulty);
    // Shuffle for display — user must order them oldest→newest (highest timelineYearsAgo → lowest)
    setSpecimens(pool.sort(() => Math.random() - 0.5));
    setPlaced([]);
    setWrong(null);
    setScore(0);
    setPhase('playing');
  }

  function remaining(): Specimen[] {
    return specimens.filter(s => !placed.includes(s));
  }

  function correctNextId(): string {
    // Find specimen in remaining with highest timelineYearsAgo
    const rem = remaining();
    if (rem.length === 0) return '';
    return rem.reduce((best, s) => {
      const a = comparisonData[best.id]?.timelineYearsAgo ?? 0;
      const b = comparisonData[s.id]?.timelineYearsAgo   ?? 0;
      return b > a ? s : best;
    }).id;
  }

  function handlePick(specimen: Specimen) {
    if (specimen.id === correctNextId()) {
      playCorrect().catch(() => { /* ignore */ });
      const newPlaced = [...placed, specimen];
      setPlaced(newPlaced);
      setWrong(null);
      setScore(s => s + 20);

      if (newPlaced.length === specimens.length) {
        // Done!
        const bonus = difficulty === 'professor' ? 50 : difficulty === 'scientist' ? 30 : 10;
        setScore(s => s + bonus);
        setPhase('result');
      }
    } else {
      playWrong().catch(() => { /* ignore */ });
      setWrong(specimen.id);
      setScore(s => Math.max(0, s - 5));
      setTimeout(() => setWrong(null), 600);
    }
  }

  // ── Setup ──
  if (phase === 'setup') {
    return (
      <div className="quiz-setup">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 className="setup-title">📅 Timeline Order</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          Tap specimens from <strong>oldest</strong> to <strong>most recent</strong>!
        </p>
        <Chrono expression="thinking" message="Time moves fast when you're 230 million years old! ⏰" size={90} />
        <div className="difficulty-select">
          {(['explorer', 'scientist', 'professor'] as Difficulty[]).map(d => {
            const count = d === 'explorer' ? 4 : d === 'scientist' ? 6 : 8;
            return (
              <button
                key={d}
                className={`diff-btn ${difficulty === d ? 'selected' : ''}`}
                onClick={() => setDifficulty(d)}
              >
                <span className="diff-label">
                  {d === 'explorer' ? '🟢 Explorer' : d === 'scientist' ? '🟡 Scientist' : '🔴 Professor'}
                </span>
                <span className="diff-desc">{count} specimens to order</span>
              </button>
            );
          })}
        </div>
        <button className="start-btn" onClick={startGame}>Start! 📅</button>
      </div>
    );
  }

  // ── Playing ──
  if (phase === 'playing') {
    const rem = remaining();
    return (
      <div className="eo-playing">
        <div className="eo-header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <span className="eo-round">📅 Timeline Order</span>
          <span className="eo-score">{score} EP</span>
        </div>

        <p className="eo-instruction" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>Tap from <strong>oldest → most recent</strong>! ({placed.length}/{specimens.length} placed)</span>
          {isTTSSupported() && (
            <button className="tts-btn tts-btn-small" onClick={() => speak(`Tap the specimens from oldest to most recent. You have placed ${placed.length} of ${specimens.length}.`)} aria-label="Read instruction aloud" title="Read aloud">🔊</button>
          )}
        </p>

        {/* Placed row */}
        {placed.length > 0 && (
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
              Placed (oldest first):
            </p>
            <div className="eo-placed">
              {placed.map((s) => (
                <div key={s.id} className="eo-card placed">
                  <span className="eo-card-sym">{s.emoji}</span>
                  <span className="eo-card-name">{s.name}</span>
                  <span className="eo-card-num" style={{ color: 'var(--text-secondary)' }}>
                    {formatYearsAgo(comparisonData[s.id]?.timelineYearsAgo ?? 0)}
                  </span>
                  {isTTSSupported() && (
                    <button className="tts-btn tts-btn-small" onClick={() => speak(`${s.name}, ${formatYearsAgo(comparisonData[s.id]?.timelineYearsAgo ?? 0)}`)} aria-label={`Read ${s.name} aloud`} title="Read aloud">🔊</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remaining */}
        <div className="eo-remaining">
          {rem.map(s => (
            <button
              key={s.id}
              className={`eo-card clickable ${wrong === s.id ? 'wrong-flash' : ''}`}
              onClick={() => handlePick(s)}
              aria-label={s.name}
            >
              <span className="eo-card-sym">{s.emoji}</span>
              <span className="eo-card-name">{s.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Result ──
  return (
    <div className="quiz-result">
      <Chrono expression="celebrate" size={110} className="chrono-wobble"
        message="You cracked the timeline! Chrono is impressed! ⏰🦕" />
      <div className="result-card">
        <h2>📅 Timeline — Complete!</h2>
        <div className="result-stats">
          <div className="result-stat">
            <span className="stat-value" style={{ color: 'var(--accent-glow)' }}>{score}</span>
            <span className="stat-label">EP earned</span>
          </div>
          <div className="result-stat">
            <span className="stat-value">{specimens.length}</span>
            <span className="stat-label">ordered</span>
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {specimens.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--accent-glow)', fontWeight: 700 }}>#{i + 1}</span>
              <span>{s.emoji} {s.name}</span>
              <span style={{ color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                {formatYearsAgo(comparisonData[s.id]?.timelineYearsAgo ?? 0)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="result-actions">
        <button className="start-btn" style={{ flex: 1 }} onClick={startGame}>Play again!</button>
        <button className="back-btn" onClick={() => onComplete(score)}>Save & Home</button>
      </div>
    </div>
  );
}
