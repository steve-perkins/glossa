// Stories app — landing page (level + grid) + reader (split, audio, scroll sync)

const { useState: useS, useEffect: useE, useMemo: useM, useRef: useR, useCallback: useCB } = React;

// ─── localStorage helpers ────────────────────────────────────────────────
const READ_KEY = "glossa-stories-read-v1";
function loadReadMap() {
  try { return JSON.parse(localStorage.getItem(READ_KEY)) || {}; }
  catch { return {}; }
}
function saveReadMap(m) {
  try { localStorage.setItem(READ_KEY, JSON.stringify(m)); } catch {}
}

// SpeechSynthesis lang code per target
const SPEECH_LANG = { greek: "el-GR", spanish: "es-ES" };

// Audio speed presets (rate passed to SpeechSynthesisUtterance)
const SPEED_PRESETS = [
  { id: "slow",    label: "Slow",    sub: "learning a new sound",  rate: 0.55 },
  { id: "easy",    label: "Easy",    sub: "comfortable listening",  rate: 0.75 },
  { id: "default", label: "Default", sub: "recommended for stories", rate: 0.9 },
  { id: "native",  label: "Native",  sub: "full speaking speed",    rate: 1.0 },
];
const SPEED_KEY = "glossa-stories-speed-v1";
function loadSpeedId() {
  try { return localStorage.getItem(SPEED_KEY) || "default"; } catch { return "default"; }
}
function saveSpeedId(id) {
  try { localStorage.setItem(SPEED_KEY, id); } catch {}
}

const LEVEL_NAMES = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper-int.",
  C1: "Advanced",
  C2: "Mastery",
};

