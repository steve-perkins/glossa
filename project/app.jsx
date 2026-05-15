// Main Glossa app

const { useState: useStateA, useEffect: useEffectA, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "cream",
  "accent": "terracotta",
  "lessonLayout": "list",
  "density": "regular",
  "showCulture": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [langId, setLangId] = useStateA("greek");
  const [activeNav, setActiveNav] = useStateA("lessons");
  const lang = window.GLOSSA_COURSES[langId];
  const [level, setLevel] = useStateA(() => {
    // Default to first level that has any progress, else first
    return lang.levels[0];
  });

  // When language changes, reset level if needed
  useEffectA(() => {
    if (!lang.levels.includes(level)) setLevel(lang.levels[0]);
  }, [langId]);

  const units = lang.units[level] || [];

  // Apply theme + accent to root via data attributes
  useEffectA(() => {
    document.documentElement.setAttribute("data-theme", t.theme);
    document.documentElement.setAttribute("data-accent", t.accent);
  }, [t.theme, t.accent]);

  // Aggregate level progress
  const levelProgress = useMemo(() => {
    const allLessons = units.flatMap((u) => u.lessons);
    const done = allLessons.filter((l) => l.status === "done").length;
    return { done, total: allLessons.length, pct: allLessons.length ? Math.round((done / allLessons.length) * 100) : 0 };
  }, [units]);

  const activeUnit = units.find((u) =>
    u.lessons.some((l) => l.status === "current")
  );
  const activeLesson = activeUnit?.lessons.find((l) => l.status === "current");

  return (
    <div className="g-app">
      <Navbar
        courses={window.GLOSSA_COURSES}
        activeLangId={langId}
        onPickLang={setLangId}
        activeNav={activeNav}
        onPickNav={(id) => {
          if (id === "practice") { window.location.href = "Practice.html"; return; }
          if (id === "stories") { window.location.href = "Stories.html"; return; }
          if (id === "conversation") { window.location.href = "Conversation.html"; return; }
          setActiveNav(id);
        }}
      />

      <main className="g-main">
        {/* Continue card — when there's an active lesson */}
        {activeLesson && (
          <section className="g-continue" aria-label="Continue learning">
            <div className="g-continue-inner">
              <div className="g-continue-text">
                <span className="g-continue-eyebrow">Pick up where you left off</span>
                <h2 className="g-continue-title">{activeLesson.title}</h2>
                <span className="g-continue-meta">
                  <span>{lang.name} · {level}</span>
                  <span className="g-dot" />
                  <span>{activeUnit.title}</span>
                  <span className="g-dot" />
                  <span>{activeLesson.desc}</span>
                </span>
              </div>
              <button
                className="g-continue-cta"
                onClick={() => window.location.href = "Lesson.html"}
              >
                Continue lesson
                <svg viewBox="0 0 16 16" width="14" height="14"><path d="M5 3l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <div className="g-continue-art" aria-hidden="true">
              <Meander />
            </div>
          </section>
        )}

        {/* Course / level selector */}
        <section className="g-level-section">
          <div className="g-level-head">
            <div>
              <h1 className="g-page-title">
                {lang.name}
                <span className="g-page-title-native">{lang.native}</span>
              </h1>
              <p className="g-page-sub">
                Choose a level to continue. Levels follow the CEFR framework, from beginner (A1) to advanced (C2).
              </p>
            </div>
            <div className="g-level-stats">
              <div className="g-stat">
                <span className="g-stat-num">{levelProgress.done}</span>
                <span className="g-stat-lbl">lessons<br/>completed</span>
              </div>
              <div className="g-stat">
                <span className="g-stat-num">{levelProgress.pct}%</span>
                <span className="g-stat-lbl">of {level}<br/>finished</span>
              </div>
            </div>
          </div>

          <div className="g-levels" role="tablist" aria-label="Levels">
            {["A1","A2","B1","B2","C1","C2"].map((lv) => {
              const exists = lang.levels.includes(lv);
              const active = lv === level;
              const lvUnits = exists ? lang.units[lv] || [] : [];
              const lvLessons = lvUnits.flatMap((u) => u.lessons);
              const lvDone = lvLessons.filter((l) => l.status === "done").length;
              const lvPct = lvLessons.length ? Math.round((lvDone / lvLessons.length) * 100) : 0;
              return (
                <button
                  key={lv}
                  role="tab"
                  aria-selected={active}
                  disabled={!exists}
                  className={"g-level" + (active ? " is-active" : "") + (exists ? "" : " is-empty")}
                  onClick={() => exists && setLevel(lv)}
                >
                  <span className="g-level-code">{lv}</span>
                  <span className="g-level-name">{LEVEL_NAMES[lv]}</span>
                  {exists ? (
                    <span className="g-level-bar" aria-hidden="true">
                      <span className="g-level-bar-fill" style={{ width: lvPct + "%" }} />
                    </span>
                  ) : (
                    <span className="g-level-soon">Coming soon</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Units list */}
        <section className="g-units-section">
          <div className="g-units-head">
            <div>
              <h2 className="g-section-title">Units in {level}</h2>
              <p className="g-section-sub">{units.length} units · {units.flatMap(u=>u.lessons).length} lessons total</p>
            </div>
            <div className="g-layout-toggle" role="group" aria-label="Lesson layout">
              {[
                { id: "list", label: "List", icon: <IconList /> },
                { id: "grid", label: "Grid", icon: <IconGrid /> },
                { id: "path", label: "Path", icon: <IconPath /> },
              ].map((o) => (
                <button
                  key={o.id}
                  className={"g-layout-btn" + (t.lessonLayout === o.id ? " is-active" : "")}
                  onClick={() => setTweak("lessonLayout", o.id)}
                  aria-pressed={t.lessonLayout === o.id}
                  title={o.label + " view"}
                >
                  {o.icon}
                  <span>{o.label}</span>
                </button>
              ))}
            </div>
          </div>

          <UnitsList units={units} layout={t.lessonLayout} density={t.density} />
        </section>

        {/* Cultural footer card */}
        {t.showCulture && (
          <section className="g-culture">
            <div className="g-culture-text">
              <span className="g-culture-eyebrow">Culture note</span>
              <h3 className="g-culture-title">
                {langId === "greek"
                  ? "Why is it called Greek to me?"
                  : "Why does Spanish have two verbs for ‘to be’?"}
              </h3>
              <p>
                {langId === "greek"
                  ? "The phrase \u201Cit\u2019s all Greek to me\u201D was popularised by Shakespeare \u2014 but the underlying joke is older. Medieval scribes wrote \u201CGraecum est, non legitur\u201D when they hit Greek words they couldn\u2019t read."
                  : "Ser describes essence \u2014 things that don\u2019t change. Estar describes state \u2014 things that do. Soy aburrido means I\u2019m a boring person; estoy aburrido means I\u2019m bored right now."}
              </p>
            </div>
            <div className="g-culture-art" aria-hidden="true">
              <span className="g-culture-tile">
                {langId === "greek" ? "Γ" : "Ñ"}
              </span>
            </div>
          </section>
        )}
      </main>

      <footer className="g-foot">
        <span>Glossa · learn languages slowly, on purpose</span>
        <span className="g-foot-links">
          <a href="#">About</a>
        </span>
      </footer>

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakSelect
          label="Background"
          value={t.theme}
          options={["cream", "linen", "sage", "dusk", "slate", "ink"]}
          onChange={(v) => setTweak("theme", v)}
        />
        <TweakSelect
          label="Accent"
          value={t.accent}
          options={["terracotta", "aegean", "olive", "plum"]}
          onChange={(v) => setTweak("accent", v)}
        />
        <TweakSection label="Layout" />
        <TweakRadio
          label="Lesson view"
          value={t.lessonLayout}
          options={["list", "grid", "path"]}
          onChange={(v) => setTweak("lessonLayout", v)}
        />
        <TweakRadio
          label="Density"
          value={t.density}
          options={["compact", "regular", "comfy"]}
          onChange={(v) => setTweak("density", v)}
        />
        <TweakToggle
          label="Show culture note"
          value={t.showCulture}
          onChange={(v) => setTweak("showCulture", v)}
        />
      </TweaksPanel>
    </div>
  );
}

const LEVEL_NAMES = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper-int.",
  C1: "Advanced",
  C2: "Mastery",
};

// Decorative meander pattern (Greek key) — geometric, OK to draw
function Meander() {
  return (
    <svg viewBox="0 0 240 120" preserveAspectRatio="none" className="g-meander">
      <defs>
        <pattern id="meander" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M0 30 H10 V10 H30 V30 H20 V20 H40"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="square"
          />
        </pattern>
      </defs>
      <rect width="240" height="120" fill="url(#meander)" />
    </svg>
  );
}

function IconList() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <circle cx="3" cy="4" r="1" fill="currentColor"/>
      <circle cx="3" cy="8" r="1" fill="currentColor"/>
      <circle cx="3" cy="12" r="1" fill="currentColor"/>
      <rect x="6" y="3.4" width="8" height="1.2" rx=".6" fill="currentColor"/>
      <rect x="6" y="7.4" width="8" height="1.2" rx=".6" fill="currentColor"/>
      <rect x="6" y="11.4" width="8" height="1.2" rx=".6" fill="currentColor"/>
    </svg>
  );
}
function IconGrid() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor"/>
      <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor"/>
      <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor"/>
      <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor"/>
    </svg>
  );
}
function IconPath() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M3 3 Q9 3 9 8 T15 13" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <circle cx="3" cy="3" r="1.6" fill="currentColor"/>
      <circle cx="9" cy="8" r="1.6" fill="currentColor"/>
      <circle cx="15" cy="13" r="1.6" fill="currentColor"/>
    </svg>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
