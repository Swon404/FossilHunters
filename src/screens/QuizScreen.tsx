import { useState } from 'react';
import QuizCard from '../components/QuizCard';
import Chrono from '../components/Chrono';
import {
  generateQuiz,
  generateDeepDiveQuiz,
  generateComparisonQuiz,
  type Question,
} from '../engine/questionGenerator';
import { DIFFICULTY_CONFIG, calculatePoints, type Difficulty } from '../engine/scoring';
import { specimens } from '../data/specimens';
import { ERAS } from '../data/eras';
import { type PlayerProfile } from '../engine/storage';
import { type QuizCompleteData } from '../App';
import { type Screen } from '../App';

type Mode = Extract<Screen, 'quick-quiz' | 'sprint' | 'deep-dive' | 'which-is-older'>;

interface Props {
  mode: Mode;
  profile: PlayerProfile | null;
  onComplete: (data: QuizCompleteData) => void;
  onBack: () => void;
}

type Phase = 'setup' | 'playing' | 'result';

const MODE_INFO: Record<Mode, { title: string; desc: string; count: number }> = {
  'quick-quiz':    { title: '⚡ Quick Quiz',     desc: '10 questions, nice and snappy!',           count: 10 },
  'sprint':        { title: '🏃 Fossil Sprint',  desc: '20 questions — race the clock!',            count: 20 },
  'deep-dive':     { title: '🔬 Deep Dive',      desc: 'Master everything about one specimen.',     count: 8  },
  'which-is-older': { title: '⚖️ Which Is Older?', desc: 'Compare creatures through time.',          count: 12 },
};

