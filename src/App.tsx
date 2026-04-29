import { useState } from 'react';
import './styles.css';
import { getActiveProfile, setActiveProfile, updateProfile, collectSpecimen, addEP, incrementQuizzes, recordAnswer, addMilestone, getActiveProfileId, type PlayerProfile } from './engine/storage';
import { calculatePoints, getRank, MILESTONES, type Difficulty } from './engine/scoring';
import { playRankUp, playCollect } from './engine/sounds';
import { isIntroSeen, markIntroSeen } from './engine/storage';
import { APP_VERSION } from './version';

import IntroScreen       from './screens/IntroScreen';
import ProfileScreen     from './screens/ProfileScreen';
import HomeScreen        from './screens/HomeScreen';
import QuizScreen        from './screens/QuizScreen';
import MemoryGameScreen  from './screens/MemoryGameScreen';
import TimelineOrderScreen from './screens/TimelineOrderScreen';
import SilhouettePickScreen from './screens/SilhouettePickScreen';
import MuseumScreen      from './screens/MuseumScreen';
import DinoBuilderScreen from './screens/DinoBuilderScreen';
import TwoPlayerScreen   from './screens/TwoPlayerScreen';

export type Screen =
  | 'intro'
  | 'profile'
  | 'home'
  | 'quick-quiz'
  | 'sprint'
  | 'deep-dive'
  | 'which-is-older'
  | 'two-player'
  | 'museum'
  | 'memory-game'
  | 'timeline-order'
  | 'silhouette-pick'
  | 'dino-builder';

export interface QuizCompleteData {
  score: number;
  correct: number;
  total: number;
  streak: number;
  specimensUnlocked: string[];
  difficulty: Difficulty;
  timeRemainingPercents: number[];
  secondAttemptFlags: boolean[];
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    if (!isIntroSeen()) return 'intro';
    if (!getActiveProfileId()) return 'profile';
    return 'home';
  });

  const [activeProfile, setActiveProfileState] = useState<PlayerProfile | null>(getActiveProfile);

  function refreshProfile() {
    setActiveProfileState(getActiveProfile());
  }

  function handleIntroDone() {
    markIntroSeen();
    setScreen('profile');
  }

  function handleProfileSelected(id: string) {
    setActiveProfile(id);
    refreshProfile();
    setScreen('home');
  }

  function handleQuizComplete(data: QuizCompleteData) {
    const profile = getActiveProfile();
    if (!profile) return;

    let { progress } = profile;
    const prevEP = progress.ep;

    // Award EP per correct answer
    data.correct > 0 && Array.from({ length: data.correct }).forEach((_, i) => {
      const pts = calculatePoints(
        data.difficulty,
        data.streak,
        data.timeRemainingPercents[i] ?? 0,
        data.secondAttemptFlags[i] ?? false,
      );
      progress = addEP(progress, pts);
    });

    // Record stats
    for (let i = 0; i < data.total; i++) {
      progress = recordAnswer(progress, i < data.correct, data.streak);
    }
    progress = incrementQuizzes(progress);

    // Collect specimens
    for (const id of data.specimensUnlocked) {
      const wasNew = !progress.specimensCollected.includes(id);
      progress = collectSpecimen(progress, id);
      if (wasNew) {
        playCollect().catch(() => { /* ignore */ });
      }
    }

    // Check milestones
    for (const milestone of MILESTONES) {
      if (!progress.milestonesEarned.includes(milestone.id)) {
        if (milestone.check(progress.ep, progress.specimensCollected.length, progress.totalQuestionsAnswered)) {
          progress = addMilestone(progress, milestone.id);
        }
      }
    }

    // Rank up?
    const prevRank = getRank(prevEP);
    const newRank  = getRank(progress.ep);
    if (prevRank.name !== newRank.name) {
      playRankUp().catch(() => { /* ignore */ });
    }

    updateProfile({ ...profile, progress });
    refreshProfile();
    setScreen('home');
  }

  function handleMemoryComplete(score: number) {
    const profile = getActiveProfile();
    if (!profile) return;
    let { progress } = profile;
    progress = addEP(progress, score);
    progress = incrementQuizzes(progress);
    updateProfile({ ...profile, progress });
    refreshProfile();
    setScreen('home');
  }

  const profile = activeProfile;

  return (
    <div className="app">
      {screen === 'intro' && (
        <IntroScreen onDone={handleIntroDone} />
      )}
      {screen === 'profile' && (
        <ProfileScreen onProfileSelected={handleProfileSelected} />
      )}
      {screen === 'home' && profile && (
        <HomeScreen
          profile={profile}
          onNavigate={setScreen}
          onSwitchProfile={() => setScreen('profile')}
        />
      )}
      {(screen === 'quick-quiz' || screen === 'sprint' || screen === 'deep-dive' || screen === 'which-is-older') && (
        <QuizScreen
          mode={screen}
          profile={profile}
          onComplete={handleQuizComplete}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'memory-game' && (
        <MemoryGameScreen
          profile={profile}
          onComplete={handleMemoryComplete}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'timeline-order' && (
        <TimelineOrderScreen
          profile={profile}
          onComplete={handleMemoryComplete}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'silhouette-pick' && (
        <SilhouettePickScreen
          profile={profile}
          onComplete={handleMemoryComplete}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'museum' && (
        <MuseumScreen
          profile={profile}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'dino-builder' && (
        <DinoBuilderScreen
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'two-player' && (
        <TwoPlayerScreen
          onBack={() => setScreen('home')}
        />
      )}
      <div className="app-version">v{APP_VERSION}</div>
    </div>
  );
}
