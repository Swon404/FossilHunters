import { useState } from 'react';
import Chrono from '../components/Chrono';
import { type PlayerProfile } from '../engine/storage';
import { getRank, getNextRank, MILESTONES } from '../engine/scoring';
import { type Screen } from '../App';
import { speak, isTTSSupported, getAllVoices, getSavedVoiceName, saveVoiceName, getSavedRate, saveRate } from '../engine/tts';

interface Props {
  profile: PlayerProfile;
  onNavigate: (screen: Screen) => void;
  onSwitchProfile: () => void;
}

interface MenuItem {
  screen: Screen;
  icon: string;
  label: string;
  desc: string;
  primary?: boolean;
}

interface MenuGroup {
  icon: string;
  label: string;
  items: MenuItem[];
}

const MENU_GROUPS: MenuGroup[] = [
  {
    icon: '🧠',
    label: 'Quizzes',
    items: [
      { screen: 'quick-quiz',   icon: '⚡', label: 'Quick Quiz',    desc: '10 questions, pick a difficulty', primary: true },
      { screen: 'sprint',       icon: '🏃', label: 'Fossil Sprint', desc: 'Race through 20 questions!' },
      { screen: 'deep-dive',    icon: '🔬', label: 'Deep Dive',     desc: 'Master one specimen completely' },
    ],
  },
  {
    icon: '🎮',
    label: 'Games',
    items: [
      { screen: 'two-player',      icon: '👥', label: '2 Player',         desc: 'Challenge a friend!' },
      { screen: 'which-is-older',  icon: '⚖️', label: 'Which Is Older?',  desc: 'Compare creatures through time' },
      { screen: 'memory-game',     icon: '🧩', label: 'Memory Match',      desc: 'Flip cards & find the pairs' },
      { screen: 'timeline-order',  icon: '📅', label: 'Timeline Order',    desc: 'Sort oldest to newest' },
      { screen: 'silhouette-pick', icon: '🔮', label: 'Silhouette Pick',   desc: 'Identify the mystery creature' },
    ],
  },
  {
    icon: '🏛️',
    label: 'Create & Explore',
    items: [
      { screen: 'dino-builder', icon: '🦕', label: 'Dino Builder', desc: 'Design your own dinosaur!' },
      { screen: 'museum',       icon: '🏺', label: 'Museum',        desc: 'Browse your collection' },
    ],
  },
];

const TIPS = [
  '🦕 T-Rex had tiny arms but could eat 230 kg of meat in one bite. Table manners were optional.',
  '🦔 Woolly mammoths were still alive when the pyramids were being built in Egypt!',
  '🌿 Stegosaurus had a brain about the size of a walnut. A really cool walnut though.',
  '🐾 Velociraptors were actually about the size of a turkey. A terrifying, feathered turkey.',
  '🦴 Fossils take up to 10,000 years to form. Patience is a virtue.',
  '🌍 Dinosaurs lived on every continent, including Antarctica. Brr.',
  '🤖 Chrono has personally visited all 9 eras. He says the Jurassic smelled like wet ferns.',
  '🐟 Mosasaurus was so big it could swallow a great white shark whole. Sleep well.',
  '🪨 The Stone Age lasted over 3 million years. That\'s a lot of rocks.',
  '⚔️ Bronze is made by mixing copper and tin. Early humans basically invented alloys!',
];

