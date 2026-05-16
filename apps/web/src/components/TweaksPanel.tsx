import { type Tweaks, type Theme, type Accent, type Density } from '../hooks/useTweaks';

interface TweaksPanelProps {
  tweaks: Tweaks;
  setTweaks: (patch: Partial<Tweaks>) => void;
  onClose: () => void;
}

const THEMES: { value: Theme; label: string }[] = [
  { value: 'cream', label: 'Cream' },
  { value: 'linen', label: 'Linen' },
  { value: 'sage', label: 'Sage' },
  { value: 'dusk', label: 'Dusk' },
  { value: 'slate', label: 'Slate' },
  { value: 'ink', label: 'Ink' },
];

const ACCENTS: { value: Accent; label: string; color: string }[] = [
  { value: 'terracotta', label: 'Terracotta', color: '#c5613a' },
  { value: 'aegean', label: 'Aegean', color: '#1e6fa8' },
  { value: 'olive', label: 'Olive', color: '#5d6f30' },
  { value: 'plum', label: 'Plum', color: '#8a4767' },
];

const DENSITIES: { value: Density; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'regular', label: 'Regular' },
  { value: 'comfy', label: 'Comfy' },
];

export function TweaksPanel({ tweaks, setTweaks, onClose }: TweaksPanelProps) {
  return (
    <div className="twk-panel" role="dialog" aria-label="Appearance settings">
      <div className="twk-hd">
        <b>Appearance</b>
        <button className="twk-x" aria-label="Close" onClick={onClose}>✕</button>
      </div>
      <div className="twk-body">
        <div className="twk-sect">Theme</div>
        <div className="twk-row">
          <div className="twk-seg">
            <div
              className="twk-seg-thumb"
              style={{
                left: `calc(2px + ${THEMES.findIndex(t => t.value === tweaks.theme)} * (100% - 4px) / ${THEMES.length})`,
                width: `calc((100% - 4px) / ${THEMES.length})`,
              }}
            />
            {THEMES.map(t => (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={tweaks.theme === t.value}
                onClick={() => setTweaks({ theme: t.value })}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="twk-sect">Accent</div>
        <div className="twk-row">
          <div className="twk-chips" role="radiogroup" aria-label="Accent color">
            {ACCENTS.map(a => (
              <button
                key={a.value}
                type="button"
                className="twk-chip"
                role="radio"
                aria-checked={tweaks.accent === a.value}
                data-on={tweaks.accent === a.value ? '1' : '0'}
                aria-label={a.label}
                title={a.label}
                style={{ background: a.color }}
                onClick={() => setTweaks({ accent: a.value })}
              >
                {tweaks.accent === a.value && (
                  <svg viewBox="0 0 14 14" aria-hidden="true" style={{ position: 'absolute', top: 6, left: 6, width: 13, height: 13 }}>
                    <path d="M3 7.2 5.8 10 11 4.2" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" stroke="#fff"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="twk-sect">Density</div>
        <div className="twk-row">
          <div className="twk-seg">
            <div
              className="twk-seg-thumb"
              style={{
                left: `calc(2px + ${DENSITIES.findIndex(d => d.value === tweaks.density)} * (100% - 4px) / ${DENSITIES.length})`,
                width: `calc((100% - 4px) / ${DENSITIES.length})`,
              }}
            />
            {DENSITIES.map(d => (
              <button
                key={d.value}
                type="button"
                role="radio"
                aria-checked={tweaks.density === d.value}
                onClick={() => setTweaks({ density: d.value })}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
