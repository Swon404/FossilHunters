import { useState } from 'react';
import { generateSilhouetteQuiz } from '../engine/questionGenerator';
import { type Question } from '../engine/questionGenerator';
import { type Difficulty } from '../engine/scoring';
import { type PlayerProfile } from '../engine/storage';
import Chrono from '../components/Chrono';
import { playCorrect, playWrong } from '../engine/sounds';

interface Props {
  profile: PlayerProfile | null;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export default function SilhouettePickScreen({ onComplete, onBack }: Omit<Props, 'profile'> & { profile?: Props['profile'] }) {
  const [phase, setPhase]           = useState<'setup' | 'playing' | 'result'>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('scientist');
  const [questions, setQuestions]   = useState<Question[]>([]);
  const [current, setCurrent]       = useState(0);
  const [selected, setSelected]     = useState<number | null>(null);
  const [revealed, setRevealed]     = useState(false);
  const [score, setScore]           = useState(0);
  const [correct, setCorrect]       = useState(0);

  function startGame() {
    setQuestions(generateSilhouetteQuiz(difficulty, 10));
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setCorrect(0);
    setPhase('playing');
  }

  function handleChoice(i: number) {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);

    const q = questions[current];
    if (i === q.correctIndex) {
      playCorrect().catch(() => { /* ignore */ });
      setCorrect(c => c + 1);
      setScore(s => s + 30);
    } else {
      playWrong().catch(() => { /* ignore */ });
    }
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setPhase('result');
    }
  }

  const q = questions[current];

  // ── Setup ──
  if (phase === 'setup') {
    return (
      <div className="quiz-setup">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 className="setup-title">🔮 Silhouette Pick</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          Can you identify the mystery creature from its silhouette? 👁️
        </p>
        <Chrono expression="hint" message="Look carefully… every creature has its own shape! 🔍" size={90} />
        <div className="difficulty-select">
          {(['explorer', 'scientist', 'professor'] as Difficulty[]).map(d => (
            <button
              key={d}
              className={`diff-btn ${difficulty === d ? 'selected' : ''}`}
              onClick={() => setDifficulty(d)}
            >
              <span className="diff-label">
                {d === 'explorer' ? '🟢 Explorer (3 choices)' : d === 'scientist' ? '🟡 Scientist (4 choices)' : '🔴 Professor (5 choices)'}
              </span>
            </button>
          ))}
        </div>
        <button className="start-btn" onClick={startGame}>Start! 🔮</button>
      </div>
    );
  }

  // ── Playing ──
  if (phase === 'playing' && q) {
    return (
      <div className="snap-playing">
        <div className="snap-header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <span className="snap-round">{current + 1}/{questions.length}</span>
          <span className="snap-scores">{score} EP</span>
        </div>

        {/* Silhouette display */}
        <div
          style={{
            textAlign: 'center',
            padding: '20px 0',
            filter: revealed ? 'none' : 'brightness(0)',
            transition: 'filter 0.4s ease',
            fontSize: '6rem',
            lineHeight: 1,
          }}
          aria-label={revealed ? q.specimen.name : 'Mystery silhouette'}
        >
          {q.specimen.emoji}
        </div>

        {!revealed && (
          <p className="snap-buzzer-name">Identify this creature!</p>
        )}
        {revealed && (
          <p className="snap-buzzer-name" style={{ color: 'var(--accent-light)' }}>
            {q.specimen.name}
          </p>
        )}

        <div className="snap-choices">
          {q.choices.map((choice, i) => {
            let cls = 'snap-choice';
            if (revealed) {
              if (i === q.correctIndex) cls += ' correct';
              else if (selected === i)  cls += ' wrong';
              else                       cls += ' snap-choice-locked';
            }
            return (
              <button key={i} className={cls} onClick={() => handleChoice(i)} disabled={revealed}>
                {choice}
              </button>
            );
          })}
        </div>

        {revealed && (
          <>
            <div className="quiz-explanation">{q.explanation}</div>
            <button className="start-btn snap-next-btn" onClick={handleNext}>
              {current < questions.length - 1 ? 'Next →' : 'Finish!'}
            </button>
          </>
        )}
      </div>
    );
  }

  // ── Result ──
  const accuracy = Math.round((correct / questions.length) * 100);
  return (
    <div className="quiz-result">
      <Chrono
        expression={accuracy >= 70 ? 'celebrate' : 'correct'}
        size={110}
        className="chrono-wobble"
        message={
          accuracy === 100 ? "You identified EVERYTHING! Are you secretly a palaeontologist? 🦕"
          : accuracy >= 70  ? "Great eye! You can spot a dino a mile away! 👁️"
          : "Keep practising — those silhouettes are tricky! 🔮"
        }
      />
      <div className="result-card">
        <h2>🔮 Silhouette Pick — Complete!</h2>
        <div className="result-stats">
          <div className="result-stat">
            <span className="stat-value" style={{ color: 'var(--accent-glow)' }}>{score}</span>
            <span className="stat-label">EP earned</span>
          </div>
          <div className="result-stat">
            <span className="stat-value" style={{ color: 'var(--correct)' }}>{correct}/{questions.length}</span>
            <span className="stat-label">correct</span>
          </div>
          <div className="result-stat">
            <span className="stat-value">{accuracy}%</span>
            <span className="stat-label">accuracy</span>
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
