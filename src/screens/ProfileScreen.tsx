import { useState } from 'react';
import Chrono from '../components/Chrono';
import {
  getProfiles,
  createProfile,
  deleteProfile,
  type PlayerProfile,
} from '../engine/storage';
import { getRank } from '../engine/scoring';

interface Props {
  onProfileSelected: (id: string) => void;
}

export default function ProfileScreen({ onProfileSelected }: Props) {
  const [profiles, setProfiles]       = useState<PlayerProfile[]>(getProfiles);
  const [newName, setNewName]         = useState('');
  const [creating, setCreating]       = useState(profiles.length === 0);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function refresh() {
    setProfiles(getProfiles());
  }

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    const p = createProfile(name);
    refresh();
    setNewName('');
    setCreating(false);
    onProfileSelected(p.id);
  }

  function handleDelete(id: string) {
    deleteProfile(id);
    refresh();
    setConfirmDelete(null);
  }

  return (
    <div className="profile-screen">
      <Chrono expression="greeting" size={100} />
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, textAlign: 'center' }}>
        Who's exploring time today?
      </h1>

      {/* Existing profiles */}
      {profiles.length > 0 && (
        <div className="profile-list">
          <h2>Pick a traveller</h2>
          {profiles.map(p => {
            const rank = getRank(p.progress.ep);
            return (
              <div key={p.id} className="profile-card" onClick={() => onProfileSelected(p.id)}>
                <div style={{ fontSize: '2rem' }}>{rank.icon}</div>
                <div className="profile-info">
                  <div className="profile-name">
                    {p.name}
                  </div>
                  <div className="profile-stats">
                    {rank.name} · {p.progress.ep} EP · {p.progress.specimensCollected.length}/80 🦖
                  </div>
                </div>
                <div className="profile-actions" onClick={e => e.stopPropagation()}>
                  {confirmDelete === p.id ? (
                    <div className="profile-confirm-action">
                      <span>Delete?</span>
                      <button className="confirm-yes" onClick={() => handleDelete(p.id)}>Yes</button>
                      <button className="confirm-no"  onClick={() => setConfirmDelete(null)}>No</button>
                    </div>
                  ) : (
                    <button
                      className="profile-action-btn"
                      onClick={() => setConfirmDelete(p.id)}
                      aria-label={`Delete ${p.name}`}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create new profile */}
      {creating ? (
        <div className="profile-create">
          <h2>New time traveller</h2>
          <input
            className="profile-name-input"
            placeholder="Enter your name…"
            value={newName}
            maxLength={20}
            autoFocus
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <div className="profile-create-actions">
            <button className="start-btn" onClick={handleCreate} disabled={!newName.trim()}>
              Start exploring! 🚀
            </button>
            {profiles.length > 0 && (
              <button className="back-btn" onClick={() => setCreating(false)}>Cancel</button>
            )}
          </div>
        </div>
      ) : (
        <button className="start-btn new-player-btn" onClick={() => setCreating(true)}>
          + New traveller
        </button>
      )}
    </div>
  );
}
