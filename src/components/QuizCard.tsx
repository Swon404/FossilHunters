import { useState, useEffect, useRef } from 'react';
import Chrono from './Chrono';
import { type Question } from '../engine/questionGenerator';
import { playCorrect, playWrong, playStreak, playTick } from '../engine/sounds';
import { speak, isTTSSupported } from '../engine/tts';

interface Props {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  score: number;
  streak: number;
  timerSeconds: number;
  secondChance: boolean;
  onAnswer: (correctIndex: number, isCorrect: boolean, timeRemainingPct: number, wasSecondAttempt: boolean) => void;
  onNext: () => void;
}

type Phase = 'answering' | 'second-chance' | 'revealed';

export default function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  score,
  streak,
  timerSeconds,
  secondChance,
  onAnswer,
  onNext,
}: Props) {
  const [selected, setSelected]       = useState<number | null>(null);
  const [phase, setPhase]             = useState<Phase>('answering');
  const [timeLeft, setTimeLeft]       = useState(timerSeconds);
  const [isSecondAttempt, setIsSecondAttempt] = useState(false);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    setSelected(null);
    setPhase('answering');
    setTimeLeft(timerSeconds);
    setIsSecondAttempt(false);
    startTime.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        if (t <= 5) playTick().catch(() => { /* ignore */ });
        return t - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [question.id]);

  function handleTimeout() {
    const timeRemainingPct = 0;
    setPhase('revealed');
    playWrong().catch(() => { /* ignore */ });
    onAnswer(question.correctIndex, false, timeRemainingPct, isSecondAttempt);
  }

  function handleChoiceClick(index: number) {
    if (phase === 'revealed') return;
    if (timerRef.current) clearInterval(timerRef.current);

    const elapsed  = (Date.now() - startTime.current) / 1000;
    const timeRemainingPct = Math.max(0, (timerSeconds - elapsed) / timerSeconds);
    const isCorrect = index === question.correctIndex;

    setSelected(index);

    if (isCorrect) {
      setPhase('revealed');
      playCorrect().catch(() => { /* ignore */ });
      if (streak + 1 >= 3) playStreak().catch(() => { /* ignore */ });
      onAnswer(index, true, timeRemainingPct, isSecondAttempt);
    } else {
      if (secondChance && !isSecondAttempt) {
        setPhase('second-chance');
        setIsSecondAttempt(true);
        playWrong().catch(() => { /* ignore */ });
        // Restart a shorter timer for second attempt
        setTimeout(() => {
          setSelected(null);
          setPhase('answering');
          startTime.current = Date.now();
          timerRef.current = setInterval(() => {
            setTimeLeft(t => {
              if (t <= 1) { clearInterval(timerRef.current!); handleTimeout(); return 0; }
              return t - 1;
            });
          }, 1000);
        }, 800);
      } else {
        setPhase('revealed');
        playWrong().catch(() => { /* ignore */ });
        onAnswer(index, false, timeRemainingPct, isSecondAttempt);
      }
    }
  }

  function getChoiceClass(i: number): string {
    if (phase !== 'revealed') {
      return selected === i && phase === 'second-chance' ? 'choice-btn wrong' : 'choice-btn';
    }
    if (i === question.correctIndex) return 'choice-btn correct';
    if (selected === i && i !== question.correctIndex) return 'choice-btn wrong';
    return 'choice-btn disabled';
  }

  const timerPct = (timeLeft / timerSeconds) * 100;
  const timerColor = timerPct > 50 ? '#4caf50' : timerPct > 25 ? '#ff9800' : '#ef5350';

  const chronoExpression =
    phase === 'answering'       ? 'thinking'
    : phase === 'second-chance' ? 'hint'
    : selected === question.correctIndex ? 'correct'
    : 'wrong';

  const chronoMessage =
    phase === 'second-chance'
      ? "Hmm! Try again — you've got this! 🤔"
      : phase === 'revealed' && selected === question.correctIndex
        ? ["Brilliant! 🦕", "Correct! You're on fire! 🔥", "Spot on! Chrono approves! 🤖", "Excellent! +points!"][Math.floor(Math.random() * 4)]
        : phase === 'revealed'
          ? ["Oops! Better luck next time! 🙈", "Not quite! Keep going! 💪", "Wrong-ish! But now you know! 🧠"][Math.floor(Math.random() * 3)]
          : undefined;

  return (
    <div className="quiz-card">
      {/* Header: progress + timer + streak */}
      <div className="quiz-header">
        <span className="quiz-progress">{questionNumber}/{totalQuestions}</span>
        <div className="quiz-timer" aria-label={`${timeLeft} seconds remaining`}>
          <div
            className="timer-bar"
            style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
          />
        </div>
        <span className="quiz-streak">{streak >= 2 ? `🔥 ×${streak}` : ''}</span>
      </div>

      {/* Score */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Score: <strong style={{ color: 'var(--accent-glow)' }}>{score}</strong>
        &nbsp;· Time: <strong style={{ color: timerColor }}>{timeLeft}s</strong>
      </div>

      {/* Specimen image / emoji + name */}
      <div className="quiz-image">
        {question.imageUrl
          ? <img src={question.imageUrl} alt={question.specimen.name} />
          : <div className="quiz-image-emoji">{question.specimen.emoji}</div>
        }
        <div className="quiz-image-name">{question.specimen.name}</div>
      </div>

      {/* Question text + TTS */}
      <div className="quiz-question">
        <h2>{question.text}</h2>
        {isTTSSupported() && (
          <button
            className="tts-btn"
            onClick={() => speak(question.text)}
            aria-label="Read question aloud"
            title="Read aloud"
          >
            🔊
          </button>
        )}
      </div>

      {/* Choices */}
      <div className="quiz-choices" role="group" aria-label="Answer choices">
        {question.choices.map((choice, i) => (
          <button
            key={i}
            className={getChoiceClass(i)}
            onClick={() => handleChoiceClick(i)}
            disabled={phase === 'revealed'}
            aria-pressed={selected === i}
          >
            <span className="choice-letter">{String.fromCharCode(65 + i)}.</span>
            <span className="choice-text">{choice}</span>
          </button>
        ))}
      </div>

      {/* Chrono reaction */}
      {(phase === 'second-chance' || phase === 'revealed') && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
          <Chrono expression={chronoExpression} message={chronoMessage} size={70} />
        </div>
      )}

      {/* Explanation + Next */}
      {phase === 'revealed' && (
        <>
          <div className="quiz-explanation" role="status">
            {question.explanation}
            {isTTSSupported() && (
              <button
                className="tts-btn tts-btn-small"
                onClick={() => speak(question.explanation)}
                aria-label="Read explanation aloud"
                title="Read explanation aloud"
              >
                🔊
              </button>
            )}
          </div>
          <button className="start-btn next-btn" onClick={onNext}>
            {questionNumber < totalQuestions ? 'Next →' : 'Finish!'}
          </button>
        </>
      )}

      {/* Time's up message */}
      {timeLeft === 0 && phase === 'answering' && (
        <div className="quiz-explanation" role="alert">
          ⏰ Time's up! The answer was: <strong>{question.choices[question.correctIndex]}</strong>
        </div>
      )}
    </div>
  );
}
