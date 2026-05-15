// Practice app — setup screen, session deck, results

const { useState: useStateP, useEffect: useEffectP, useMemo: useMemoP, useRef: useRefP } = React;

// ─── Helpers ───────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Loose equality: lowercase, trim, strip diacritics
function normalize(s) {
  return (s || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,;!?·]/g, "");
}

function speak(text, lang) {
  if (!("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.85;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch (_) {}
}

// today-keyed stat store for correct/incorrect tally
function todayKey() {
  const d = new Date();
  return `glossa-practice-stats-${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}
function loadDailyStats() {
  try {
    const raw = localStorage.getItem(todayKey());
    return raw ? JSON.parse(raw) : { correct: 0, wrong: 0 };
  } catch (_) { return { correct: 0, wrong: 0 }; }
}
function saveDailyStats(s) {
  try { localStorage.setItem(todayKey(), JSON.stringify(s)); } catch (_) {}
}

// ─── Root app ──────────────────────────────────────────────────────────
function PracticeApp() {
  const [langId, setLangId] = useStateP("greek");
  const lang = window.GLOSSA_PRACTICE_POOL[langId];
  const courseMeta = window.GLOSSA_COURSES[langId];

  // Phase: 'setup' → 'session' → 'done'
  const [phase, setPhase] = useStateP("setup");
  const [config, setConfig] = useStateP({ count: 10, mode: "mc" });
  const [stats, setStats] = useStateP(loadDailyStats);

  // active session deck
  const [deck, setDeck] = useStateP([]);
  const [idx, setIdx] = useStateP(0);
  const [sessionStats, setSessionStats] = useStateP({ correct: 0, wrong: 0 });

  function navigate(navId) {
    if (navId === "lessons") window.location.href = "Glossa.html";
    else if (navId === "stories") window.location.href = "Stories.html";
    else if (navId === "conversation") window.location.href = "Conversation.html";
    // practice — already here
  }

  function startRound() {
    const pool = lang.items;
    const n = config.count === "unlimited" ? pool.length : Math.min(config.count, pool.length);
    const picked = shuffle(pool).slice(0, n);
    setDeck(picked);
    setIdx(0);
    setSessionStats({ correct: 0, wrong: 0 });
    setPhase("session");
  }

  function recordResult(ok) {
    setSessionStats((s) => ({
      correct: s.correct + (ok ? 1 : 0),
      wrong: s.wrong + (ok ? 0 : 1),
    }));
    setStats((s) => {
      const next = {
        correct: s.correct + (ok ? 1 : 0),
        wrong: s.wrong + (ok ? 0 : 1),
      };
      saveDailyStats(next);
      return next;
    });
  }

  function advance() {
    if (idx >= deck.length - 1) {
      setPhase("done");
    } else {
      setIdx((i) => i + 1);
    }
  }

  function quitSession() {
    if (phase === "session" && !confirm("Leave this round? Your tally so far is saved.")) return;
    setPhase("setup");
  }

  return (
    <div className="g-app">
      <Navbar
        courses={window.GLOSSA_COURSES}
        activeLangId={langId}
        onPickLang={setLangId}
        activeNav="practice"
        onPickNav={navigate}
      />

      {phase === "setup" && (
        <PracticeSetup
          lang={lang}
          langId={langId}
          courseMeta={courseMeta}
          stats={stats}
          config={config}
          setConfig={setConfig}
          onStart={startRound}
        />
      )}

      {phase === "session" && (
        <PracticeSession
          item={deck[idx]}
          idx={idx}
          total={deck.length}
          mode={config.mode}
          voice={lang.voice}
          pool={lang.items}
          sessionStats={sessionStats}
          onResult={recordResult}
          onNext={advance}
          onQuit={quitSession}
        />
      )}

      {phase === "done" && (
        <PracticeResults
          sessionStats={sessionStats}
          total={deck.length}
          onAgain={() => setPhase("setup")}
          onHome={() => setPhase("setup")}
        />
      )}

      <footer className="g-foot">
        <span>Glossa · learn languages slowly, on purpose</span>
        <span className="g-foot-links">
          <a href="#">About</a>
        </span>
      </footer>
    </div>
  );
}

// ─── Setup screen ──────────────────────────────────────────────────────
function PracticeSetup({ lang, langId, courseMeta, stats, config, setConfig, onStart }) {
  const total = lang.items.length;
  const COUNTS = [5, 10, 20, 50, "unlimited"];

  return (
    <main className="g-main pr-main">
      <section className="pr-hero">
        <div className="pr-hero-text">
          <span className="pr-eyebrow">Practice</span>
          <h1 className="g-page-title">
            Drill what you know
            <span className="g-page-title-native">{courseMeta.native}</span>
          </h1>
          <p className="g-page-sub">
            Quick rounds of vocabulary in context. Each prompt is a sentence with one word
            missing — pick from four options, or type it from memory.
          </p>
        </div>

        <div className="pr-stats">
          <div className="pr-stat">
            <span className="pr-stat-num">{total}</span>
            <span className="pr-stat-lbl">words<br/>unlocked</span>
          </div>
          <div className="pr-stat pr-stat--good">
            <span className="pr-stat-num">{stats.correct}</span>
            <span className="pr-stat-lbl">correct<br/>today</span>
          </div>
          <div className="pr-stat pr-stat--bad">
            <span className="pr-stat-num">{stats.wrong}</span>
            <span className="pr-stat-lbl">missed<br/>today</span>
          </div>
        </div>
      </section>

      <section className="pr-config">
        <div className="pr-config-row">
          <div className="pr-config-label">
            <span className="pr-config-eyebrow">01 · Round size</span>
            <h3 className="pr-config-title">How many words this round?</h3>
            <p className="pr-config-sub">Short rounds beat long ones. Five-minute drills, repeated, win.</p>
          </div>
          <div className="pr-select-wrap">
            <select
              className="pr-select"
              value={String(config.count)}
              onChange={(e) => {
                const v = e.target.value;
                setConfig({ ...config, count: v === "unlimited" ? "unlimited" : parseInt(v, 10) });
              }}
            >
              {COUNTS.map((c) => (
                <option key={c} value={String(c)}>
                  {c === "unlimited" ? `Unlimited (${total})` : `${c} words`}
                </option>
              ))}
            </select>
            <svg viewBox="0 0 12 12" width="12" height="12" className="pr-select-chev" aria-hidden="true">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="pr-config-row">
          <div className="pr-config-label">
            <span className="pr-config-eyebrow">02 · Exercise style</span>
            <h3 className="pr-config-title">Recognise, or recall?</h3>
            <p className="pr-config-sub">Multiple choice is gentler. Fill-in-the-blank is the real test.</p>
          </div>
          <div className="pr-modes">
            <button
              className={"pr-mode" + (config.mode === "mc" ? " is-active" : "")}
              onClick={() => setConfig({ ...config, mode: "mc" })}
            >
              <span className="pr-mode-icon" aria-hidden="true">
                <svg viewBox="0 0 32 32" width="28" height="28">
                  <rect x="3" y="6" width="11" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/>
                  <rect x="18" y="6" width="11" height="8" rx="2" fill="currentColor" opacity=".2"/>
                  <rect x="18" y="6" width="11" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/>
                  <rect x="3" y="18" width="11" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/>
                  <rect x="18" y="18" width="11" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M21 9.7l1.4 1.4 3-3" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="pr-mode-text">
                <span className="pr-mode-title">Multiple choice</span>
                <span className="pr-mode-sub">Pick the right word from four options.</span>
              </span>
              <span className="pr-mode-check" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </button>
            <button
              className={"pr-mode" + (config.mode === "fill" ? " is-active" : "")}
              onClick={() => setConfig({ ...config, mode: "fill" })}
            >
              <span className="pr-mode-icon" aria-hidden="true">
                <svg viewBox="0 0 32 32" width="28" height="28">
                  <rect x="3" y="11" width="26" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M8 14v4M8 14h-1.5M8 14h1.5M8 18h-1.5M8 18h1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M13 16h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2 2"/>
                </svg>
              </span>
              <span className="pr-mode-text">
                <span className="pr-mode-title">Fill in the blank</span>
                <span className="pr-mode-sub">Type the missing word in {courseMeta.name}.</span>
              </span>
              <span className="pr-mode-check" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </button>
          </div>
        </div>

        <div className="pr-start-bar">
          <div className="pr-start-summary">
            <span className="pr-summary-eyebrow">Ready</span>
            <span className="pr-summary-text">
              {config.count === "unlimited" ? "Unlimited" : config.count} {config.mode === "mc" ? "multiple-choice" : "fill-in-the-blank"} prompts · {courseMeta.name}
            </span>
          </div>
          <button className="pr-start-cta" onClick={onStart}>
            Begin practice
            <svg viewBox="0 0 16 16" width="14" height="14"><path d="M5 3l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </section>
    </main>
  );
}

// ─── Session ───────────────────────────────────────────────────────────
function PracticeSession({ item, idx, total, mode, voice, pool, sessionStats, onResult, onNext, onQuit }) {
  const [answered, setAnswered] = useStateP(false);
  const [correct, setCorrect] = useStateP(false);
  const [picked, setPicked] = useStateP(null); // for MC: index of bank button
  const [val, setVal] = useStateP("");         // for fill
  const inputRef = useRefP(null);

  // 4 MC options — correct + 3 distractors. Memoised per item.
  const bank = useMemoP(() => {
    if (mode !== "mc") return [];
    const others = pool.filter((p) => p.word !== item.word);
    const distractors = shuffle(others).slice(0, 3).map((p) => p.word);
    return shuffle([item.word, ...distractors]);
  }, [item, mode]);

  // Reset on item change
  useEffectP(() => {
    setAnswered(false);
    setCorrect(false);
    setPicked(null);
    setVal("");
    if (mode === "fill" && inputRef.current) {
      setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
    }
  }, [idx, mode]);

  function commit(isCorrect) {
    setCorrect(isCorrect);
    setAnswered(true);
    onResult(isCorrect);
    // Speak the full correct sentence
    setTimeout(() => speak(item.full, voice), 200);
  }

  function pickMC(i) {
    if (answered) return;
    setPicked(i);
    commit(bank[i] === item.word);
  }

  function submitFill() {
    if (answered || !val.trim()) return;
    const ok = normalize(val) === normalize(item.word);
    commit(ok);
  }

  // Build sentence nodes: blanks shown as filled answer after answered
  const sentenceNodes = item.sentence.map((tok, i) => {
    if (tok === "_") {
      let cls = "ls-blank";
      let content = "·";
      if (!answered) {
        if (mode === "fill") {
          return (
            <input
              key={i}
              ref={inputRef}
              className="ls-input pr-fill-input"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submitFill(); }}
              placeholder="…"
              autoComplete="off"
              spellCheck={false}
              lang={voice.split("-")[0]}
              style={{ width: Math.max(val.length, item.word.length, 5) + 2 + "ch" }}
            />
          );
        }
        cls += " is-empty";
      } else {
        cls += correct ? " is-correct" : " is-wrong";
        content = item.word;
      }
      return <span key={i} className={cls}>{content}</span>;
    }
    return <span key={i} className="ls-sent-word">{tok}</span>;
  });

  const pipFrac = Math.max(0, Math.min(1, idx / total));

  return (
    <div className="pr-session">
      {/* Header: exit, progress, tally */}
      <header className="ls-head pr-session-head">
        <button className="ls-exit" onClick={onQuit} aria-label="Quit round">
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <div className="pr-pipbar" aria-label={`Item ${idx + 1} of ${total}`}>
          <span className="pr-pipbar-track" />
          <span className="pr-pipbar-fill" style={{ width: `${(idx / total) * 100}%` }} />
          <span className="pr-pipbar-cur" style={{ left: `${(idx / total) * 100}%`, width: `${(1 / total) * 100}%` }} />
        </div>
        <div className="pr-tally" aria-label="Round tally">
          <span className="pr-tally-chip pr-tally-chip--good">
            <svg viewBox="0 0 16 16" width="11" height="11"><path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span>{sessionStats.correct}</span>
          </span>
          <span className="pr-tally-chip pr-tally-chip--bad">
            <svg viewBox="0 0 16 16" width="11" height="11"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
            <span>{sessionStats.wrong}</span>
          </span>
        </div>
      </header>

      <main className="ls-stage pr-stage" key={idx}>
        <div className="ls-stage-inner">
          <div className="ls-slide pr-slide">
            <span className="ls-eyebrow">{mode === "mc" ? "Choose the missing word" : "Type the missing word"}</span>
            <h2 className="ls-h ls-mc-prompt">Fill in the blank.</h2>
            <p className="ls-en-target">{item.translation.charAt(0).toUpperCase() + item.translation.slice(1)} — “{englishHint(item)}”</p>

            <div className="ls-sentence pr-sentence">{sentenceNodes}</div>

            {mode === "mc" && (
              <div className="pr-mc-grid">
                {bank.map((w, i) => {
                  const isPicked = picked === i;
                  const isRightOne = answered && w === item.word;
                  const isWrongPick = answered && isPicked && !isRightOne;
                  return (
                    <button
                      key={i}
                      className={
                        "pr-mc-btn" +
                        (isRightOne ? " is-correct" : "") +
                        (isWrongPick ? " is-wrong" : "") +
                        (answered && !isPicked && !isRightOne ? " is-dim" : "")
                      }
                      onClick={() => pickMC(i)}
                      disabled={answered}
                    >
                      <span className="pr-mc-letter">{["A","B","C","D"][i]}</span>
                      <span className="pr-mc-word">{w}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {mode === "fill" && !answered && (
              <div className="pr-fill-row">
                <p className="ls-hint">
                  <span className="ls-hint-mark">?</span>
                  {item.roman
                    ? <>Translation hint: <b>{item.translation}</b>{item.roman && <> · sounds like <em>“{item.roman}”</em></>}</>
                    : <>Translation hint: <b>{item.translation}</b></>}
                </p>
                <button
                  className="pr-submit"
                  onClick={submitFill}
                  disabled={!val.trim()}
                >
                  Submit
                  <svg viewBox="0 0 16 16" width="12" height="12"><path d="M5 3l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            )}

            {answered && (
              <div className={"ls-feedback pr-feedback" + (correct ? " is-correct" : " is-wrong")}>
                <span className="ls-feedback-icon">
                  {correct ? (
                    <svg viewBox="0 0 16 16" width="16" height="16"><path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : (
                    <svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                  )}
                </span>
                <span className="pr-feedback-text">
                  <span className="pr-feedback-headline">{correct ? "Right." : "Not quite."}</span>
                  <span className="pr-feedback-sub">
                    {correct
                      ? <>“<b lang={voice.split("-")[0]}>{item.full}</b>”</>
                      : <>The word was <b lang={voice.split("-")[0]}>{item.word}</b>. “<span lang={voice.split("-")[0]}>{item.full}</span>”</>}
                  </span>
                </span>
                <button
                  className="pr-replay"
                  onClick={() => speak(item.full, voice)}
                  aria-label="Replay sentence"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8c1.5 1 1.5 7 0 8" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="ls-foot pr-session-foot">
        <span className="pr-foot-meta">
          <span className="pr-foot-meta-eyebrow">From your lessons</span>
          <span className="pr-foot-meta-text">{item.unit}</span>
        </span>
        <span className="ls-foot-count">{idx + 1} <span>/</span> {total}</span>
        <button
          className={"ls-cta" + (answered ? (correct ? " is-ok" : " is-wrong") : "")}
          disabled={!answered}
          onClick={onNext}
        >
          <span>{idx === total - 1 ? "Finish round" : "Next"}</span>
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M5 3l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </footer>
    </div>
  );
}

// Build an English sentence hint by replacing the target word with its translation
function englishHint(item) {
  // We don't store the full English sentence; quick heuristic — derive from translation alone.
  return item.translation;
}

// ─── Results ───────────────────────────────────────────────────────────
function PracticeResults({ sessionStats, total, onAgain, onHome }) {
  const accuracy = (sessionStats.correct + sessionStats.wrong) > 0
    ? Math.round(100 * sessionStats.correct / (sessionStats.correct + sessionStats.wrong))
    : 0;

  return (
    <main className="g-main pr-main">
      <section className="pr-results">
        <div className="pr-results-medal" aria-hidden="true">
          <svg viewBox="0 0 80 80" width="96" height="96">
            <circle cx="40" cy="40" r="34" fill="var(--accent)" />
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--accent-2)" strokeWidth="2" />
            <path d="M27 41l9 9 18-20" stroke="var(--cream)" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="pr-results-title">Round complete</h2>
        <p className="pr-results-sub">
          {accuracy >= 90 ? "Nailed it. Another?" :
           accuracy >= 70 ? "Solid round. The wobbly ones will come back." :
           "Worth doing again — the second pass always sticks better."}
        </p>

        <div className="pr-results-stats">
          <div className="pr-result-stat">
            <span className="pr-result-num">{sessionStats.correct}</span>
            <span className="pr-result-lbl">Correct</span>
          </div>
          <div className="pr-result-stat">
            <span className="pr-result-num">{sessionStats.wrong}</span>
            <span className="pr-result-lbl">Missed</span>
          </div>
          <div className="pr-result-stat pr-result-stat--accent">
            <span className="pr-result-num">{accuracy}%</span>
            <span className="pr-result-lbl">Accuracy</span>
          </div>
        </div>

        <div className="pr-results-cta">
          <button className="pr-start-cta" onClick={onAgain}>
            Another round
            <svg viewBox="0 0 16 16" width="14" height="14"><path d="M5 3l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button className="pr-secondary-cta" onClick={onHome}>
            Back to Practice
          </button>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PracticeApp />);
