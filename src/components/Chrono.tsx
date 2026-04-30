import type React from 'react';
import { speak, isTTSSupported } from '../engine/tts';

type Expression = 'greeting' | 'thinking' | 'correct' | 'wrong' | 'hint' | 'celebrate';

interface ChronoProps {
  expression: Expression;
  message?: string;
  className?: string;
  size?: number;
}

const visorColors: Record<Expression, { visor: string; glow: string; chassis: string }> = {
  greeting:  { visor: '#00e5ff', glow: '#80deea', chassis: '#546e7a' },
  thinking:  { visor: '#ffca28', glow: '#ffe082', chassis: '#607d8b' },
  correct:   { visor: '#66bb6a', glow: '#a5d6a7', chassis: '#455a64' },
  wrong:     { visor: '#ef5350', glow: '#ef9a9a', chassis: '#78909c' },
  hint:      { visor: '#ce93d8', glow: '#e1bee7', chassis: '#546e7a' },
  celebrate: { visor: '#ffd54f', glow: '#fff9c4', chassis: '#37474f' },
};

/* Visor display content changes with expression */
const visorDisplay: Record<Expression, React.ReactNode> = {
  greeting: (
    <>
      {/* Friendly scanning line */}
      <rect x="28" y="34" width="44" height="3" rx="1.5" fill="#00e5ff" opacity="0.9">
        <animate attributeName="y" values="34;48;34" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite" />
      </rect>
      {/* "Hello" dots */}
      <circle cx="38" cy="40" r="4" fill="#00e5ff" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1s" repeatCount="indefinite" begin="0s" />
      </circle>
      <circle cx="50" cy="40" r="4" fill="#00e5ff" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1s" repeatCount="indefinite" begin="0.3s" />
      </circle>
      <circle cx="62" cy="40" r="4" fill="#00e5ff" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1s" repeatCount="indefinite" begin="0.6s" />
      </circle>
    </>
  ),
  thinking: (
    <>
      {/* Question mark flicker */}
      <text x="44" y="50" fontFamily="monospace" fontSize="20" fill="#ffca28" textAnchor="middle" opacity="0.9">
        ?
        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.2s" repeatCount="indefinite" />
      </text>
      {/* Small rotating dots */}
      <circle cx="62" cy="38" r="3" fill="#ffca28" opacity="0.7">
        <animateTransform attributeName="transform" type="rotate" values="0 50 42;360 50 42" dur="3s" repeatCount="indefinite" />
      </circle>
    </>
  ),
  correct: (
    <>
      {/* Big tick */}
      <path d="M30 42 L42 54 L70 30" stroke="#66bb6a" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="stroke-dasharray" values="0,100;100,0" dur="0.4s" fill="freeze" />
      </path>
    </>
  ),
  wrong: (
    <>
      {/* X mark */}
      <line x1="32" y1="32" x2="68" y2="58" stroke="#ef5350" strokeWidth="5" strokeLinecap="round" />
      <line x1="68" y1="32" x2="32" y2="58" stroke="#ef5350" strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  hint: (
    <>
      {/* Lightbulb icon */}
      <circle cx="50" cy="36" r="9" fill="none" stroke="#ce93d8" strokeWidth="2.5" opacity="0.8" />
      <rect x="44" y="44" width="12" height="3" rx="1.5" fill="#ce93d8" opacity="0.8" />
      <rect x="46" y="48" width="8" height="3" rx="1.5" fill="#ce93d8" opacity="0.7" />
      <line x1="50" y1="22" x2="50" y2="26" stroke="#ce93d8" strokeWidth="2" strokeLinecap="round">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
      </line>
      <line x1="35" y1="27" x2="38" y2="30" stroke="#ce93d8" strokeWidth="2" strokeLinecap="round">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
      </line>
      <line x1="65" y1="27" x2="62" y2="30" stroke="#ce93d8" strokeWidth="2" strokeLinecap="round">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.6s" />
      </line>
    </>
  ),
  celebrate: (
    <>
      {/* Party stars bursting */}
      {[
        { cx: 38, cy: 34, delay: '0s' },
        { cx: 62, cy: 34, delay: '0.2s' },
        { cx: 50, cy: 28, delay: '0.4s' },
        { cx: 42, cy: 52, delay: '0.1s' },
        { cx: 58, cy: 52, delay: '0.3s' },
      ].map((s, i) => (
        <g key={i}>
          <line x1={s.cx} y1={s.cy - 6} x2={s.cx} y2={s.cy + 6} stroke="#ffd54f" strokeWidth="2.5" strokeLinecap="round">
            <animate attributeName="opacity" values="1;0.2;1" dur="0.5s" repeatCount="indefinite" begin={s.delay} />
          </line>
          <line x1={s.cx - 6} y1={s.cy} x2={s.cx + 6} y2={s.cy} stroke="#ffd54f" strokeWidth="2.5" strokeLinecap="round">
            <animate attributeName="opacity" values="1;0.2;1" dur="0.5s" repeatCount="indefinite" begin={s.delay} />
          </line>
        </g>
      ))}
    </>
  ),
};

export default function Chrono({ expression, message, className, size = 100 }: ChronoProps) {
  const col = visorColors[expression];
  const svgSize = size;

  return (
    <div className={`chrono-wrapper ${className ?? ''}`} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 100 110"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: `drop-shadow(0 0 8px ${col.glow})`, flexShrink: 0 }}
        aria-label={`Chrono the time-travel robot, ${expression}`}
        role="img"
      >
        {/* ── Jet boosters (bottom) ── */}
        <rect x="30" y="95" width="14" height="9" rx="4" fill="#455a64" />
        <rect x="56" y="95" width="14" height="9" rx="4" fill="#455a64" />
        {/* Booster flames */}
        <ellipse cx="37" cy="105" rx="5" ry="3" fill="#ff6f00" opacity="0.8">
          <animate attributeName="ry" values="3;5;3" dur="0.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.4;0.8" dur="0.4s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="63" cy="105" rx="5" ry="3" fill="#ff6f00" opacity="0.8">
          <animate attributeName="ry" values="3;5;3" dur="0.4s" repeatCount="indefinite" begin="0.2s" />
          <animate attributeName="opacity" values="0.8;0.4;0.8" dur="0.4s" repeatCount="indefinite" begin="0.2s" />
        </ellipse>

        {/* ── Body (torso) ── */}
        <rect x="22" y="62" width="56" height="36" rx="10" fill={col.chassis} />
        {/* Chest panel with rivets */}
        <rect x="30" y="68" width="40" height="20" rx="5" fill="#263238" opacity="0.6" />
        <circle cx="33" cy="71" r="2" fill="#78909c" />
        <circle cx="67" cy="71" r="2" fill="#78909c" />
        <circle cx="33" cy="85" r="2" fill="#78909c" />
        <circle cx="67" cy="85" r="2" fill="#78909c" />
        {/* Clock face on chest */}
        <circle cx="50" cy="78" r="7" fill="#1a237e" opacity="0.8" />
        <circle cx="50" cy="78" r="7" fill="none" stroke="#7986cb" strokeWidth="1" />
        <line x1="50" y1="78" x2="50" y2="73" stroke="#e8eaf6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="78" x2="54" y2="80" stroke="#e8eaf6" strokeWidth="1.5" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" values="0 50 78;360 50 78" dur="10s" repeatCount="indefinite" />
        </line>

        {/* ── Arms ── */}
        <rect x="4"  y="65" width="20" height="10" rx="5" fill={col.chassis} />
        <rect x="76" y="65" width="20" height="10" rx="5" fill={col.chassis} />
        {/* Hands */}
        <circle cx="7"  cy="70" r="5" fill="#455a64" />
        <circle cx="93" cy="70" r="5" fill="#455a64" />

        {/* ── Neck ── */}
        <rect x="42" y="56" width="16" height="8" rx="3" fill="#546e7a" />

        {/* ── Head ── */}
        <rect x="18" y="16" width="64" height="42" rx="12" fill={col.chassis} />
        {/* Head bolts */}
        <circle cx="22" cy="20" r="2.5" fill="#455a64" />
        <circle cx="78" cy="20" r="2.5" fill="#455a64" />
        <circle cx="22" cy="54" r="2.5" fill="#455a64" />
        <circle cx="78" cy="54" r="2.5" fill="#455a64" />

        {/* ── Antenna ── */}
        <line x1="50" y1="16" x2="50" y2="4" stroke="#78909c" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="4" r="4" fill={col.visor}>
          <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        {/* Ear panels */}
        <rect x="10" y="26" width="9" height="16" rx="3" fill="#455a64" />
        <rect x="81" y="26" width="9" height="16" rx="3" fill="#455a64" />

        {/* ── Visor (screen) ── */}
        <rect x="26" y="24" width="48" height="30" rx="8" fill="#0a1929" />
        <rect x="26" y="24" width="48" height="30" rx="8" fill={col.visor} opacity="0.08" />
        {/* Visor glare */}
        <rect x="29" y="26" width="15" height="4" rx="2" fill="white" opacity="0.12" />
        {/* Expression display */}
        {visorDisplay[expression]}
      </svg>

      {message && (
        <div className="chrono-message" role="status" aria-live="polite">
          {message}
          {isTTSSupported() && (
            <button
              className="tts-btn tts-btn-small"
              onClick={() => speak(message)}
              aria-label="Read aloud"
              title="Read aloud"
              style={{ display: 'inline-block', marginLeft: 6, verticalAlign: 'middle' }}
            >
              🔊
            </button>
          )}
        </div>
      )}
    </div>
  );
}
