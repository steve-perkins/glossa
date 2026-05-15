// Navbar component for Glossa
// Logo, activity links, language picker, streak, profile

const { useState, useEffect, useRef } = React;

function Navbar({ courses, activeLangId, onPickLang, activeNav, onPickNav }) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (langRef.current && !langRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const NAV_ITEMS = [
    { id: "lessons", label: "Lessons" },
    { id: "practice", label: "Practice" },
    { id: "stories", label: "Stories" },
    { id: "conversation", label: "Conversation" },
  ];

  const lang = courses[activeLangId];

  return (
    <header className="g-nav">
      <div className="g-nav-inner">
        {/* Logo */}
        <a className="g-logo" href="#" aria-label="Glossa home">
          <span className="g-logo-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="28" height="28">
              <circle cx="16" cy="16" r="15" fill="var(--accent)" />
              <text
                x="16"
                y="22"
                textAnchor="middle"
                fontFamily="'Instrument Serif', serif"
                fontSize="22"
                fontStyle="italic"
                fill="var(--cream)"
              >
                γ
              </text>
            </svg>
          </span>
          <span className="g-logo-word">Glossa</span>
        </a>

        {/* Activity links — desktop */}
        <nav className="g-nav-links" aria-label="Activities">
          {NAV_ITEMS.map((it) => (
            <button
              key={it.id}
              className={"g-nav-link" + (activeNav === it.id ? " is-active" : "")}
              onClick={() => onPickNav(it.id)}
            >
              {it.label}
            </button>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="g-nav-right">
          {/* Language picker */}
          <div className="g-langwrap" ref={langRef}>
            <button
              className={"g-langbtn" + (open ? " is-open" : "")}
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              <Flag code={lang.flag} />
              <span className="g-lang-text">
                <span className="g-lang-label">Learning</span>
                <span className="g-lang-name">{lang.name}</span>
              </span>
              <svg viewBox="0 0 12 12" width="10" height="10" className="g-chev" aria-hidden="true">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {open && (
              <ul className="g-langmenu" role="listbox">
                {Object.entries(courses).map(([id, c]) => (
                  <li key={id}>
                    <button
                      role="option"
                      aria-selected={id === activeLangId}
                      className={"g-langitem" + (id === activeLangId ? " is-active" : "")}
                      onClick={() => {
                        onPickLang(id);
                        setOpen(false);
                      }}
                    >
                      <Flag code={c.flag} />
                      <span className="g-langitem-text">
                        <span className="g-langitem-name">{c.name}</span>
                        <span className="g-langitem-native">{c.native}</span>
                      </span>
                      {id === activeLangId && (
                        <svg viewBox="0 0 16 16" width="14" height="14" className="g-check" aria-hidden="true">
                          <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
                <li className="g-langmenu-sep" aria-hidden="true" />
                <li>
                  <button className="g-langitem g-langitem-add">
                    <span className="g-langitem-plus" aria-hidden="true">+</span>
                    <span className="g-langitem-text">
                      <span className="g-langitem-name">Add a language</span>
                      <span className="g-langitem-native">Browse 12 courses</span>
                    </span>
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Profile */}
          <button className="g-avatar" aria-label="Profile">
            <span>EL</span>
          </button>

          {/* Mobile menu */}
          <button
            className={"g-burger" + (menuOpen ? " is-open" : "")}
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={"g-mobile-drawer" + (menuOpen ? " is-open" : "")}>
        {NAV_ITEMS.map((it) => (
          <button
            key={it.id}
            className={"g-mobile-link" + (activeNav === it.id ? " is-active" : "")}
            onClick={() => {
              onPickNav(it.id);
              setMenuOpen(false);
            }}
          >
            {it.label}
          </button>
        ))}
      </div>
    </header>
  );
}

// Tiny flag pill — country code in stylized form, no real flags (avoid copyright look-alikes,
// keep visual simple)
function Flag({ code }) {
  const colors = {
    GR: ["#0d5eaf", "#f6f4ef"], // Aegean blue + cream stripes
    ES: ["#c8102e", "#f4c01f"], // Crimson + gold
  };
  const [a, b] = colors[code] || ["#888", "#ddd"];
  return (
    <span className="g-flag" aria-hidden="true">
      <svg viewBox="0 0 24 18" width="22" height="16">
        <rect width="24" height="18" rx="3" fill={b} />
        <rect width="24" height="6" y="0" fill={a} />
        <rect width="24" height="3" y="9" fill={a} opacity=".85" />
      </svg>
      <span className="g-flag-code">{code}</span>
    </span>
  );
}

window.Navbar = Navbar;
window.Flag = Flag;