// Build {wordStarts, words} for a paragraph: charIndex (utterance) → word idx.
function tokenizeWords(text) {
  const starts = [];
  const re = /\S+/g;
  let m;
  while ((m = re.exec(text))) starts.push(m.index);
  return starts;
}
// Find largest start ≤ charIndex
function charToWordIdx(starts, charIndex) {
  let lo = 0, hi = starts.length - 1, ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (starts[mid] <= charIndex) { ans = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  return ans;
}

// ─── Root ────────────────────────────────────────────────────────────────
function StoriesApp() {
  const [langId, setLangId] = useS("greek");
  const lang = window.GLOSSA_COURSES[langId];
  const allStories = window.GLOSSA_STORIES[langId] || {};
  const levels = lang.levels;
  const [level, setLevel] = useS(levels[0]);
  const [readMap, setReadMap] = useS(loadReadMap);
  const [filter, setFilter] = useS("all"); // all | unread | read
  const [openStory, setOpenStory] = useS(null); // story object when reading

  useE(() => {
    document.body.classList.toggle("in-reader", !!openStory);
    return () => document.body.classList.remove("in-reader");
  }, [openStory]);

  // When language changes, pick its first available level
  useE(() => {
    if (!levels.includes(level)) setLevel(levels[0]);
  }, [langId]);

  function markRead(storyId, val = true) {
    setReadMap((m) => {
      const next = { ...m, [storyId]: val };
      saveReadMap(next);
      return next;
    });
  }

  function navigate(navId) {
    if (navId === "lessons") window.location.href = "Glossa.html";
    else if (navId === "practice") window.location.href = "Practice.html";
    else if (navId === "conversation") window.location.href = "Conversation.html";
    // stories — already here
  }

  // story.read defaults are from data, but localStorage overrides
  function isRead(story) {
    if (story.id in readMap) return readMap[story.id];
    return !!story.read;
  }

  const storiesAtLevel = allStories[level] || [];
  const visibleStories = storiesAtLevel.filter((s) => {
    if (filter === "all") return true;
    if (filter === "read") return isRead(s);
    return !isRead(s);
  });

  const totalAtLevel = storiesAtLevel.length;
  const readAtLevel = storiesAtLevel.filter(isRead).length;
  const totalAll = levels.flatMap((lv) => allStories[lv] || []).length;
  const readAll = levels.flatMap((lv) => allStories[lv] || []).filter(isRead).length;

  return (
    <div className="g-app">
      <Navbar
        courses={window.GLOSSA_COURSES}
        activeLangId={langId}
        onPickLang={setLangId}
        activeNav="stories"
        onPickNav={navigate}
      />

      <main className="g-main">
        {/* Header */}
        <section className="st-head">
          <div>
            <h1 className="g-page-title">
              Stories
              <span className="g-page-title-native">in {lang.name}</span>
            </h1>
            <p className="g-page-sub">
              Short bilingual reads, hand-picked by level. Toggle the translation, listen along, and watch each word light up as it's spoken.
            </p>
          </div>
          <div className="st-stats">
            <div className="st-stat">
              <span className="st-stat-num">{readAll}</span>
              <span className="st-stat-lbl">read<br/>so far</span>
            </div>
            <div className="st-stat">
              <span className="st-stat-num">{totalAll - readAll}</span>
              <span className="st-stat-lbl">new stories<br/>waiting</span>
            </div>
          </div>
        </section>

        {/* Level selector */}
        <section>
          <div className="st-levels" role="tablist" aria-label="Levels">
            {["A1","A2","B1","B2","C1","C2"].map((lv) => {
              const exists = levels.includes(lv);
              const active = lv === level;
              const list = exists ? (allStories[lv] || []) : [];
              const total = list.length;
              const done = list.filter(isRead).length;
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <button
                  key={lv}
                  role="tab"
                  aria-selected={active}
                  disabled={!exists}
                  className={"st-level" + (active ? " is-active" : "") + (exists ? "" : " is-empty")}
                  onClick={() => exists && setLevel(lv)}
                >
                  <span className="st-level-code">{lv}</span>
                  <span className="st-level-name">{LEVEL_NAMES[lv]}</span>
                  {exists ? (
                    <>
                      <span className="st-level-count">{done} / {total}</span>
                      <span className="st-level-bar" aria-hidden="true">
                        <span className="st-level-bar-fill" style={{ width: pct + "%" }} />
                      </span>
                    </>
                  ) : (
                    <span className="st-level-soon">Coming soon</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Stories grid */}
        <section className="st-list-section">
          <div className="st-list-head">
            <div>
              <h2 className="st-section-title">{level} · {LEVEL_NAMES[level]}</h2>
              <p className="st-section-sub">
                {totalAtLevel} {totalAtLevel === 1 ? "story" : "stories"}
                {" · "}
                {readAtLevel} read
                {" · "}
                {totalAtLevel - readAtLevel} new
              </p>
            </div>
            <div className="st-filter" role="group" aria-label="Filter">
              {[
                { id: "all", label: "All" },
                { id: "unread", label: "Unread" },
                { id: "read", label: "Read" },
              ].map((o) => (
                <button
                  key={o.id}
                  className={"st-filter-btn" + (filter === o.id ? " is-active" : "")}
                  onClick={() => setFilter(o.id)}
                  aria-pressed={filter === o.id}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="st-grid">
            {visibleStories.length === 0 && (
              <div className="st-card-empty">
                Nothing here yet. Try another filter or level.
              </div>
            )}
            {visibleStories.map((s) => (
              <StoryCard
                key={s.id}
                story={s}
                read={isRead(s)}
                onOpen={() => setOpenStory(s)}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="g-foot">
        <span>Glossa · learn languages slowly, on purpose</span>
        <span className="g-foot-links">
          <a href="#">About</a>
        </span>
      </footer>

      {openStory && (
        <Reader
          story={openStory}
          langId={langId}
          langName={lang.name}
          level={level}
          onClose={() => setOpenStory(null)}
          onMarkRead={(val) => markRead(openStory.id, val)}
          read={isRead(openStory)}
        />
      )}
    </div>
  );
}

// ─── Story card ──────────────────────────────────────────────────────────
function StoryCard({ story, read, onOpen }) {
  return (
    <button className={"st-card" + (read ? " is-read" : "")} onClick={onOpen}>
      <div className="st-card-cover">
        <div className="st-card-cover-pat" aria-hidden="true" />
        <span className="st-card-cover-glyph" aria-hidden="true">{story.glyph}</span>
        <span className={"st-card-tag " + (read ? "is-read" : "is-unread")}>
          {read ? (
            <>
              <CheckIcon /> Read
            </>
          ) : (
            <>
              <DotIcon /> New
            </>
          )}
        </span>
      </div>
      <div className="st-card-body">
        <div className="st-card-native">{story.nativeTitle}</div>
        <div className="st-card-title">{story.title}</div>
        <p className="st-card-excerpt">{story.excerpt}</p>
        <div className="st-card-foot">
          <span className="st-card-foot-meta">
            <span>{story.minutes} min</span>
            <span className="dot" />
            <span>{story.words} words</span>
          </span>
          <span>{story.paragraphs.length} ¶</span>
        </div>
      </div>
    </button>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">
      <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DotIcon() {
  return (
    <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true">
      <circle cx="8" cy="8" r="4" fill="currentColor" />
    </svg>
  );
}

// ─── Reader (full-screen overlay) ────────────────────────────────────────
function Reader({ story, langId, langName, level, onClose, onMarkRead, read }) {
  const [split, setSplit] = useS(true);
  const [audioState, setAudioState] = useS("idle"); // idle | playing
  const [paraIdx, setParaIdx] = useS(-1);
  const [wordIdx, setWordIdx] = useS(-1);
  const [audioSupported, setAudioSupported] = useS(true);
  const [speedId, setSpeedId] = useS(loadSpeedId);
  const [speedOpen, setSpeedOpen] = useS(false);
  const speedWrapRef = useR(null);

  const targetPaneRef = useR(null);
  const transPaneRef = useR(null);
  const stoppedRef = useR(false);
  const ignoreUntilRef = useR({ target: 0, trans: 0 });
  const speechLang = SPEECH_LANG[langId] || "en-US";
  const speed = SPEED_PRESETS.find((s) => s.id === speedId) || SPEED_PRESETS[2];
  // Keep a ref so onend / boundary closures see the latest rate without re-binding
  const rateRef = useR(speed.rate);
  useE(() => { rateRef.current = speed.rate; }, [speed.rate]);

  // Close speed menu on outside click
  useE(() => {
    function onDoc(e) {
      if (speedWrapRef.current && !speedWrapRef.current.contains(e.target)) setSpeedOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Precompute word starts per paragraph
  const wordStarts = useM(
    () => story.paragraphs.map((p) => tokenizeWords(p.t)),
    [story]
  );

  // ESC to close
  useE(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === " " && e.target.tagName !== "INPUT") {
        e.preventDefault();
        toggleAudio();
      }
      if (e.key === "s" || e.key === "S") setSplit((v) => !v);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  // Stop audio on unmount
  useE(() => {
    return () => {
      stoppedRef.current = true;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Detect speech support
  useE(() => {
    if (!("speechSynthesis" in window)) setAudioSupported(false);
    // Force voices load (some browsers)
    if (window.speechSynthesis && window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => { /* trigger */ };
    }
  }, []);

  // Mark story as read after reading to end of target pane
  const markedRef = useR(false);
  useE(() => {
    function onTargetScroll() {
      const el = targetPaneRef.current;
      if (!el || markedRef.current || read) return;
      const nearEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
      if (nearEnd) {
        markedRef.current = true;
        onMarkRead(true);
      }
    }
    const el = targetPaneRef.current;
    if (el) el.addEventListener("scroll", onTargetScroll, { passive: true });
    return () => { if (el) el.removeEventListener("scroll", onTargetScroll); };
  }, [read, onMarkRead]);

  // ─── Scroll sync ─────────────────────────────────────────────────────
  // For each pane: on scroll, find the paragraph whose vertical center is
  // closest to the pane's center, then scroll the OTHER pane so that the
  // same-index paragraph's center sits at the same fractional position.
  const syncFrom = useCB((from) => {
    if (!split) return;
    const a = from === "target" ? targetPaneRef.current : transPaneRef.current;
    const b = from === "target" ? transPaneRef.current : targetPaneRef.current;
    if (!a || !b) return;

    // Find paragraph in A whose center is closest to A's visual center
    const aParas = a.querySelectorAll(".st-para");
    if (aParas.length === 0) return;
    const aRect = a.getBoundingClientRect();
    const aCenter = aRect.top + aRect.height * 0.4; // bias toward top a bit
    let bestIdx = 0, bestDelta = Infinity, bestFrac = 0;
    aParas.forEach((p, i) => {
      const r = p.getBoundingClientRect();
      const center = r.top + r.height / 2;
      const delta = Math.abs(center - aCenter);
      if (delta < bestDelta) {
        bestDelta = delta;
        bestIdx = i;
        // fraction within paragraph
        const f = (aCenter - r.top) / Math.max(r.height, 1);
        bestFrac = Math.max(0, Math.min(1, f));
      }
    });

    const bParas = b.querySelectorAll(".st-para");
    const target = bParas[bestIdx];
    if (!target) return;
    const bRect = b.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    // We want target paragraph's center to land at aCenter offset in B
    const desiredTop = tRect.top - bRect.top + tRect.height * bestFrac - bRect.height * 0.4;
    const newScroll = b.scrollTop + desiredTop;

    // Suppress B's next sync to prevent ping-pong
    const otherKey = from === "target" ? "trans" : "target";
    ignoreUntilRef.current[otherKey] = Date.now() + 220;
    b.scrollTo({ top: newScroll, behavior: "auto" });
  }, [split]);

  useE(() => {
    if (!split) return;
    const target = targetPaneRef.current;
    const trans = transPaneRef.current;
    if (!target || !trans) return;
    function onTargetScroll() {
      if (Date.now() < ignoreUntilRef.current.target) return;
      syncFrom("target");
    }
    function onTransScroll() {
      if (Date.now() < ignoreUntilRef.current.trans) return;
      syncFrom("trans");
    }
    target.addEventListener("scroll", onTargetScroll, { passive: true });
    trans.addEventListener("scroll", onTransScroll, { passive: true });
    return () => {
      target.removeEventListener("scroll", onTargetScroll);
      trans.removeEventListener("scroll", onTransScroll);
    };
  }, [split, syncFrom]);

  // When split toggles ON, align right away
  useE(() => {
    if (split) {
      // Defer to next tick so layout is settled
      requestAnimationFrame(() => syncFrom("target"));
    }
  }, [split, syncFrom]);

  // ─── Audio ───────────────────────────────────────────────────────────
  function pickVoice(langCode) {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    return voices.find((v) => v.lang === langCode)
        || voices.find((v) => v.lang.toLowerCase().startsWith(langCode.slice(0,2).toLowerCase()))
        || null;
  }

  function speakParagraph(i) {
    if (stoppedRef.current) return;
    if (i >= story.paragraphs.length) {
      setAudioState("idle");
      setParaIdx(-1); setWordIdx(-1);
      if (!read) { markedRef.current = true; onMarkRead(true); }
      return;
    }
    setParaIdx(i);
    setWordIdx(-1);
    scrollParaIntoView(i);

    const text = story.paragraphs[i].t;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = speechLang;
    u.rate = rateRef.current;
    const voice = pickVoice(speechLang);
    if (voice) u.voice = voice;
    u.onboundary = (ev) => {
      if (ev.name && ev.name !== "word") return;
      const wIdx = charToWordIdx(wordStarts[i], ev.charIndex || 0);
      setWordIdx(wIdx);
      scrollWordIntoView(i, wIdx);
    };
    u.onend = () => {
      if (stoppedRef.current) return;
      // brief breath between paragraphs
      setTimeout(() => speakParagraph(i + 1), 220);
    };
    u.onerror = () => {
      if (stoppedRef.current) return;
      setTimeout(() => speakParagraph(i + 1), 220);
    };
    try {
      window.speechSynthesis.speak(u);
    } catch {
      setAudioState("idle");
    }
  }

  function startAudio() {
    if (!("speechSynthesis" in window)) { setAudioSupported(false); return; }
    stoppedRef.current = false;
    setAudioState("playing");
    // resume from current paragraph if mid-story, else from 0
    const startAt = paraIdx >= 0 ? paraIdx : 0;
    window.speechSynthesis.cancel();
    speakParagraph(startAt);
  }
  function stopAudio() {
    stoppedRef.current = true;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setAudioState("idle");
  }
  function toggleAudio() {
    if (audioState === "playing") stopAudio();
    else startAudio();
  }

  // Change speed. If currently playing, restart current paragraph at new rate.
  function pickSpeed(id) {
    setSpeedId(id);
    saveSpeedId(id);
    setSpeedOpen(false);
    const preset = SPEED_PRESETS.find((s) => s.id === id);
    if (!preset) return;
    rateRef.current = preset.rate;
    if (audioState === "playing") {
      // Restart current paragraph from its start at the new rate
      const resumeAt = Math.max(paraIdx, 0);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      // Tiny delay so cancel() settles in some browsers before next speak()
      setTimeout(() => {
        if (stoppedRef.current) return;
        speakParagraph(resumeAt);
      }, 60);
    }
  }

  function scrollParaIntoView(i) {
    const pane = targetPaneRef.current;
    if (!pane) return;
    const p = pane.querySelector(`[data-para-idx="${i}"]`);
    if (!p) return;
    const pRect = p.getBoundingClientRect();
    const paneRect = pane.getBoundingClientRect();
    const desired = paneRect.top + paneRect.height * 0.18;
    const delta = pRect.top - desired;
    if (Math.abs(delta) > 8) {
      pane.scrollBy({ top: delta, behavior: "smooth" });
    }
  }
  function scrollWordIntoView(pi, wi) {
    const pane = targetPaneRef.current;
    if (!pane) return;
    const p = pane.querySelector(`[data-para-idx="${pi}"]`);
    if (!p) return;
    const w = p.querySelector(`[data-word-idx="${wi}"]`);
    if (!w) return;
    const wRect = w.getBoundingClientRect();
    const paneRect = pane.getBoundingClientRect();
    // Only nudge if word is leaving the comfortable read zone (25%-65%)
    const top = wRect.top - paneRect.top;
    if (top < paneRect.height * 0.20 || top > paneRect.height * 0.65) {
      const desired = paneRect.height * 0.30;
      pane.scrollBy({ top: top - desired, behavior: "smooth" });
    }
  }

  // Audio progress (approx, by paragraph count)
  const progressPct = audioState === "playing"
    ? Math.round((paraIdx / Math.max(story.paragraphs.length, 1)) * 100)
    : 0;

  return (
    <div className="st-reader" role="dialog" aria-modal="true">
      <header className="st-reader-head">
        <button className="st-exit" onClick={onClose} aria-label="Close reader">
          <svg viewBox="0 0 20 20" width="16" height="16">
            <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="st-reader-title">
          <span className="st-reader-eyebrow">{langName} · {level} · {story.minutes} min</span>
          <span className="st-reader-h">{story.nativeTitle}</span>
        </div>

        <div className="st-tools">
          <button
            className={"st-tool" + (split ? " is-active" : "")}
            onClick={() => setSplit((v) => !v)}
            aria-pressed={split}
            title="Toggle split-screen translation (S)"
          >
            <span className="st-tool-icon"><SplitIcon on={split} /></span>
            <span className="st-tool-label">Split</span>
          </button>
          <button
            className={"st-tool" + (audioState === "playing" ? " is-playing" : "")}
            onClick={toggleAudio}
            disabled={!audioSupported}
            aria-pressed={audioState === "playing"}
            title={audioSupported ? "Play story aloud (Space)" : "Audio not supported in this browser"}
          >
            <span className="st-tool-icon">
              {audioState === "playing" ? <StopIcon /> : <PlayIcon />}
            </span>
            <span className="st-tool-label">
              {audioState === "playing" ? "Stop" : "Read aloud"}
            </span>
          </button>

          <div className="st-speedwrap" ref={speedWrapRef}>
            <button
              className={"st-tool" + (speedOpen ? " is-active" : "")}
              onClick={() => setSpeedOpen((v) => !v)}
              disabled={!audioSupported}
              aria-haspopup="listbox"
              aria-expanded={speedOpen}
              title="Reading speed"
            >
              <span className="st-speed-val">{speed.rate.toFixed(2).replace(/0$/,"")}×</span>
              <svg viewBox="0 0 12 12" width="10" height="10" className="st-speed-chev" aria-hidden="true">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {speedOpen && (
              <ul className="st-speedmenu" role="listbox" aria-label="Reading speed">
                <li className="st-speedmenu-h">Reading speed</li>
                {SPEED_PRESETS.map((p) => (
                  <li key={p.id}>
                    <button
                      role="option"
                      aria-selected={p.id === speedId}
                      className={"st-speeditem" + (p.id === speedId ? " is-active" : "")}
                      onClick={() => pickSpeed(p.id)}
                    >
                      <span>
                        <div className="st-speeditem-label">{p.label}</div>
                        <div className="st-speeditem-val" style={{ marginTop: 2, fontFamily: "inherit", fontSize: 11.5, letterSpacing: 0 }}>{p.sub}</div>
                      </span>
                      <span className="st-speeditem-val">{p.rate.toFixed(2).replace(/0$/,"")}×</span>
                      <span className="st-speeditem-check">
                        {p.id === speedId && <CheckIcon />}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </header>

      <div className={"st-reader-body" + (split ? " is-split" : "")}>
        <div className="st-pane st-pane-target" ref={targetPaneRef}>
          <div className="st-pane-inner">
            <div className="st-pane-label">
              <span className="dot" />
              <span>{langName} · target</span>
            </div>
            <h1 className="st-story-h">{story.nativeTitle}</h1>
            <p className="st-story-meta">
              <span>{level}</span>
              <span className="dot" />
              <span>{story.minutes} min read</span>
              <span className="dot" />
              <span>{story.words} words</span>
            </p>

            {story.paragraphs.map((p, i) => (
              <Paragraph
                key={i}
                paraIdx={i}
                text={p.t}
                active={paraIdx === i}
                activeWord={paraIdx === i ? wordIdx : -1}
              />
            ))}

            <div className="st-story-end">
              <div className="st-story-end-title">Τέλος. The end.</div>
              <div className="st-story-end-actions">
                <button
                  className="st-end-btn is-primary"
                  onClick={() => { onMarkRead(!read); }}
                >
                  {read ? "Mark as unread" : "Mark as read"}
                </button>
                <button className="st-end-btn" onClick={onClose}>
                  Back to stories
                </button>
              </div>
            </div>
          </div>
        </div>

        {split && (
          <div className="st-pane st-pane-trans" ref={transPaneRef}>
            <div className="st-pane-inner">
              <div className="st-pane-label">
                <span className="dot" />
                <span>English · translation</span>
              </div>
              <h1 className="st-story-h-en">{story.title}</h1>
              <p className="st-story-meta">
                <span>parallel translation</span>
                <span className="dot" />
                <span>scrolls with the original</span>
              </p>

              {story.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={"st-para" + (paraIdx === i ? " is-active-para" : "")}
                  data-para-idx={i}
                >
                  {p.e}
                </p>
              ))}

              <div className="st-story-end">
                <div className="st-story-end-title">The end.</div>
                <div className="st-story-end-actions">
                  <button className="st-end-btn" onClick={onClose}>Back to stories</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="st-audio-strip" aria-hidden="true">
          <div className="st-audio-strip-fill" style={{ width: progressPct + "%" }} />
        </div>
      </div>
    </div>
  );
}

// ─── Paragraph with word spans ───────────────────────────────────────────
function Paragraph({ paraIdx, text, active, activeWord }) {
  // Split preserving whitespace; wrap each non-whitespace token in a span.
  const parts = useM(() => text.split(/(\s+)/), [text]);
  let wIdx = 0;
  return (
    <p
      className={"st-para" + (active ? " is-active-para" : "")}
      data-para-idx={paraIdx}
    >
      {parts.map((part, i) => {
        if (part === "" || /^\s+$/.test(part)) {
          return <React.Fragment key={i}>{part}</React.Fragment>;
        }
        const myIdx = wIdx++;
        const cls = "st-word" + (myIdx === activeWord ? " is-active" : "");
        return (
          <span key={i} className={cls} data-word-idx={myIdx}>
            {part}
          </span>
        );
      })}
    </p>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────
function SplitIcon({ on }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <rect x="2" y="2.5" width="12" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray={on ? "0" : "2 2"} />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M4 3.5v9l8-4.5z" fill="currentColor" />
    </svg>
  );
}
function StopIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <rect x="4" y="4" width="8" height="8" rx="1" fill="currentColor" />
    </svg>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<StoriesApp />);
