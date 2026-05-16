import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Flag } from './Flag';
import { TweaksPanel } from './TweaksPanel';
import { useTweaks } from '../hooks/useTweaks';
import { LANGUAGE_LIST } from '../data/courses';

const NAV_LINKS = [
  { to: '/', label: 'Learn' },
  { to: '/practice', label: 'Practice' },
  { to: '/stories', label: 'Stories' },
  { to: '/conversation', label: 'Conversation' },
];

interface NavbarProps {
  langId: string;
  onLangChange: (id: string) => void;
}

export function Navbar({ langId, onLangChange }: NavbarProps) {
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const { tweaks, setTweaks } = useTweaks();

  const currentLang = LANGUAGE_LIST.find(l => l.id === langId) ?? LANGUAGE_LIST[0];

  function pickLang(id: string) {
    onLangChange(id);
    setLangOpen(false);
  }

  return (
    <>
      <nav className="g-nav">
        <div className="g-nav-inner">
          <NavLink to="/" className="g-logo" onClick={() => setMenuOpen(false)}>
            <span className="g-logo-mark">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" opacity=".3"/>
                <text x="14" y="19" textAnchor="middle" fontFamily="Instrument Serif,serif" fontStyle="italic" fontSize="16" fill="currentColor">γ</text>
              </svg>
            </span>
            <span className="g-logo-word">Glossa</span>
          </NavLink>

          <div className="g-nav-links">
            {NAV_LINKS.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => `g-nav-link${isActive ? ' is-active' : ''}`}
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="g-nav-right">
            <div className="g-langwrap">
              <button
                className={`g-langbtn${langOpen ? ' is-open' : ''}`}
                onClick={() => setLangOpen(o => !o)}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
              >
                <span className="g-flag">
                  <Flag code={currentLang.flag} size={20} />
                </span>
                <span className="g-lang-text">
                  <span className="g-lang-label">Learning</span>
                  <span className="g-lang-name">{currentLang.name}</span>
                </span>
                <svg className="g-chev" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {langOpen && (
                <ul className="g-langmenu" role="listbox" aria-label="Select language">
                  {LANGUAGE_LIST.map(lang => (
                    <li key={lang.id} role="option" aria-selected={lang.id === langId}>
                      <button
                        className={`g-langitem${lang.id === langId ? ' is-active' : ''}`}
                        onClick={() => pickLang(lang.id)}
                      >
                        <span className="g-flag">
                          <Flag code={lang.flag} size={20} />
                        </span>
                        <span className="g-langitem-text">
                          <span className="g-langitem-name">{lang.name}</span>
                          <span className="g-langitem-native">{lang.native}</span>
                        </span>
                        {lang.id === langId && (
                          <svg className="g-check" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path d="M3 7l2.8 3L11 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    </li>
                  ))}
                  <li className="g-langmenu-sep" role="separator" />
                  <li>
                    <button className="g-langitem g-langitem-add" disabled>
                      <span className="g-langitem-plus">+</span>
                      <span className="g-langitem-text">
                        <span className="g-langitem-name">Add a language</span>
                        <span className="g-langitem-native">Coming soon</span>
                      </span>
                    </button>
                  </li>
                </ul>
              )}
            </div>

            <button
              className="g-settings-btn"
              aria-label="Appearance settings"
              onClick={() => setTweaksOpen(o => !o)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            <button
              className={`g-burger${menuOpen ? ' is-open' : ''}`}
              aria-label="Menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(o => !o)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="g-mobile-drawer is-open">
            {NAV_LINKS.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => `g-mobile-link${isActive ? ' is-active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {tweaksOpen && (
        <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} onClose={() => setTweaksOpen(false)} />
      )}

      {(langOpen) && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 55 }}
          onClick={() => setLangOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
