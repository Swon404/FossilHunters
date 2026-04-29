import { useState } from 'react';
import {
  getCustomDinos,
  saveCustomDino,
  deleteCustomDino,
  type CustomDino,
} from '../engine/storage';

const BODY_EMOJIS: Record<CustomDino['bodyType'], string> = {
  'long-neck': '🦕',
  'horned':    '🦏',
  'armoured':  '🛡️',
  'bipedal':   '🦖',
};

const HEAD_LABELS: Record<CustomDino['headStyle'], string> = {
  flat:  'Flat',
  crest: 'Crested',
  horns: 'Horned',
  beak:  'Beaked',
};

const DIET_LABELS: Record<CustomDino['diet'], string> = {
  carnivore: '🥩 Carnivore',
  herbivore: '🌿 Herbivore',
  omnivore:  '🍽️ Omnivore',
};

const COLOURS = [
  { label: '🟢 Green',  value: '#27ae60' },
  { label: '🔴 Red',    value: '#c0392b' },
  { label: '🔵 Blue',   value: '#2980b9' },
  { label: '🟡 Yellow', value: '#f1c40f' },
  { label: '🟠 Orange', value: '#e67e22' },
  { label: '🟣 Purple', value: '#8e44ad' },
  { label: '⚫ Black',  value: '#2c2c2c' },
  { label: '⚪ White',  value: '#ecf0f1' },
];

function buildPreview(dino: Partial<CustomDino>): string {
  const base = BODY_EMOJIS[dino.bodyType ?? 'bipedal'];
  const extras =
    dino.headStyle === 'crest'  ? '🪶' :
    dino.headStyle === 'horns'  ? '📍' :
    dino.headStyle === 'beak'   ? '🐦' : '';
  return base + extras;
}

interface Props {
  onBack: () => void;
}

export default function DinoBuilderScreen({ onBack }: Props) {
  const [tab, setTab]             = useState<'create' | 'gallery'>('create');
  const [bodyType, setBodyType]   = useState<CustomDino['bodyType']>('bipedal');
  const [headStyle, setHeadStyle] = useState<CustomDino['headStyle']>('flat');
  const [colour, setColour]       = useState('#27ae60');
  const [diet, setDiet]           = useState<CustomDino['diet']>('herbivore');
  const [name, setName]           = useState('');
  const [gallery, setGallery]     = useState<CustomDino[]>(getCustomDinos);
  const [saved, setSaved]         = useState(false);

  const draft: Partial<CustomDino> = { bodyType, headStyle, colour, diet };
  const preview = buildPreview(draft);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const dino: CustomDino = {
      id: `${Date.now()}`,
      name: trimmed,
      bodyType,
      headStyle,
      colour,
      diet,
      createdAt: Date.now(),
    };
    saveCustomDino(dino);
    setGallery(getCustomDinos());
    setSaved(true);
    setName('');
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDelete(id: string) {
    deleteCustomDino(id);
    setGallery(getCustomDinos());
  }

  return (
    <div className="dino-builder">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>🦕 Dino Builder</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className={tab === 'create' ? 'start-btn' : 'back-btn'}
          style={{ flex: 1, padding: '10px' }}
          onClick={() => setTab('create')}
        >
          🎨 Create
        </button>
        <button
          className={tab === 'gallery' ? 'start-btn' : 'back-btn'}
          style={{ flex: 1, padding: '10px' }}
          onClick={() => setTab('gallery')}
        >
          🖼️ Gallery ({gallery.length})
        </button>
      </div>

      {tab === 'create' && (
        <>
          {/* Live preview */}
          <div className="dino-builder-preview" style={{ borderTop: `4px solid ${colour}` }}>
            <div style={{ fontSize: '6rem' }}>{preview}</div>
            {name && <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 8 }}>{name}</div>}
          </div>

          {/* Body type */}
          <div className="dino-field">
            <label>Body Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {(Object.keys(BODY_EMOJIS) as CustomDino['bodyType'][]).map(bt => (
                <button
                  key={bt}
                  onClick={() => setBodyType(bt)}
                  style={{
                    padding: '10px 4px',
                    background: bodyType === bt ? 'var(--accent)' : 'var(--bg-card)',
                    border: '2px solid ' + (bodyType === bt ? 'var(--accent-glow)' : 'transparent'),
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.4rem' }}>{BODY_EMOJIS[bt]}</div>
                  <div>{bt.replace('-', ' ')}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Head style */}
          <div className="dino-field">
            <label>Head Style</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {(Object.keys(HEAD_LABELS) as CustomDino['headStyle'][]).map(hs => (
                <button
                  key={hs}
                  onClick={() => setHeadStyle(hs)}
                  style={{
                    padding: '10px 4px',
                    background: headStyle === hs ? 'var(--accent)' : 'var(--bg-card)',
                    border: '2px solid ' + (headStyle === hs ? 'var(--accent-glow)' : 'transparent'),
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  {HEAD_LABELS[hs]}
                </button>
              ))}
            </div>
          </div>

          {/* Colour */}
          <div className="dino-field">
            <label>Colour</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {COLOURS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setColour(c.value)}
                  style={{
                    padding: '10px 4px',
                    background: c.value,
                    border: '3px solid ' + (colour === c.value ? '#fff' : 'transparent'),
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                  }}
                >
                  {c.label.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          {/* Diet */}
          <div className="dino-field">
            <label>Diet</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(Object.keys(DIET_LABELS) as CustomDino['diet'][]).map(d => (
                <button
                  key={d}
                  onClick={() => setDiet(d)}
                  style={{
                    flex: 1,
                    padding: '10px 4px',
                    background: diet === d ? 'var(--accent)' : 'var(--bg-card)',
                    border: '2px solid ' + (diet === d ? 'var(--accent-glow)' : 'transparent'),
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  {DIET_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="dino-field">
            <label>Give your dino a name!</label>
            <input
              className="dino-input"
              placeholder="e.g. Blaizeasaurus Rex"
              value={name}
              maxLength={30}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
          </div>

          <button className="start-btn" onClick={handleSave} disabled={!name.trim()}>
            {saved ? '✅ Saved to Gallery!' : 'Save to Gallery 🦕'}
          </button>
        </>
      )}

      {tab === 'gallery' && (
        <div className="dino-gallery">
          {gallery.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 32 }}>
              <div style={{ fontSize: '3rem' }}>🦕</div>
              <p>No dinos yet! Go create your first one.</p>
            </div>
          ) : (
            gallery.map(d => (
              <div key={d.id} className="dino-gallery-item">
                <div className="dino-gallery-emoji" style={{ filter: `drop-shadow(0 0 4px ${d.colour})` }}>
                  {buildPreview(d)}
                </div>
                <div className="dino-gallery-info">
                  <div className="dino-gallery-name">{d.name}</div>
                  <div className="dino-gallery-desc">
                    {d.bodyType.replace('-', ' ')} · {HEAD_LABELS[d.headStyle]} head · {DIET_LABELS[d.diet]}
                  </div>
                </div>
                <button
                  className="dino-delete-btn"
                  onClick={() => handleDelete(d.id)}
                  aria-label={`Delete ${d.name}`}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
