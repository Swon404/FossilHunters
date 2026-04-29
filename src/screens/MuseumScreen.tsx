import { useState } from 'react';
import { specimens, type Specimen } from '../data/specimens';
import { ERAS, getEra } from '../data/eras';
import { type PlayerProfile } from '../engine/storage';
import { speak, isTTSSupported } from '../engine/tts';

interface SpecimenInfoProps {
  specimen: Specimen;
  collected: boolean;
  onClose: () => void;
}

function SpecimenInfo({ specimen, collected, onClose }: SpecimenInfoProps) {
  const era = getEra(specimen.eraId);
  return (
    <div className="specimen-info-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={specimen.name}>
      <div className="specimen-info-card" onClick={e => e.stopPropagation()}>
        <div className="specimen-info-header">
          <div className="specimen-info-emoji">{specimen.emoji}</div>
          <div className="specimen-info-title">
            <div className="specimen-info-name">{specimen.name}</div>
            {specimen.latinName && (
              <div className="specimen-info-latin">{specimen.latinName}</div>
            )}
            <div
              className="specimen-info-era-badge"
              style={{ background: era.color + '33', color: era.color, border: `1px solid ${era.color}` }}
            >
              {era.emoji} {era.name}
            </div>
            {collected && (
              <div style={{ fontSize: '0.75rem', color: 'var(--correct)', marginTop: 4 }}>
                ✅ In your museum
              </div>
            )}
          </div>
          {isTTSSupported() && (
            <button
              className="tts-btn"
              onClick={() => speak(`${specimen.name}. ${specimen.funFact}`)}
              aria-label="Read aloud"
            >
              🔊
            </button>
          )}
        </div>

        <div className="specimen-info-facts">
          <div className="specimen-info-fact">
            <strong>🌟 Fun fact:</strong> {specimen.funFact}
          </div>
          {specimen.additionalFacts.map((fact, i) => (
            <div key={i} className="specimen-info-fact">{fact}</div>
          ))}
          {specimen.funny && (
            <div className="specimen-info-funny">😂 {specimen.funny}</div>
          )}
          {specimen.discoveredBy && (
            <div className="specimen-info-fact">
              🔍 First discovered by <strong>{specimen.discoveredBy}</strong>
              {specimen.discoveryCountry ? ` in ${specimen.discoveryCountry}` : ''}.
            </div>
          )}
        </div>

        <div className="specimen-info-close">
          <button className="start-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Timeline era row ─────────────────────────────────────────────
interface EraRowProps {
  eraId: string;
  eraSpecimens: Specimen[];
  collectedIds: string[];
  onSpecimenClick: (s: Specimen) => void;
}

function EraRow({ eraId, eraSpecimens, collectedIds, onSpecimenClick }: EraRowProps) {
  const [open, setOpen] = useState(true);
  const era = getEra(eraId as ReturnType<typeof getEra>['id']);
  const collectedCount = eraSpecimens.filter(s => collectedIds.includes(s.id)).length;

  return (
    <div className="timeline-era" style={{ borderColor: era.color + '55' }}>
      <button
        className="timeline-era-header"
        style={{ background: era.color + '22', color: era.color }}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span>{era.emoji}</span>
        <span style={{ flex: 1 }}>{era.name}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {collectedCount}/{eraSpecimens.length}
        </span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="timeline-era-grid">
          {eraSpecimens.map(s => {
            const collected = collectedIds.includes(s.id);
            return (
              <button
                key={s.id}
                className={`specimen-cell ${collected ? 'collected' : 'locked'}`}
                onClick={() => onSpecimenClick(s)}
                title={collected ? s.name : '???'}
                aria-label={collected ? s.name : 'Locked specimen'}
              >
                <div className="specimen-cell-emoji">{s.emoji}</div>
                <div className="specimen-cell-name">{collected ? s.name : '???'}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Museum Screen ────────────────────────────────────────────
interface Props {
  profile: PlayerProfile | null;
  onBack: () => void;
}

export default function MuseumScreen({ profile, onBack }: Props) {
  const [selectedSpecimen, setSelectedSpecimen] = useState<Specimen | null>(null);
  const collectedIds = profile?.progress.specimensCollected ?? [];
  const totalCollected = collectedIds.length;

  return (
    <div className="museum-screen">
      <div className="museum-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div>
          <div className="museum-title">🏛️ Your Museum</div>
          <div className="museum-count">
            {totalCollected}/80 specimens collected
          </div>
        </div>
      </div>

      {totalCollected === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px 16px' }}>
          <div style={{ fontSize: '3rem' }}>🦴</div>
          <p>Your museum is empty! Complete quizzes to collect specimens. 🦕</p>
        </div>
      )}

      {ERAS.map(era => {
        const eraSpecimens = specimens.filter(s => s.eraId === era.id);
        return (
          <EraRow
            key={era.id}
            eraId={era.id}
            eraSpecimens={eraSpecimens}
            collectedIds={collectedIds}
            onSpecimenClick={setSelectedSpecimen}
          />
        );
      })}

      {selectedSpecimen && (
        <SpecimenInfo
          specimen={selectedSpecimen}
          collected={collectedIds.includes(selectedSpecimen.id)}
          onClose={() => setSelectedSpecimen(null)}
        />
      )}
    </div>
  );
}
