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
  'championship': { label: 'Championship', icon: '🏆',  desc: '4 rounds · 5 questions each · who\'s the Time Lord?' },
};

const CHAMP_ROUNDS        = 4;
const CHAMP_Q_PER_ROUND   = 5; // 4 × 5 = 20 questions

interface RoundRecord { round: number; p0: number; p1: number; }

export default function TwoPlayerScreen({ onBack }: Props) {
  const [phase, setPhase]         = useState<'setup' | 'playing' | 'round-break' | 'result'>('setup');
  const [mode, setMode]           = useState<TwoPlayerMode>('championship');
  const [names, setNames]         = useState<[string, string]>(getTwoPlayerNames);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent]     = useState(0);
  const [scores, setScores]       = useState<[number, number]>([0, 0]);
  const [activePlayer, setActivePlayer] = useState<0 | 1>(0);
  const [revealed, setRevealed]   = useState(false);
  const [selected, setSelected]   = useState<number | null>(null);
  // Championship round tracking
  const [roundRecords, setRoundRecords]         = useState<RoundRecord[]>([]);
  const [roundStartScores, setRoundStartScores] = useState<[number, number]>([0, 0]);

  // Derived helpers
  const champRound    = mode === 'championship' ? Math.floor(current / CHAMP_Q_PER_ROUND) + 1 : 1;
  const champQInRound = mode === 'championship' ? (current % CHAMP_Q_PER_ROUND) + 1 : current + 1;

  function handleStartSetup() {
    saveTwoPlayerNames(names);
    const count = mode === 'championship' ? CHAMP_ROUNDS * CHAMP_Q_PER_ROUND : 10;
    const qs = mode === 'silhouette'
      ? generateSilhouetteQuiz('scientist', count)
      : generateQuiz('scientist', count);
    setQuestions(qs);
    setCurrent(0);
    setScores([0, 0]);
    setActivePlayer(0);
    setRevealed(false);
    setSelected(null);
    setRoundRecords([]);
    setRoundStartScores([0, 0]);
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
    const nextQ = current + 1;

    if (mode === 'championship' && nextQ % CHAMP_Q_PER_ROUND === 0 && nextQ < questions.length) {
      // End of a round (not the last question overall)
      setRoundRecords(prev => [...prev, {
        round: champRound,
        p0: scores[0] - roundStartScores[0],
        p1: scores[1] - roundStartScores[1],
      }]);
      setRoundStartScores(scores);
      setCurrent(nextQ);
      setActivePlayer(p => (p === 0 ? 1 : 0));
      setRevealed(false);
      setSelected(null);
      setPhase('round-break');
    } else if (nextQ < questions.length) {
      setCurrent(nextQ);
      setActivePlayer(p => (p === 0 ? 1 : 0));
      setRevealed(false);
      setSelected(null);
    } else {
      // Last question done
      if (mode === 'championship') {
        setRoundRecords(prev => [...prev, {
          round: champRound,
          p0: scores[0] - roundStartScores[0],
          p1: scores[1] - roundStartScores[1],
        }]);
      }
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

  // ── Championship Round Break ──
  if (phase === 'round-break') {
    const last      = roundRecords[roundRecords.length - 1];
    const nextRound = (last?.round ?? 0) + 1;
    const p0wins    = roundRecords.filter(r => r.p0 > r.p1).length;
    const p1wins    = roundRecords.filter(r => r.p0 < r.p1).length;
    const roundWinner =
      last.p0 > last.p1 ? (names[0] || 'Player 1') :
      last.p1 > last.p0 ? (names[1] || 'Player 2') : null;

    return (
      <div className="quiz-result">
        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
          🏆 CHAMPIONSHIP
        </div>
        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: 8 }}>
          Round {last.round} Complete!
        </h2>
        <Chrono
          expression={roundWinner ? 'celebrate' : 'greeting'}
          size={90}
          message={roundWinner ? `${roundWinner} wins Round ${last.round}! 🔥` : `Round ${last.round} — dead heat! 😮`}
        />

        {/* Round-by-round table */}
        <div className="result-card" style={{ padding: '12px 16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                <th style={{ textAlign: 'left', paddingBottom: 6 }}>Round</th>
                <th style={{ color: '#64b5f6' }}>{names[0] || 'P1'}</th>
                <th style={{ color: '#f06292' }}>{names[1] || 'P2'}</th>
                <th>Winner</th>
              </tr>
            </thead>
            <tbody>
              {roundRecords.map(r => {
                const rw = r.p0 > r.p1 ? '🔵' : r.p1 > r.p0 ? '🔴' : '🤝';
                return (
                  <tr key={r.round} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '5px 0', fontWeight: 600 }}>R{r.round}</td>
                    <td style={{ textAlign: 'center', color: '#64b5f6', fontWeight: 700 }}>{r.p0}</td>
                    <td style={{ textAlign: 'center', color: '#f06292', fontWeight: 700 }}>{r.p1}</td>
                    <td style={{ textAlign: 'center' }}>{rw}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Championship standings */}
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: '#64b5f6', fontWeight: 800 }}>{p0wins}</div>
            <div style={{ color: '#64b5f6', fontSize: '0.8rem' }}>Round wins</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Round wins
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: '#f06292', fontWeight: 800 }}>{p1wins}</div>
            <div style={{ color: '#f06292', fontSize: '0.8rem' }}>Round wins</div>
          </div>
        </div>

        <button className="start-btn" onClick={() => setPhase('playing')}>
          🏆 Round {nextRound} — Let's go!
        </button>
      </div>
    );
  }

  // ── Playing ──
  if (phase === 'playing' && q) {
    const playerLabel = names[activePlayer] || `Player ${activePlayer + 1}`;
    return (
      <div className="quiz-setup">
        {/* Score bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="tp-score-p1" style={{ fontWeight: 700 }}>
            🔵 {names[0] || 'Player 1'}: {scores[0]}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            {mode === 'championship'
              ? `R${champRound}/${CHAMP_ROUNDS} · Q${champQInRound}/${CHAMP_Q_PER_ROUND}`
              : `${current + 1}/${questions.length}`}
          </span>
          <span className="tp-score-p2" style={{ fontWeight: 700 }}>
            🔴 {names[1] || 'Player 2'}: {scores[1]}
          </span>
        </div>

        {/* Championship round banner */}
        {mode === 'championship' && (
          <div style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'var(--gold)',
            background: 'rgba(255,215,0,0.08)',
            borderRadius: 'var(--radius)',
            padding: '4px 10px',
          }}>
            🏆 CHAMPIONSHIP · ROUND {champRound} OF {CHAMP_ROUNDS}
          </div>
        )}

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
              {current < questions.length - 1
                ? (mode === 'championship' && champQInRound === CHAMP_Q_PER_ROUND ? `End of Round ${champRound} →` : 'Next →')
                : 'See results!'}
            </button>
          </>
        )}
      </div>
    );
  }

  // ── Result ──
  const isChamp   = mode === 'championship' && roundRecords.length > 0;
  const p0roundWins = isChamp ? roundRecords.filter(r => r.p0 > r.p1).length : 0;
  const p1roundWins = isChamp ? roundRecords.filter(r => r.p0 < r.p1).length : 0;
  const winner =
    isChamp
      ? p0roundWins > p1roundWins ? (names[0] || 'Player 1')
        : p1roundWins > p0roundWins ? (names[1] || 'Player 2')
        : null
      : scores[0] > scores[1] ? (names[0] || 'Player 1')
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
            ? `${winner} is the Time Lord Champion! 🏆`
            : "It's a draw! You're both equally brilliant! 🤝"
        }
      />

      {isChamp ? (
        /* ── Championship result ── */
        <div className="result-card">
          <h2 style={{ textAlign: 'center', marginBottom: 12 }}>🏆 Championship Results</h2>

          {/* Round-by-round breakdown */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: 14 }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                <th style={{ textAlign: 'left', paddingBottom: 6 }}>Round</th>
                <th style={{ color: '#64b5f6' }}>{names[0] || 'P1'}</th>
                <th style={{ color: '#f06292' }}>{names[1] || 'P2'}</th>
                <th>Winner</th>
              </tr>
            </thead>
            <tbody>
              {roundRecords.map(r => {
                const rw = r.p0 > r.p1 ? '🔵' : r.p1 > r.p0 ? '🔴' : '🤝';
                return (
                  <tr key={r.round} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '5px 0', fontWeight: 600 }}>Round {r.round}</td>
                    <td style={{ textAlign: 'center', color: '#64b5f6', fontWeight: 700 }}>{r.p0}</td>
                    <td style={{ textAlign: 'center', color: '#f06292', fontWeight: 700 }}>{r.p1}</td>
                    <td style={{ textAlign: 'center' }}>{rw}</td>
                  </tr>
                );
              })}
              <tr style={{ borderTop: '2px solid rgba(255,255,255,0.15)', fontWeight: 800 }}>
                <td style={{ padding: '7px 0' }}>TOTAL</td>
                <td style={{ textAlign: 'center', color: '#64b5f6', fontSize: '1.1rem' }}>{scores[0]}</td>
                <td style={{ textAlign: 'center', color: '#f06292', fontSize: '1.1rem' }}>{scores[1]}</td>
                <td />
              </tr>
            </tbody>
          </table>

          {/* Round wins summary */}
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', color: '#64b5f6', fontWeight: 800 }}>{p0roundWins}</div>
              <div style={{ color: '#64b5f6', fontWeight: 700 }}>{names[0] || 'Player 1'}</div>
              {p0roundWins > p1roundWins && <div style={{ color: 'var(--gold)' }}>👑 Champion!</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              rounds won
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', color: '#f06292', fontWeight: 800 }}>{p1roundWins}</div>
              <div style={{ color: '#f06292', fontWeight: 700 }}>{names[1] || 'Player 2'}</div>
              {p1roundWins > p0roundWins && <div style={{ color: 'var(--gold)' }}>👑 Champion!</div>}
            </div>
          </div>
          {!winner && (
            <div style={{ textAlign: 'center', color: 'var(--accent-glow)', fontWeight: 700, marginTop: 8 }}>
              🤝 It's a draw!
            </div>
          )}
        </div>
      ) : (
        /* ── Regular battle result ── */
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
      )}

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
