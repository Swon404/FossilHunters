import { useState } from 'react';
import {
  getCustomDinos,
  saveCustomDino,
  deleteCustomDino,
  type CustomDino,
} from '../engine/storage';

// ── SVG Dino Composer ─────────────────────────────────────────────────────────
// viewBox 200×140. Dino faces right. Parts snap together.

function DinoSVG({ dino, size = 200 }: { dino: Partial<CustomDino>; size?: number }) {
  const c    = dino.colour ?? '#27ae60';
  const dark  = shadeDark(c);
  const light = shadeLight(c);
  const body  = dino.bodyType ?? 'bipedal';
  const head  = dino.headStyle ?? 'flat';
  const tail  = dino.tailStyle ?? 'long';
  const sz    = dino.size ?? 'medium';
  const diet  = dino.diet ?? 'herbivore';

  const scale = sz === 'tiny' ? 0.72 : sz === 'giant' ? 1.16 : 1;
  const tx    = sz === 'tiny' ? 28 : sz === 'giant' ? -16 : 0;
  const ty    = sz === 'tiny' ? 18 : sz === 'giant' ? -10 : 0;

  const longNeck = body === 'long-neck';

  return (
    <svg viewBox="0 0 200 145" width={size} height={size * 0.725} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
      <g transform={`translate(${tx},${ty}) scale(${scale})`}>

        {/* ── Tail ── */}
        {tail === 'short' && <path d="M50 84 Q22 80 24 100 Q32 110 50 98" fill={c} stroke={dark} strokeWidth="1.5"/>}
        {tail === 'long'  && <path d="M50 82 Q16 78 8 65 Q2 52 13 48 Q24 45 32 58 Q40 70 50 80" fill={c} stroke={dark} strokeWidth="1.5"/>}
        {tail === 'spiked' && (
          <>
            <path d="M50 82 Q16 78 8 65 Q2 52 13 48 Q24 45 32 58 Q40 70 50 80" fill={c} stroke={dark} strokeWidth="1.5"/>
            <polygon points="20,64 15,51 24,60" fill={dark}/>
            <polygon points="10,56 5,44 14,53" fill={dark}/>
          </>
        )}
        {tail === 'clubbed' && (
          <>
            <path d="M50 84 Q24 82 13 72 Q5 60 11 54" fill={c} stroke={dark} strokeWidth="1.5"/>
            <ellipse cx="8" cy="52" rx="9" ry="7" fill={dark}/>
          </>
        )}

        {/* ── Body ── */}
        {body === 'bipedal'   && <ellipse cx="96" cy="86" rx="43" ry="28" fill={c} stroke={dark} strokeWidth="1.5"/>}
        {body === 'long-neck' && <ellipse cx="96" cy="90" rx="50" ry="24" fill={c} stroke={dark} strokeWidth="1.5"/>}
        {body === 'horned'    && <ellipse cx="96" cy="88" rx="47" ry="27" fill={c} stroke={dark} strokeWidth="1.5"/>}
        {body === 'armoured'  && (
          <>
            <ellipse cx="96" cy="88" rx="47" ry="27" fill={c} stroke={dark} strokeWidth="1.5"/>
            <polygon points="74,64 70,52 78,62" fill={dark}/>
            <polygon points="90,59 86,46 94,57" fill={dark}/>
            <polygon points="106,61 102,48 110,59" fill={dark}/>
            <polygon points="120,66 116,54 124,64" fill={dark}/>
          </>
        )}

        {/* Belly highlight */}
        <ellipse cx="96" cy="96" rx="28" ry="14" fill={light} opacity="0.45"/>

        {/* ── Legs ── */}
        {body === 'bipedal' ? (
          <>
            <rect x="88"  y="109" width="14" height="24" rx="6" fill={c} stroke={dark} strokeWidth="1.2"/>
            <rect x="108" y="109" width="14" height="24" rx="6" fill={c} stroke={dark} strokeWidth="1.2"/>
            {/* tiny arms */}
            <path d="M124 82 Q138 88 140 98" stroke={dark} strokeWidth="4" strokeLinecap="round" fill="none"/>
            <path d="M140 98 L136 104 M140 98 L144 104" stroke={dark} strokeWidth="2.5" strokeLinecap="round"/>
          </>
        ) : (
          <>
            <rect x="68"  y="109" width="13" height="22" rx="5" fill={c} stroke={dark} strokeWidth="1.2"/>
            <rect x="85"  y="111" width="13" height="20" rx="5" fill={c} stroke={dark} strokeWidth="1.2"/>
            <rect x="105" y="111" width="13" height="20" rx="5" fill={c} stroke={dark} strokeWidth="1.2"/>
            <rect x="122" y="109" width="13" height="22" rx="5" fill={c} stroke={dark} strokeWidth="1.2"/>
          </>
        )}

        {/* ── Neck ── */}
        {longNeck
          ? <path d="M132 72 Q150 50 154 28 Q157 16 150 12 Q142 8 138 20 Q134 36 130 56 Q128 65 132 72" fill={c} stroke={dark} strokeWidth="1.5"/>
          : <path d="M130 74 Q140 62 142 50" fill={c} stroke={dark} strokeWidth="9" strokeLinecap="round"/>
        }

        {/* ── Head ── */}
        {longNeck
          ? <ellipse cx="146" cy="10" rx="14" ry="9" fill={c} stroke={dark} strokeWidth="1.5"/>
          : <ellipse cx="150" cy="52" rx="22" ry="16" fill={c} stroke={dark} strokeWidth="1.5"/>
        }

        {/* ── Head decoration ── */}
        {head === 'crest' && !longNeck && <path d="M140 40 Q150 27 158 36 Q164 44 154 46" fill={light} stroke={dark} strokeWidth="1"/>}
        {head === 'crest' &&  longNeck && <path d="M138 4 Q146 -6 152 3 Q156 10 150 12" fill={light} stroke={dark} strokeWidth="1"/>}
        {head === 'horns' && !longNeck && (<><polygon points="144,40 140,25 150,38" fill={dark}/><polygon points="156,37 152,22 162,35" fill={dark}/></>)}
        {head === 'horns' &&  longNeck && (<><polygon points="138,5 134,-2 143,3" fill={dark}/><polygon points="149,3 145,-4 154,1" fill={dark}/></>)}
        {head === 'beak'  && !longNeck && <polygon points="170,53 186,49 184,58" fill={dark}/>}
        {head === 'beak'  &&  longNeck && <polygon points="158,11 172,8 171,15" fill={dark}/>}

        {/* Horned body: frill + extra horn */}
        {body === 'horned' && (
          <>
            <polygon points="140,51 134,36 146,49" fill={dark}/>
            <polygon points="154,47 150,32 160,45" fill={dark}/>
            <ellipse cx="142" cy="58" rx="11" ry="6" fill={light} stroke={dark} strokeWidth="1" opacity="0.8"/>
          </>
        )}

        {/* ── Eye ── */}
        {longNeck
          ? (<><circle cx="152" cy="9"  r="3"   fill="#fff"/><circle cx="153" cy="9"  r="1.5" fill="#222"/></>)
          : (<><circle cx="158" cy="48" r="4.5" fill="#fff"/><circle cx="159" cy="48" r="2"   fill="#222"/></>)
        }

        {/* ── Diet marker ── */}
        {diet === 'carnivore' && !longNeck && <path d="M163 55 L165 62 L167 55 L169 62 L171 55" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>}
        {diet === 'herbivore' && !longNeck && <path d="M170 59 Q177 52 180 61 Q174 65 170 59" fill="#4caf50"/>}
        {diet === 'omnivore'  && !longNeck && <path d="M164 56 L166 62 L168 56" stroke="#fff" strokeWidth="1.3" fill="none" strokeLinecap="round"/>}
      </g>
    </svg>
  );
}

