import { useEffect, useState, useCallback } from 'react';

export type Theme = 'cream' | 'linen' | 'sage' | 'dusk' | 'slate' | 'ink';
export type Accent = 'terracotta' | 'aegean' | 'olive' | 'plum';
export type Density = 'compact' | 'regular' | 'comfy';

export interface Tweaks {
  theme: Theme;
  accent: Accent;
  density: Density;
}

const DEFAULTS: Tweaks = {
  theme: 'cream',
  accent: 'terracotta',
  density: 'regular',
};

const KEY = 'glossa_tweaks';

function load(): Tweaks {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

export function applyTweaksToDOM(t: Tweaks) {
  const root = document.documentElement;
  root.setAttribute('data-theme', t.theme);
  root.setAttribute('data-accent', t.accent);
  root.setAttribute('data-density', t.density);
}

export function useTweaks() {
  const [tweaks, setTweaksState] = useState<Tweaks>(load);

  useEffect(() => {
    applyTweaksToDOM(tweaks);
  }, [tweaks]);

  const setTweaks = useCallback((patch: Partial<Tweaks>) => {
    setTweaksState(prev => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { tweaks, setTweaks };
}
