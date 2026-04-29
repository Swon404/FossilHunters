import { useState, useEffect } from 'react';
import Chrono from '../components/Chrono';

type Expression = 'greeting' | 'thinking' | 'correct' | 'wrong' | 'hint' | 'celebrate';

interface Step {
  expression: Expression;
  message: string;
}

const STEPS: Step[] = [
  {
    expression: 'greeting',
    message: "Beep boop! I'm Chrono — a time-travelling robot who's seen ALL of history. No big deal. 🤖",
  },
  {
    expression: 'celebrate',
    message: 'From gigantic dinosaurs 230 million years ago to the Iron Age just 2,000 years back — we\'ll explore it all! 🦕',
  },
  {
    expression: 'thinking',
    message: "There are dinosaurs, mammoths, cave paintings, swords and hillforts to discover — and I'll quiz you on every single one. 🧠",
  },
  {
    expression: 'correct',
    message: 'Get questions right to earn Excavation Points, collect specimens for your Museum, and climb the ranks! ⭐',
  },
  {
    expression: 'celebrate',
    message: "Ready to travel through time? Buckle up — it's going to be a bumpy 230 million years! 🦖",
  },
];

interface Props {
  onDone: () => void;
}

export default function IntroScreen({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  const current = STEPS[step];

  function advance() {
    if (step < STEPS.length - 1) {
      setVisible(false);
      setTimeout(() => {
        setStep(s => s + 1);
        setVisible(true);
      }, 200);
    } else {
      onDone();
    }
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === ' ') advance();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  return (
    <div className="intro-screen" onClick={advance} role="main" aria-label="Introduction">
      {/* Progress dots */}
      <div className="intro-dots" role="progressbar" aria-valuenow={step + 1} aria-valuemax={STEPS.length}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`intro-dot ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Chrono mascot */}
      <div className={`intro-content ${visible ? 'intro-visible' : ''}`}>
        <Chrono
          expression={current.expression}
          message={current.message}
          size={140}
          className="chrono-wobble"
        />
      </div>

      {/* Navigation */}
      <div className="intro-actions" onClick={e => e.stopPropagation()}>
        {step < STEPS.length - 1 ? (
          <>
            <button className="start-btn intro-next-btn" onClick={advance}>
              Next →
            </button>
            <button className="back-btn" onClick={onDone}>
              Skip
            </button>
          </>
        ) : (
          <button className="start-btn intro-next-btn" onClick={onDone}>
            Let's go! 🚀
          </button>
        )}
      </div>
    </div>
  );
}
