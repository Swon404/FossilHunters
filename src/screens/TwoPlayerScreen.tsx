import { useState } from 'react';
import { generateQuiz, generateSilhouetteQuiz, type Question } from '../engine/questionGenerator';
import { getTwoPlayerNames, saveTwoPlayerNames } from '../engine/storage';
import Chrono from '../components/Chrono';
import { playCorrect, playWrong } from '../engine/sounds';

type TwoPlayerMode =
  | 'quiz-battle'
  | 'tf-blitz'
  | 'silhouette'
  | 'championship';

interface Props {
  onBack: () => void;
}

const MODE_INFO: Record<TwoPlayerMode, { label: string; icon: string; desc: string }> = {
  'quiz-battle':  { label: 'Quiz Battle',   icon: '⚔️',  desc: 'Take turns answering questions' },
  'tf-blitz':     { label: 'T/F Blitz',     icon: '⚡',  desc: 'True or False — buzz in first!' },
  'silhouette':   { label: 'Silhouette',    icon: '🔮',  desc: 'Identify the mystery creature' },
  'championship': { label: 'Championship', icon: '🏆',  desc: 'Best of 20 — who\'s the Time Lord?' },
};

export default function TwoPlayerScreen({ onBack }: Props) {
  const [phase, setPhase]         = useState<'setup' | 'names' | 'playing' | 'result'>('setup');
  const [mode, setMode]           = useState<TwoPlayerMode>('quiz-battle');
  const [names, setNames]         = useState<[string, string]>(getTwoPlayerNames);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent]     = useState(0);
  const [scores, setScores]       = useState<[number, number]>([0, 0]);
  const [activePlayer, setActivePlayer] = useState<0 | 1>(0);
  const [revealed, setRevealed]   = useState(false);
  const [selected, setSelected]   = useState<number | null>(null);

  function handleStartSetup() {
    saveTwoPlayerNames(names);
    const count = mode === 'championship' ? 20 : 10;
    const qs = mode === 'silhouette'
      ? generateSilhouetteQuiz('scientist', count)
      : generateQuiz('scientist', count);
    setQuestions(qs);
    setCurrent(0);
    setScores([0, 0]);
    setActivePlayer(0);
    setRevealed(false);
    setSelected(null);
    setPhase('playing');
  }

  function handleAnswer(i: number) {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);

    const q = questions[current];
    const isCorrect = i === q.correctIndex;

    if (isCorrect) {
      playCorrect().catch(() => { /* ignore */ });
      setScores(prev => {
        const next: [number, number] = [...prev] as [number, number];
        next[activePlayer] += 1;
        return next;
      });
    } else {
      playWrong().catch(() => { /* ignore */ });
    }
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setActivePlayer(p => (p === 0 ? 1 : 0));
      setRevealed(false);
      setSelected(null);
    } else {
      setPhase('result');
    }
  }

  const q = questions[current];

  // ── Setup ──
  if (phase === 'setup') {
    return (
      <div className="two-player-screen">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-btn" onClick={onBack}>← Back</button>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>👥 2 Player</h1>
        </div>

        <Chrono expression="greeting" message="Two time travellers? Chrono loves the company! 🤖" size={90} />

        <div className="tp-mode-grid">
          {(Object.keys(MODE_INFO) as TwoPlayerMode[]).map(m => (
            <button
              key={m}
              className={`tp-mode-btn ${mode === m ? 'selected' : ''}`}
              onClick={() => setMode(m)}
            >
              <span className="tp-mode-icon">{MODE_INFO[m].icon}</span>
              <span className="tp-mode-label">{MODE_INFO[m].label}</span>
              <span className="tp-mode-desc">{MODE_INFO[m].desc}</span>
            </button>
          ))}
        </div>

        {/* Player names */}
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="profile-name-input"
            placeholder="Player 1 name"
            value={names[0]}
            maxLength={15}
            style={{ flex: 1 }}
            onChange={e => setNames([e.target.value, names[1]])}
          />
          <input
            className="profile-name-input"
            placeholder="Player 2 name"
            value={names[1]}
            maxLength={15}
            style={{ flex: 1 }}
            onChange={e => setNames([names[0], e.target.value])}
          />
        </div>

        <button className="start-btn" onClick={handleStartSetup}>
          Let the battle begin! ⚔️
        </button>
      </div>
    );
  }

  // ── Playing ──
  if (phase === 'playing' && q) {
    const playerLabel = names[activePlayer] || `Player ${activePlayer + 1}`;
    return (
      <div className="quiz-setup">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="tp-score-p1" style={{ fontWeight: 700 }}>
            🔵 {names[0] || 'Player 1'}: {scores[0]}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {current + 1}/{questions.length}
          </span>
          <span className="tp-score-p2" style={{ fontWeight: 700 }}>
            🔴 {names[1] || 'Player 2'}: {scores[1]}
          </span>
        </div>

        <div style={{
          textAlign: 'center',
          background: activePlayer === 0 ? 'rgba(100,181,246,0.15)' : 'rgba(240,98,146,0.15)',
          borderRadius: 'var(--radius)',
          padding: '10px',
          fontWeight: 700,
          color: activePlayer === 0 ? '#64b5f6' : '#f06292',
        }}>
          {activePlayer === 0 ? '🔵' : '🔴'} {playerLabel}'s turn!
        </div>

        <div className="quiz-image">
          <div className="quiz-image-emoji">{q.specimen.emoji}</div>
        </div>

        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.4 }}>{q.text}</h2>

        <div className="snap-choices">
          {q.choices.map((choice, i) => {
            let cls = 'snap-choice';
            if (revealed) {
              if (i === q.correctIndex) cls += ' correct';
              else if (selected === i)  cls += ' wrong';
              else                       cls += ' snap-choice-locked';
            }
            return (
              <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={revealed}>
                {choice}
              </button>
            );
          })}
        </div>

        {revealed && (
          <>
            <div className="quiz-explanation">{q.explanation}</div>
            <button className="start-btn" onClick={handleNext}>
              {current < questions.length - 1 ? 'Next →' : 'See results!'}
            </button>
          </>
        )}
      </div>
    );
  }

  // ── Result ──
  const winner =
    scores[0] > scores[1] ? (names[0] || 'Player 1')
    : scores[1] > scores[0] ? (names[1] || 'Player 2')
    : null;

  return (
    <div className="quiz-result">
      <Chrono
        expression="celebrate"
        size={110}
        className="chrono-wobble"
        message={
          winner
            ? `${winner} wins! A true Time Lord! 🏆`
            : "It's a draw! You're both equally brilliant! 🤝"
        }
      />
      <div className="result-card">
        <h2>👥 Battle Complete!</h2>
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '16px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', color: '#64b5f6', fontWeight: 800 }}>{scores[0]}</div>
            <div style={{ color: '#64b5f6', fontWeight: 700 }}>{names[0] || 'Player 1'}</div>
            {scores[0] > scores[1] && <div style={{ color: 'var(--gold)' }}>👑 Winner!</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.5rem' }}>VS</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', color: '#f06292', fontWeight: 800 }}>{scores[1]}</div>
            <div style={{ color: '#f06292', fontWeight: 700 }}>{names[1] || 'Player 2'}</div>
            {scores[1] > scores[0] && <div style={{ color: 'var(--gold)' }}>👑 Winner!</div>}
          </div>
        </div>
        {!winner && (
          <div style={{ textAlign: 'center', color: 'var(--accent-glow)', fontWeight: 700 }}>
            🤝 It's a draw!
          </div>
        )}
      </div>
      <div className="result-actions">
        <button className="start-btn" style={{ flex: 1 }} onClick={() => {
          setPhase('setup');
        }}>
          Rematch!
        </button>
        <button className="back-btn" onClick={onBack}>Home</button>
      </div>
    </div>
  );
}