export default function HomeScreen({ profile, onNavigate, onSwitchProfile }: Props) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ Quizzes: true });
  const [showMilestones, setShowMilestones] = useState(false);
  const [tipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voices] = useState(() => getAllVoices());
  const [selectedVoice, setSelectedVoice] = useState(() => getSavedVoiceName() ?? '');
  const [rate, setRate] = useState(() => getSavedRate());

  const { progress } = profile;
  const rank         = getRank(progress.ep);
  const nextRank     = getNextRank(progress.ep);
  const epToNext     = nextRank ? nextRank.minEP - progress.ep : 0;
  const epPct        = nextRank
    ? Math.min(100, ((progress.ep - rank.minEP) / (nextRank.minEP - rank.minEP)) * 100)
    : 100;

  function toggleGroup(label: string) {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  }

  const earnedMilestones = MILESTONES.filter(m => progress.milestonesEarned.includes(m.id));
  const pendingMilestones = MILESTONES.filter(m => !progress.milestonesEarned.includes(m.id));

  return (
    <div className="home-screen">
      <div className="home-header">
        <div className="game-title">
          <span className="title-accent">Fossil</span> Hunters
        </div>
        <Chrono expression="greeting" size={80} className="chrono-wobble" />
      </div>

      {/* Stats card */}
      <div className="home-stats">
        <div className="player-header">
          <span className="player-greeting">👋 Hey, {profile.name}!</span>
          <button className="switch-profile-btn" onClick={onSwitchProfile}>Switch</button>
        </div>

        <div className="rank-display">
          <span className="rank-icon">{rank.icon}</span>
          <span>{rank.name}</span>
        </div>

        <div className="ep-display">
          <span className="ep-amount">{progress.ep.toLocaleString()} EP</span>
          <div className="ep-progress">
            <div className="ep-bar" style={{ width: `${epPct}%` }} />
          </div>
          {nextRank && (
            <span className="ep-next">{epToNext} EP to {nextRank.name}</span>
          )}
        </div>

        <div className="home-ministat">
          <span>🦖 {progress.specimensCollected.length}/80 collected</span>
          <span>·</span>
          <span>✅ {progress.correctAnswers}/{progress.totalQuestionsAnswered} correct</span>
          {earnedMilestones.length > 0 && (
            <>
              <span>·</span>
              <button
                className="ministat-btn"
                onClick={() => setShowMilestones(v => !v)}
              >
                🏅 {earnedMilestones.length} milestone{earnedMilestones.length !== 1 ? 's' : ''}
              </button>
            </>
          )}
        </div>

        {/* Milestones drawer */}
        {showMilestones && (
          <div className="milestones-panel">
            {earnedMilestones.map(m => (
              <div key={m.id} className="milestone milestone-done">
                <span className="milestone-icon">{m.icon}</span>
                <div className="milestone-info">
                  <span className="milestone-title">{m.title}</span>
                  <span className="milestone-desc">{m.description}</span>
                </div>
              </div>
            ))}
            {pendingMilestones.slice(0, 2).map(m => (
              <div key={m.id} className="milestone milestone-locked">
                <span className="milestone-icon">🔒</span>
                <div className="milestone-info">
                  <span className="milestone-title">{m.title}</span>
                  <span className="milestone-desc">{m.description}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily tip */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        💡 {TIPS[tipIndex]}
      </div>

      {/* Voice settings */}
      {isTTSSupported() && (
        <>
          <button className="voice-settings-toggle" onClick={() => setShowVoiceSettings(v => !v)}>
            🔊 Voice Settings {showVoiceSettings ? '▲' : '▼'}
          </button>
          {showVoiceSettings && (
            <div className="voice-settings-panel">
              <h3>🔊 Voice Settings</h3>
              {voices.length > 0 && (
                <label className="voice-setting-label">
                  Voice
                  <select
                    className="voice-select"
                    value={selectedVoice}
                    onChange={e => { saveVoiceName(e.target.value); setSelectedVoice(e.target.value); }}
                  >
                    {voices.map(v => (
                      <option key={v.name} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </label>
              )}
              <label className="voice-setting-label">
                Speed: {rate.toFixed(1)}x
                <input
                  type="range" min="0.5" max="2.0" step="0.1" value={rate}
                  onChange={e => { const r = parseFloat(e.target.value); setRate(r); saveRate(r); }}
                  className="voice-range"
                />
              </label>
              <button className="start-btn" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}
                onClick={() => speak("Hello! I am Chrono, your fossil hunting buddy! Let's dig up some history!")}>
                🔊 Test Voice
              </button>
            </div>
          )}
        </>
      )}

      {/* Menu groups */}
      <div className="home-menu">
        {MENU_GROUPS.map(group => (
          <div key={group.label} className="menu-group">
            <button
              className="menu-group-header"
              onClick={() => toggleGroup(group.label)}
              aria-expanded={!!openGroups[group.label]}
            >
              <span className="menu-group-icon">{group.icon}</span>
              <span className="menu-group-label">{group.label}</span>
              <span className={`menu-group-chevron ${openGroups[group.label] ? 'open' : ''}`}>▶</span>
            </button>
            {openGroups[group.label] && (
              <div className="menu-group-items">
                {group.items.map(item => (
                  <button
                    key={item.screen}
                    className={`menu-btn ${item.primary ? 'primary' : ''}`}
                    onClick={() => onNavigate(item.screen)}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-label">
                      {item.label}
                      <span className="menu-desc">{item.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
