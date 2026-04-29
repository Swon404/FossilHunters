import { useState, useEffect, useRef } from 'react';
import { getMemoryPairs } from '../engine/questionGenerator';
import { type Difficulty } from '../engine/scoring';
import { type PlayerProfile } from '../engine/storage';
import Chrono from '../components/Chrono';
import { playCorrect, playWrong } from '../engine/sounds';

interface Props {
  profile: PlayerProfile | null;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export default function MemoryGameScreen({ onComplete, onBack }: Omit<Props, 'profile'> & { profile?: Props['profile'] }) {
  const [phase, setPhase]         = useState<'setup' | 'playing' | 'result'>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('scientist');
  const [cards, setCards]         = useState<ReturnType<typeof getMemoryPairs>>([]);
  const [flipped, setFlipped]     = useState<string[]>([]);
  const [matched, setMatched]     = useState<string[]>([]);   // pairIds
  const [moves, setMoves]         = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed]     = useState(0);
  const lockRef                   = useRef(false);
  const timerRef                  = useRef<ReturnType<typeof setInterval> | null>(null);

  function startGame() {
    const pairs = getMemoryPairs(difficulty);
    setCards(pairs);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    const now = Date.now();
    setStartTime(now);
    setElapsed(0);
    setPhase('playing');

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - now) / 1000));
    }, 1000);
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function handleCardClick(cardId: string) {
    if (lockRef.current) return;
    if (flipped.includes(cardId)) return;

    const card = cards.find(c => c.id === cardId)!;
    if (matched.includes(card.pairId)) return;

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [idA, idB] = newFlipped;
      const cardA = cards.find(c => c.id === idA)!;
      const cardB = cards.find(c => c.id === idB)!;

      if (cardA.pairId === cardB.pairId) {
        // Match!
        playCorrect().catch(() => { /* ignore */ });
        const newMatched = [...matched, cardA.pairId];
        setMatched(newMatched);
        setFlipped([]);

        if (newMatched.length === cards.length / 2) {
          // All matched
          clearInterval(timerRef.current!);
          const finalElapsed = Math.floor((Date.now() - startTime) / 1000);
          setElapsed(finalElapsed);
          setPhase('result');
        }
      } else {
        // No match
        playWrong().catch(() => { /* ignore */ });
        lockRef.current = true;
        setTimeout(() => {
          setFlipped([]);
          lockRef.current = false;
        }, 900);
      }
    }
  }

  function isFlipped(cardId: string) {
    const card = cards.find(c => c.id === cardId)!;
    return flipped.includes(cardId) || matched.includes(card?.pairId ?? '');
  }

  function isMatched(cardId: string) {
    const card = cards.find(c => c.id === cardId)!;
    return matched.includes(card?.pairId ?? '');
  }

  const totalPairs = cards.length / 2;
  const starRating =
    moves <= totalPairs + 2 ? 3
    : moves <= totalPairs * 2 ? 2
    : 1;
  const score = starRating * 50 + Math.max(0, 120 - elapsed) * 2;

  // Grid columns: 4 for explorer, 5 for scientist, 6 for professor
  const cols = difficulty === 'explorer' ? 4 : difficulty === 'scientist' ? 5 : 6;

  // ── Setup ──
  if (phase === 'setup') {
    const diffs: { key: Difficulty; label: string; pairs: number }[] = [
      { key: 'explorer',  label: '🟢 Explorer',  pairs: 8  },
      { key: 'scientist', label: '🟡 Scientist',  pairs: 12 },
      { key: 'professor', label: '🔴 Professor',  pairs: 16 },
    ];
    return (
      <div className="quiz-setup">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 className="setup-title">🧩 Memory Match</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          Match the emoji to the name! Flip two cards at a time.
        </p>
        <Chrono expression="thinking" message="How many pairs can you handle? 🧠" size={90} />
        <div className="difficulty-select">
          {diffs.map(d => (
            <button
              key={d.key}
              className={`diff-btn ${difficulty === d.key ? 'selected' : ''}`}
              onClick={() => setDifficulty(d.key)}
            >
              <span className="diff-label">{d.label}</span>
              <span className="diff-desc">{d.pairs} pairs</span>
            </button>
          ))}
        </div>
        <button className="start-btn" onClick={startGame}>Start! 🧩</button>
      </div>
    );
  }

  // ── Playing ──
  if (phase === 'playing') {
    return (
      <div className="sp-memory-playing">
        <div className="sp-memory-header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <span className="sp-memory-stat">Moves: {moves}</span>
          <span className="sp-memory-stat">⏱ {elapsed}s</span>
          <span className="sp-memory-stat">✅ {matched.length}/{totalPairs}</span>
        </div>

        <div
          className="match-grid"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {cards.map(card => (
            <button
              key={card.id}
              className={`match-card ${isFlipped(card.id) ? 'flipped' : ''} ${isMatched(card.id) ? 'matched' : ''}`}
              onClick={() => handleCardClick(card.id)}
              aria-label={isFlipped(card.id) ? card.content : 'Hidden card'}
              disabled={isMatched(card.id)}
            >
              {isFlipped(card.id) ? (
                <span className="match-card-inner">{card.content}</span>
              ) : (
                <span className="match-card-inner">🦕</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Result ──
  return (
    <div className="quiz-result">
      <Chrono
        expression={starRating === 3 ? 'celebrate' : 'correct'}
        size={110}
        className="chrono-wobble"
        message={
          starRating === 3 ? "PERFECT MEMORY! You're basically a robot! (Compliment!) 🤖"
          : starRating === 2 ? "Great job! Your memory is growing! 🧠"
          : "Good effort! Dinosaurs would be proud! 🦕"
        }
      />
      <div className="result-card">
        <h2>🧩 Memory Match — Complete!</h2>
        <div className="sp-memory-stars">
          {'⭐'.repeat(starRating)}{'☆'.repeat(3 - starRating)}
        </div>
        <div className="result-stats">
          <div className="result-stat">
            <span className="stat-value" style={{ color: 'var(--accent-glow)' }}>{score}</span>
            <span className="stat-label">EP earned</span>
          </div>
          <div className="result-stat">
            <span className="stat-value">{moves}</span>
            <span className="stat-label">moves</span>
          </div>
          <div className="result-stat">
            <span className="stat-value">{elapsed}s</span>
            <span className="stat-label">time</span>
          </div>
        </div>
      </div>
      <div className="result-actions">
        <button className="start-btn" style={{ flex: 1 }} onClick={startGame}>Play again!</button>
        <button className="back-btn" onClick={() => onComplete(score)}>Save & Home</button>
      </div>
    </div>
  );
}