export default function QuizScreen({ mode, onComplete, onBack }: Omit<Props, 'profile'> & { profile?: Props['profile'] }) {
  const [phase, setPhase]             = useState<Phase>('setup');
  const [difficulty, setDifficulty]   = useState<Difficulty>('scientist');
  const [selectedSpecimen, setSelectedSpecimen] = useState<string | null>(null);
  const [questions, setQuestions]     = useState<Question[]>([]);
  const [currentQ, setCurrentQ]       = useState(0);
  const [score, setScore]             = useState(0);
  const [streak, setStreak]           = useState(0);
  const [correct, setCorrect]         = useState(0);
  const [timeRemainingPcts, setTimeRemainingPcts] = useState<number[]>([]);
  const [secondAttemptFlags, setSecondAttemptFlags] = useState<boolean[]>([]);
  const [specimensUnlocked, setSpecimensUnlocked] = useState<string[]>([]);
  const [showExit, setShowExit]       = useState(false);

  const info = MODE_INFO[mode];
  const cfg  = DIFFICULTY_CONFIG[difficulty];

  function startQuiz() {
    let qs: Question[];
    if (mode === 'deep-dive') {
      qs = generateDeepDiveQuiz(selectedSpecimen ?? pickRandomSpecimen(), difficulty, info.count);
    } else if (mode === 'which-is-older') {
      qs = generateComparisonQuiz(difficulty, info.count);
    } else {
      qs = generateQuiz(difficulty, info.count);
    }
    setQuestions(qs);
    setCurrentQ(0);
    setScore(0);
    setStreak(0);
    setCorrect(0);
    setTimeRemainingPcts([]);
    setSecondAttemptFlags([]);
    setSpecimensUnlocked([]);
    setPhase('playing');
  }

  function pickRandomSpecimen(): string {
    return specimens[Math.floor(Math.random() * specimens.length)].id;
  }

  function handleAnswer(
    _choiceIndex: number,
    isCorrect: boolean,
    timeRemainingPct: number,
    wasSecondAttempt: boolean,
  ) {
    setTimeRemainingPcts(prev => [...prev, timeRemainingPct]);
    setSecondAttemptFlags(prev => [...prev, wasSecondAttempt]);

    if (isCorrect) {
      setCorrect(c => c + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      const q = questions[currentQ];
      if (q && !specimensUnlocked.includes(q.specimen.id)) {
        setSpecimensUnlocked(prev => [...prev, q.specimen.id]);
      }
    } else {
      setStreak(0);
    }
  }

  function handleNext() {
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      // Quiz done — calculate final score
      let total = 0;
      for (let i = 0; i < questions.length; i++) {
        if (i < correct) {
          total += calculatePoints(difficulty, streak, timeRemainingPcts[i] ?? 0, secondAttemptFlags[i] ?? false);
        }
      }
      setScore(total);
      setPhase('result');
    }
  }

  function handleFinalDone() {
    onComplete({
      score,
      correct,
      total: questions.length,
      streak,
      specimensUnlocked,
      difficulty,
      timeRemainingPercents: timeRemainingPcts,
      secondAttemptFlags,
    });
  }

  // ── Setup screen ────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="quiz-setup">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 className="setup-title">{info.title}</h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>{info.desc}</p>

        <Chrono expression="greeting" message="Pick your difficulty, brave explorer!" size={90} />

        <div className="difficulty-select">
          {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(d => {
            const dcfg = DIFFICULTY_CONFIG[d];
            return (
              <button
                key={d}
                className={`diff-btn ${difficulty === d ? 'selected' : ''}`}
                onClick={() => setDifficulty(d)}
              >
                <span className="diff-label">{dcfg.label}</span>
                <span className="diff-desc">{dcfg.description}</span>
                <span className="diff-detail">
                  {dcfg.choices} choices · {dcfg.basePoints} EP base
                  {dcfg.secondChance ? ' · 2nd chance!' : ''}
                </span>
              </button>
            );
          })}
        </div>

        {/* Deep Dive: pick a specimen */}
        {mode === 'deep-dive' && (
          <div className="deep-dive-picker">
            <h3>Which specimen?</h3>
            <button
              className={`dd-random-btn ${!selectedSpecimen ? 'selected' : ''}`}
              onClick={() => setSelectedSpecimen(null)}
            >
              🎲 Random surprise!
            </button>
            {ERAS.map(era => {
              const eraSpecimens = specimens.filter(s => s.eraId === era.id);
              if (eraSpecimens.length === 0) return null;
              return (
                <div key={era.id} className="dd-era-group">
                  <div className="dd-era-label">{era.emoji} {era.name}</div>
                  <div className="dd-specimen-grid">
                    {eraSpecimens.map(s => (
                      <button
                        key={s.id}
                        className={`dd-specimen-cell ${selectedSpecimen === s.id ? 'selected' : ''}`}
                        onClick={() => setSelectedSpecimen(s.id)}
                      >
                        <span className="dd-cell-emoji">{s.emoji}</span>
                        <span className="dd-cell-name">{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button className="start-btn" onClick={startQuiz}>
          Start! 🚀
        </button>
      </div>
    );
  }

  // ── Playing ─────────────────────────────────────────────────────
  if (phase === 'playing') {
    const q = questions[currentQ];
    if (!q) return null;
    return (
      <div className="quiz-playing">
        <div className="quiz-score-bar">
          <span className="score-display">{score} EP</span>
          <button className="quiz-exit-btn" onClick={() => setShowExit(true)} aria-label="Exit quiz">✕</button>
        </div>

        <QuizCard
          question={q}
          questionNumber={currentQ + 1}
          totalQuestions={questions.length}
          score={score}
          streak={streak}
          timerSeconds={cfg.timerSeconds}
          secondChance={cfg.secondChance}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />

        {showExit && (
          <div className="exit-confirm-overlay" role="dialog" aria-modal="true">
            <div className="exit-confirm-card">
              <Chrono expression="thinking" size={70} />
              <p>Abandon this quiz?</p>
              <p className="exit-confirm-sub">Your progress in this round won't be saved.</p>
              <div className="exit-confirm-actions">
                <button className="start-btn" style={{ flex: 1 }} onClick={() => setShowExit(false)}>
                  Keep going!
                </button>
                <button className="back-btn" onClick={onBack}>Leave</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Result ───────────────────────────────────────────────────────
  const accuracy = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

  return (
    <div className="quiz-result">
      <Chrono
        expression={accuracy >= 70 ? 'celebrate' : accuracy >= 40 ? 'correct' : 'wrong'}
        size={110}
        className="chrono-wobble"
        message={
          accuracy === 100 ? "PERFECT! Chrono is literally doing backflips right now! 🤖💃"
          : accuracy >= 80  ? "Amazing result! You're basically a time lord! ⏰"
          : accuracy >= 60  ? "Good work! Chrono approves! Keep digging! ⛏️"
          : accuracy >= 40  ? "Not bad! The fossil record was confusing at first for everyone! 🦴"
          : "Don't worry! Even dinosaurs had off days. Try again! 🦕"
        }
      />

      <div className="result-card">
        <h2>{info.title} — Complete!</h2>
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
          <div className="result-stat">
            <span className="stat-value" style={{ color: streak >= 3 ? 'var(--gold)' : undefined }}>
              🔥{streak}
            </span>
            <span className="stat-label">best streak</span>
          </div>
        </div>

        {specimensUnlocked.length > 0 && (
          <div className="result-collected">
            🦖 {specimensUnlocked.length} specimen{specimensUnlocked.length !== 1 ? 's' : ''} added to your museum!
          </div>
        )}
      </div>

      <div className="result-actions">
        <button className="start-btn" style={{ flex: 1 }} onClick={startQuiz}>
          Play again!
        </button>
        <button className="back-btn" onClick={handleFinalDone}>
          Save & Home
        </button>
      </div>
    </div>
  );
}