function shadeDark(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgb(${Math.max(0, (n >> 16) - 55)},${Math.max(0, ((n >> 8) & 0xff) - 55)},${Math.max(0, (n & 0xff) - 55)})`;
}
function shadeLight(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgb(${Math.min(255, (n >> 16) + 65)},${Math.min(255, ((n >> 8) & 0xff) + 65)},${Math.min(255, (n & 0xff) + 65)})`;
}

// ── Part option data ──────────────────────────────────────────────────────────

const BODY_OPTIONS: { key: CustomDino['bodyType']; icon: string; label: string; desc: string }[] = [
  { key: 'bipedal',   icon: '🦖', label: 'Two-Legged', desc: 'Fast hunter' },
  { key: 'long-neck', icon: '🦕', label: 'Long Neck',  desc: 'Gentle giant' },
  { key: 'horned',    icon: '🦏', label: 'Horned',     desc: 'Frill & horns' },
  { key: 'armoured',  icon: '🛡️', label: 'Armoured',  desc: 'Spike plates' },
];
const HEAD_OPTIONS: { key: CustomDino['headStyle']; icon: string; label: string; desc: string }[] = [
  { key: 'flat',  icon: '😐', label: 'Flat',    desc: 'Classic look' },
  { key: 'crest', icon: '🪶', label: 'Crested', desc: 'Coloured crown' },
  { key: 'horns', icon: '📍', label: 'Horned',  desc: 'Twin horns' },
  { key: 'beak',  icon: '🐦', label: 'Beaked',  desc: 'Bird beak' },
];
const TAIL_OPTIONS: { key: CustomDino['tailStyle']; icon: string; label: string; desc: string }[] = [
  { key: 'short',   icon: '〰️', label: 'Short',   desc: 'Light & nimble' },
  { key: 'long',    icon: '🐍', label: 'Long',    desc: 'Whip tail' },
  { key: 'spiked',  icon: '🗡️', label: 'Spiked', desc: 'Pointy spines' },
  { key: 'clubbed', icon: '🔨', label: 'Club',    desc: 'Smash weapon' },
];
const SIZE_OPTIONS: { key: CustomDino['size']; icon: string; label: string; desc: string }[] = [
  { key: 'tiny',   icon: '🐣', label: 'Tiny',   desc: 'Pocket-sized' },
  { key: 'medium', icon: '🦎', label: 'Medium', desc: 'Just right' },
  { key: 'giant',  icon: '🌍', label: 'Giant',  desc: 'Earth shaker' },
];
const DIET_OPTIONS: { key: CustomDino['diet']; icon: string; label: string; desc: string }[] = [
  { key: 'carnivore', icon: '🥩', label: 'Carnivore', desc: 'Meat only' },
  { key: 'herbivore', icon: '🌿', label: 'Herbivore', desc: 'Plants only' },
  { key: 'omnivore',  icon: '🍽️', label: 'Omnivore',  desc: 'Eats anything' },
];
const COLOURS = [
  { label: 'Forest',   value: '#27ae60' },
  { label: 'Crimson',  value: '#c0392b' },
  { label: 'Ocean',    value: '#2980b9' },
  { label: 'Amber',    value: '#f1c40f' },
  { label: 'Ember',    value: '#e67e22' },
  { label: 'Violet',   value: '#8e44ad' },
  { label: 'Midnight', value: '#1a1a2e' },
  { label: 'Snow',     value: '#d5dbdb' },
  { label: 'Rose',     value: '#e91e8c' },
  { label: 'Teal',     value: '#00897b' },
  { label: 'Sand',     value: '#c8a96e' },
  { label: 'Lava',     value: '#bf360c' },
];

// ── Reusable part picker ──────────────────────────────────────────────────────

function PartPicker<K extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: K; icon: string; label: string; desc: string }[];
  value: K;
  onChange: (k: K) => void;
}) {
  return (
    <div className="dino-field">
      <label>{label}</label>
      <div className="dino-part-grid">
        {options.map(o => (
          <button key={o.key} className={`dino-part-btn ${value === o.key ? 'selected' : ''}`} onClick={() => onChange(o.key)}>
            <span className="dino-part-icon">{o.icon}</span>
            <span className="dino-part-name">{o.label}</span>
            <span className="dino-part-desc">{o.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

interface Props { onBack: () => void; }

export default function DinoBuilderScreen({ onBack }: Props) {
  const [tab, setTab]             = useState<'create' | 'gallery'>('create');
  const [bodyType, setBodyType]   = useState<CustomDino['bodyType']>('bipedal');
  const [headStyle, setHeadStyle] = useState<CustomDino['headStyle']>('flat');
  const [tailStyle, setTailStyle] = useState<CustomDino['tailStyle']>('long');
  const [size, setSize]           = useState<CustomDino['size']>('medium');
  const [colour, setColour]       = useState('#27ae60');
  const [diet, setDiet]           = useState<CustomDino['diet']>('herbivore');
  const [name, setName]           = useState('');
  const [gallery, setGallery]     = useState<CustomDino[]>(getCustomDinos);
  const [saved, setSaved]         = useState(false);

  const draft: Partial<CustomDino> = { bodyType, headStyle, tailStyle, size, colour, diet };

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    saveCustomDino({ id: `${Date.now()}`, name: trimmed, bodyType, headStyle, tailStyle, size, colour, diet, createdAt: Date.now() });
    setGallery(getCustomDinos());
    setSaved(true);
    setName('');
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="dino-builder">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>🦕 Dino Builder</h1>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className={tab === 'create' ? 'start-btn' : 'back-btn'} style={{ flex: 1, padding: '10px' }} onClick={() => setTab('create')}>🎨 Create</button>
        <button className={tab === 'gallery' ? 'start-btn' : 'back-btn'} style={{ flex: 1, padding: '10px' }} onClick={() => setTab('gallery')}>🖼️ Gallery ({gallery.length})</button>
      </div>

      {tab === 'create' && (
        <>
          {/* Live SVG preview */}
          <div className="dino-builder-preview" style={{ borderTop: `4px solid ${colour}` }}>
            <DinoSVG dino={draft} size={300} />
            {name && <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 6 }}>{name}</div>}
          </div>

          <PartPicker label="Body Shape" options={BODY_OPTIONS} value={bodyType} onChange={setBodyType} />
          <PartPicker label="Head Style" options={HEAD_OPTIONS} value={headStyle} onChange={setHeadStyle} />
          <PartPicker label="Tail Style" options={TAIL_OPTIONS} value={tailStyle} onChange={setTailStyle} />
          <PartPicker label="Size"       options={SIZE_OPTIONS} value={size}      onChange={setSize} />
          <PartPicker label="Diet"       options={DIET_OPTIONS} value={diet}      onChange={setDiet} />

          {/* Colour swatches */}
          <div className="dino-field">
            <label>Colour</label>
            <div className="dino-colour-grid">
              {COLOURS.map(col => (
                <button key={col.value} className={`dino-colour-btn ${colour === col.value ? 'selected' : ''}`}
                  style={{ background: col.value }} onClick={() => setColour(col.value)} title={col.label} aria-label={col.label}>
                  {colour === col.value && <span className="dino-colour-tick">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="dino-field">
            <label>Give your dino a name!</label>
            <input className="dino-input" placeholder="e.g. Blaizeasaurus Rex" value={name} maxLength={30}
              onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} />
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
                <div className="dino-gallery-svg" style={{ filter: `drop-shadow(0 0 6px ${d.colour})` }}>
                  <DinoSVG dino={d} size={110} />
                </div>
                <div className="dino-gallery-info">
                  <div className="dino-gallery-name">{d.name}</div>
                  <div className="dino-gallery-desc">
                    {d.size ?? 'medium'} · {d.bodyType.replace('-', ' ')} · {DIET_OPTIONS.find(o => o.key === d.diet)?.label}
                  </div>
                </div>
                <button className="dino-delete-btn" onClick={() => { deleteCustomDino(d.id); setGallery(getCustomDinos()); }} aria-label={`Delete ${d.name}`}>🗑️</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

