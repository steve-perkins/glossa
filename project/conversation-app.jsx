// Conversation app — landing (level + scenarios + free chat) + chat view
// Engine: WebLLM (local Llama-3.2-1B) primary, window.claude.complete fallback.

const { useState: useC, useEffect: useCE, useMemo: useCM, useRef: useCR, useCallback: useCC } = React;

const WEBLLM_MODELS = [
  {
    id: "Qwen2.5-1.5B-Instruct-q4f32_1-MLC",
    label: "Qwen 2.5 - 1.5B Instruct",
    short: "Qwen 2.5 - 1.5B",
    sizeMB: 1100,
    note: "Runs entirely in your browser. Cached after first download.",
  },
];
const DEFAULT_MODEL_ID = WEBLLM_MODELS[0].id;
const MODEL_PREF_KEY = "glossa-conv-model-v1";
const ENGINE_PREF_KEY = "glossa-conv-engine-v1"; // legacy, kept for back-compat
const COMPLETED_KEY = "glossa-conv-completed-v1";

const LEVEL_NAMES = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper-int.",
  C1: "Advanced",
  C2: "Mastery",
};

// ─── localStorage ────────────────────────────────────────────────────────
function loadModelPref() {
  try {
    const v = localStorage.getItem(MODEL_PREF_KEY);
    if (v && WEBLLM_MODELS.some((m) => m.id === v)) return v;
  } catch {}
  return DEFAULT_MODEL_ID;
}
function saveModelPref(v) {
  try { localStorage.setItem(MODEL_PREF_KEY, v); } catch {}
}
// Kept for back-compat; unused
function loadEnginePref() {
  try { return localStorage.getItem(ENGINE_PREF_KEY) || ""; } catch { return ""; }
}
function saveEnginePref(v) {
  try { localStorage.setItem(ENGINE_PREF_KEY, v); } catch {}
}
function loadCompleted() {
  try { return JSON.parse(localStorage.getItem(COMPLETED_KEY)) || {}; } catch { return {}; }
}
function saveCompleted(m) {
  try { localStorage.setItem(COMPLETED_KEY, JSON.stringify(m)); } catch {}
}

// ─── Engine abstraction ──────────────────────────────────────────────────
// Both engines expose:
//   init(onProgress) → Promise<void>
//   streamReply(messages, abortSignal) → AsyncIterable<string>  (yields deltas)
//   id, label
class WebLLMEngine {
  constructor(modelId) {
    this.id = "webllm";
    this.modelId = modelId || DEFAULT_MODEL_ID;
    const meta = WEBLLM_MODELS.find((m) => m.id === this.modelId);
    this.label = meta ? meta.label : this.modelId;
    this.engine = null;
  }
  async init(onProgress) {
    if (!window.WebLLM) throw new Error("WebLLM module not available");
    if (!("gpu" in navigator)) throw new Error("WebGPU not supported in this browser");
    this.engine = await window.WebLLM.CreateMLCEngine(this.modelId, {
      initProgressCallback: (r) => onProgress({ text: r.text || "Loading model…", progress: r.progress ?? 0 }),
    });
  }
  async *streamReply(messages, signal) {
    const stream = await this.engine.chat.completions.create({
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 280,
    });
    for await (const chunk of stream) {
      if (signal?.aborted) break;
      yield chunk.choices?.[0]?.delta?.content || "";
    }
  }
}

class ClaudeEngine {
  // Kept as a stub so the surrounding code paths still compile, but no longer
  // surfaced in the engine selector. Calling init() will throw so callers can
  // fall back gracefully if anything tries to use it.
  constructor() { this.id = "claude"; this.label = "Built-in (disabled)"; }
  async init() { throw new Error("Built-in assistant is disabled in this build"); }
  async *streamReply() { throw new Error("Built-in assistant is disabled in this build"); }
}

// ─── Root ────────────────────────────────────────────────────────────────
function ConversationApp() {
  const cv = window.GLOSSA_CONVERSATION;
  const [langId, setLangId] = useC("greek");
  const lang = window.GLOSSA_COURSES[langId];
  const levels = lang.levels;
  const [level, setLevel] = useC(levels[0]);
  const [completed, setCompleted] = useC(loadCompleted);
  const [session, setSession] = useC(null); // active chat session

  // Engine state
  const [modelId, setModelId] = useC(loadModelPref);       // active local model id
  const [engineId, setEngineId] = useC(null);              // currently-loaded model id (engine.modelId)
  const [engineStatus, setEngineStatus] = useC("idle");    // idle | loading | ready | error
  const [engineProgress, setEngineProgress] = useC({ text: "", progress: 0 });
  const [engineError, setEngineError] = useC(null);
  const engineRef = useCR(null);
  const webllmAvailRef = useCR(false);

  // Track whether WebLLM module loaded
  const [webllmModuleReady, setWebllmModuleReady] = useC(!!window.WebLLM);
  useCE(() => {
    function onReady() { setWebllmModuleReady(true); }
    function onFailed() { setWebllmModuleReady(false); }
    window.addEventListener("webllm-loaded", onReady);
    window.addEventListener("webllm-failed", onFailed);
    if (window.WebLLM) setWebllmModuleReady(true);
    return () => {
      window.removeEventListener("webllm-loaded", onReady);
      window.removeEventListener("webllm-failed", onFailed);
    };
  }, []);

  // When language changes, reset level if needed
  useCE(() => {
    if (!levels.includes(level)) setLevel(levels[0]);
  }, [langId]);

  // Toggle body class for chat takeover
  useCE(() => {
    document.body.classList.toggle("in-chat", !!session);
    return () => document.body.classList.remove("in-chat");
  }, [session]);

  // WebLLM is the only family right now; the picker is kept so additional
  // local models (more Qwens, Phi, etc.) can slot in later. `modelId` is the
  // currently-chosen model. `engineId` is whichever model is actually loaded
  // in the engine instance — they diverge briefly when a switch is in flight.
  const webGPUSupported = typeof navigator !== "undefined" && "gpu" in navigator;

  async function ensureEngineReady(targetModelId = modelId) {
    if (engineRef.current && engineId === targetModelId && engineStatus === "ready") return engineRef.current;
    setEngineId(targetModelId);
    setEngineStatus("loading");
    setEngineError(null);
    setEngineProgress({ text: "Starting…", progress: 0 });
    const eng = new WebLLMEngine(targetModelId);
    try {
      await eng.init((p) => setEngineProgress(p));
      engineRef.current = eng;
      setEngineStatus("ready");
      return eng;
    } catch (err) {
      console.warn("Engine init failed:", err);
      setEngineError(String(err.message || err));
      setEngineStatus("error");
      throw err;
    }
  }

  // Start a scenario chat
  function startScenario(scenario) {
    const systemPrompt = cv.buildScenarioSystem(scenario, lang.name, level);
    openSession({
      mode: "scenario",
      scenarioId: scenario.id,
      title: scenario.title,
      nativeTitle: scenario.nativeTitle,
      character: scenario.character,
      setting: scenario.setting,
      goal: scenario.goal,
      systemPrompt,
      opener: scenario.opener,
      starters: scenario.starters,
    });
  }
  // Start a free chat
  function startFreeChat(mode) {
    const config = cv.freeModes.find((m) => m.id === mode);
    if (!config) return;
    const systemPrompt = cv.buildFreeSystem(mode, lang.name, level);
    openSession({
      mode,
      scenarioId: null,
      title: config.title,
      nativeTitle: config.nativeTitle,
      character: mode === "crosstalk" ? "A bilingual conversation partner" : "A friendly conversation partner",
      setting: mode === "crosstalk"
        ? "You write in English; the model replies in " + lang.name + " with a gloss."
        : "An open-ended chat in " + lang.name + ", paced for " + level + ".",
      goal: null,
      systemPrompt,
      opener: config.opener[langId] || "",
      starters: config.starters[langId] || [],
    });
  }

  async function openSession(s) {
    setSession(s);
    // Kick off engine load (non-blocking — chat UI handles the loading state)
    ensureEngineReady().catch(() => {});
  }

  function markCompleted(scenarioId, val = true) {
    setCompleted((m) => {
      const next = { ...m, [scenarioId]: val };
      saveCompleted(next);
      return next;
    });
  }

  function switchModel(targetModelId) {
    if (!WEBLLM_MODELS.some((m) => m.id === targetModelId)) return;
    setModelId(targetModelId);
    saveModelPref(targetModelId);
    if (engineRef.current?.modelId !== targetModelId) {
      engineRef.current = null;
      setEngineId(null);
      setEngineStatus("idle");
      setEngineProgress({ text: "", progress: 0 });
      setEngineError(null);
    }
  }

  function navigate(navId) {
    if (navId === "lessons") window.location.href = "Glossa.html";
    else if (navId === "practice") window.location.href = "Practice.html";
    else if (navId === "stories") window.location.href = "Stories.html";
  }

  const scenarios = cv.scenarios[langId]?.[level] || [];

  return (
    <div className="g-app">
      <Navbar
        courses={window.GLOSSA_COURSES}
        activeLangId={langId}
        onPickLang={setLangId}
        activeNav="conversation"
        onPickNav={navigate}
      />

      <main className="g-main">
        <section className="cv-head">
          <div>
            <h1 className="g-page-title">
              Conversation
              <span className="g-page-title-native">in {lang.name}</span>
            </h1>
            <p className="g-page-sub">
              Practice with a roleplay partner. Pick a scenario, or just chat. Everything runs in your browser.
            </p>
          </div>
          <EngineWidget
            modelId={modelId}
            loadedModelId={engineId}
            status={engineStatus}
            progress={engineProgress}
            error={engineError}
            webGPUSupported={webGPUSupported}
            webllmModuleReady={webllmModuleReady}
            onPick={switchModel}
          />
        </section>

        {/* Desktop-first notice */}
        <aside className="cv-notice" role="note">
          <span className="cv-notice-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M12 3l10 18H2L12 3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M12 10v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="12" cy="18" r="1.1" fill="currentColor" />
            </svg>
          </span>
          <div className="cv-notice-body">
            <div className="cv-notice-title">Best on a desktop or laptop, on Wi-Fi.</div>
            <p className="cv-notice-text">
              The conversation partner runs as an AI model inside your browser — no servers in the loop. The model file is about <b>1.1&nbsp;GB</b> the first time, then cached for future chats. Download it on <b>Wi-Fi</b> rather than mobile data, and expect slow replies on phones and tablets.
            </p>
          </div>
        </aside>

        {/* Level selector */}
        <section>
          <div className="cv-levels" role="tablist" aria-label="Levels">
            {["A1","A2","B1","B2","C1","C2"].map((lv) => {
              const exists = levels.includes(lv);
              const active = lv === level;
              const list = exists ? (cv.scenarios[langId]?.[lv] || []) : [];
              const total = list.length;
              return (
                <button
                  key={lv}
                  role="tab"
                  aria-selected={active}
                  disabled={!exists}
                  className={"cv-level" + (active ? " is-active" : "") + (exists ? "" : " is-empty")}
                  onClick={() => exists && setLevel(lv)}
                >
                  <span className="cv-level-code">{lv}</span>
                  <span className="cv-level-name">{LEVEL_NAMES[lv]}</span>
                  {exists ? (
                    <span className="cv-level-count">{total} {total === 1 ? "scenario" : "scenarios"}</span>
                  ) : (
                    <span className="cv-level-soon">Coming soon</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Scenarios */}
        <section className="cv-section">
          <div className="cv-section-head">
            <div>
              <h2 className="cv-section-title">Scenarios in {level}</h2>
              <p className="cv-section-sub">
                {scenarios.length} roleplay {scenarios.length === 1 ? "scenario" : "scenarios"} — pick one and the partner will start in character.
              </p>
            </div>
          </div>
          <div className="cv-grid">
            {scenarios.length === 0 && (
              <div style={{
                gridColumn: "1 / -1",
                padding: 40, textAlign: "center",
                color: "var(--ink-3)",
                background: "var(--paper)",
                border: "1px dashed var(--rule)",
                borderRadius: 14,
              }}>
                More scenarios for {level} coming soon. Try a free chat below in the meantime.
              </div>
            )}
            {scenarios.map((s) => (
              <ScenarioCard
                key={s.id}
                scenario={s}
                completed={!!completed[s.id]}
                onPick={() => startScenario(s)}
              />
            ))}
          </div>
        </section>

        {/* Free chat */}
        <section className="cv-section">
          <div className="cv-section-head">
            <div>
              <h2 className="cv-section-title">Free chat</h2>
              <p className="cv-section-sub">No scenario, no goal — just keep talking. Two flavours, depending on how much English you want in the loop.</p>
            </div>
          </div>
          <div className="cv-free-grid">
            {cv.freeModes.map((m) => (
              <button key={m.id} className="cv-free" onClick={() => startFreeChat(m.id)}>
                <span className="cv-free-glyph" aria-hidden="true">{m.glyph}</span>
                <span className="cv-free-eyebrow">
                  {m.id === "crosstalk" ? "EN → " + lang.name : lang.name + " ↔ " + lang.name}
                </span>
                <span className="cv-free-title">{m.title}</span>
                <span className="cv-free-blurb">{m.blurb}</span>
                <span className="cv-free-foot">
                  <span>Open chat</span>
                  <svg viewBox="0 0 16 16" width="12" height="12">
                    <path d="M5 3l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
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

      {session && (
        <ChatView
          session={session}
          langName={lang.name}
          level={level}
          engineRef={engineRef}
          engineId={engineId || modelId}
          modelId={modelId}
          engineStatus={engineStatus}
          engineProgress={engineProgress}
          engineError={engineError}
          ensureEngineReady={ensureEngineReady}
          onClose={() => setSession(null)}
          onComplete={() => session.scenarioId && markCompleted(session.scenarioId, true)}
          completed={session.scenarioId ? !!completed[session.scenarioId] : false}
        />
      )}
    </div>
  );
}

// ─── Engine status widget ────────────────────────────────────────────────
function EngineWidget({ modelId, loadedModelId, status, progress, error, webGPUSupported, webllmModuleReady, onPick }) {
  const [menuOpen, setMenuOpen] = useC(false);
  const ref = useCR(null);
  useCE(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const meta = WEBLLM_MODELS.find((m) => m.id === modelId) || WEBLLM_MODELS[0];
  const isLoadedActive = loadedModelId === modelId && status === "ready";
  const sub = (() => {
    if (status === "loading" && loadedModelId === modelId) {
      const pct = Math.round((progress.progress || 0) * 100);
      return progress.text || `Downloading… ${pct}%`;
    }
    if (status === "error" && loadedModelId === modelId) return "Unavailable in this browser";
    if (isLoadedActive) return "Ready · runs in your browser";
    // Otherwise idle for this model — it will load on the next chat
    return `Loads on first chat (~${meta.sizeMB} MB cached)`;
  })();
  const cls = "cv-engine"
    + (status === "loading" && loadedModelId === modelId ? " is-loading" : "")
    + (isLoadedActive ? " is-ready" : "")
    + (status === "error" && loadedModelId === modelId ? " is-error" : "");
  const pct = status === "loading" && loadedModelId === modelId
    ? Math.round((progress.progress || 0) * 100) : 0;

  return (
    <div className={cls} ref={ref} style={{ position: "relative" }}>
      <span className="cv-engine-dot" aria-hidden="true" />
      <span className="cv-engine-text">
        <span className="cv-engine-eyebrow">Model</span>
        <span className="cv-engine-label">{meta.label}</span>
        <span className="cv-engine-sub">{sub}</span>
        {status === "loading" && loadedModelId === modelId && (
          <span className="cv-engine-progress" aria-hidden="true">
            <span className="cv-engine-progress-fill" style={{ width: pct + "%" }} />
          </span>
        )}
      </span>
      <button className="cv-engine-btn" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}>
        Switch
      </button>
      {menuOpen && (
        <ul style={{
          position: "absolute", top: "100%", right: 0, marginTop: 8,
          background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: 12,
          padding: 6, listStyle: "none", boxShadow: "var(--shadow-pop)",
          width: 320, zIndex: 30,
        }}>
          <li style={{
            padding: "8px 12px 6px",
            fontSize: 10, color: "var(--ink-4)",
            letterSpacing: 0.12, textTransform: "uppercase", fontWeight: 700,
          }}>
            Local models
          </li>
          {WEBLLM_MODELS.map((m) => {
            const disabled = !webGPUSupported || !webllmModuleReady;
            return (
              <EngineOption
                key={m.id}
                id={m.id}
                current={modelId}
                disabled={disabled}
                title={m.label}
                desc={
                  !webllmModuleReady ? "WebLLM module did not load — refresh the page" :
                  !webGPUSupported ? "Browser does not support WebGPU" :
                  `~${m.sizeMB} MB · ${m.note}`
                }
                loaded={loadedModelId === m.id && status === "ready"}
                loading={loadedModelId === m.id && status === "loading"}
                onPick={() => { onPick(m.id); setMenuOpen(false); }}
              />
            );
          })}
          <li style={{ borderTop: "1px solid var(--rule)", margin: "6px 4px" }} />
          <li style={{
            padding: "8px 12px 10px",
            fontSize: 11.5, color: "var(--ink-4)",
            letterSpacing: 0.04, lineHeight: 1.5,
          }}>
            Each model is downloaded once and cached in your browser. Switching back later is instant.
          </li>
        </ul>
      )}
    </div>
  );
}
function EngineOption({ id, current, disabled, title, desc, loaded, loading, onPick }) {
  const active = id === current;
  return (
    <li>
      <button
        disabled={disabled}
        onClick={onPick}
        style={{
          width: "100%", display: "grid", gridTemplateColumns: "1fr auto",
          gap: 10, padding: "10px 12px",
          border: 0, background: active ? "var(--accent-ghost)" : "transparent",
          borderRadius: 8, textAlign: "left",
          color: active ? "var(--accent-2)" : "var(--ink)",
          opacity: disabled ? 0.4 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <span style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
            <span>{title}</span>
            {loaded && (
              <span style={{
                fontSize: 9.5, letterSpacing: 0.08, textTransform: "uppercase",
                color: "var(--done)", background: "var(--done-soft)",
                padding: "2px 6px", borderRadius: 4, fontWeight: 700,
              }}>Loaded</span>
            )}
            {loading && (
              <span style={{
                fontSize: 9.5, letterSpacing: 0.08, textTransform: "uppercase",
                color: "var(--accent-2)", background: "var(--accent-ghost)",
                padding: "2px 6px", borderRadius: 4, fontWeight: 700,
              }}>Loading…</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
        </span>
        {active && (
          <span style={{ color: "var(--accent)", alignSelf: "center" }}>
            <svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        )}
      </button>
    </li>
  );
}

// ─── Scenario card ───────────────────────────────────────────────────────
function ScenarioCard({ scenario, completed, onPick }) {
  return (
    <button className="cv-card" onClick={onPick}>
      <span className="cv-card-glyph" aria-hidden="true">{scenario.glyph}</span>
      <span className="cv-card-body">
        <span className="cv-card-native">{scenario.nativeTitle}</span>
        <span className="cv-card-title">{scenario.title}</span>
        <span className="cv-card-blurb">{scenario.blurb}</span>
        {completed && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 11, color: "var(--done)", fontWeight: 700,
            letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 4,
          }}>
            <svg viewBox="0 0 16 16" width="11" height="11">
              <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Completed
          </span>
        )}
      </span>
    </button>
  );
}

// ─── Chat view ───────────────────────────────────────────────────────────
const SOFT_END_NUDGE_AT = 10; // user turns before model gets a "wrap up" nudge

function ChatView({ session, langName, level, engineRef, engineId, modelId, engineStatus, engineProgress, engineError, ensureEngineReady, onClose, onComplete, completed }) {
  const [messages, setMessages] = useC([{ role: "assistant", content: session.opener || "" }]);
  const [input, setInput] = useC("");
  const [isGenerating, setIsGenerating] = useC(false);
  const [concluded, setConcluded] = useC(false);
  const [sendError, setSendError] = useC(null);
  const [showPrompt, setShowPrompt] = useC(false);
  const abortRef = useCR(null);
  const bodyRef = useCR(null);
  const inputRef = useCR(null);

  // Auto-scroll to bottom on new content
  useCE(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isGenerating]);

  // Focus input on open
  useCE(() => { inputRef.current?.focus(); }, []);

  // ESC to close (with confirm if mid-conversation)
  useCE(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        if (messages.length > 1 && !concluded) {
          if (!confirm("End this conversation?")) return;
        }
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  // Clean up: abort any in-flight stream when closing
  useCE(() => () => { abortRef.current?.abort(); }, []);

  // Build the assistant prompt (system + history). Inject soft-end nudge for scenarios.
  function buildPrompt(history) {
    const out = [{ role: "system", content: session.systemPrompt }];
    const userTurnCount = history.filter((m) => m.role === "user").length;
    if (session.mode === "scenario" && userTurnCount >= SOFT_END_NUDGE_AT && session.goal) {
      out.push({
        role: "system",
        content: "Internal note: the conversation has gone on long enough. If the scene's goal has been substantially met, wrap up naturally in 1-2 in-character lines and finish with [END] on its own new line.",
      });
    }
    for (const m of history) out.push({ role: m.role, content: m.content });
    return out;
  }

  async function handleSend(text) {
    const trimmed = (text ?? input).trim();
    if (!trimmed || isGenerating || concluded) return;
    setSendError(null);

    // Ensure engine is ready
    let eng = engineRef.current;
    if (!eng || engineStatus !== "ready") {
      try {
        eng = await ensureEngineReady();
      } catch (err) {
        setSendError(String(err.message || err));
        return;
      }
    }

    const history = [...messages, { role: "user", content: trimmed }];
    setMessages(history);
    setInput("");

    // Stream into a placeholder assistant message
    const placeholderIdx = history.length;
    setMessages([...history, { role: "assistant", content: "" }]);
    setIsGenerating(true);

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      let accumulated = "";
      const promptMessages = buildPrompt(history);
      for await (const delta of eng.streamReply(promptMessages, ac.signal)) {
        if (ac.signal.aborted) break;
        accumulated += delta;
        // Strip [END] markers from display as we stream
        const display = accumulated.replace(/\[END(?:_SCENARIO)?\]/gi, "").trimEnd();
        setMessages((prev) => {
          const copy = [...prev];
          copy[placeholderIdx] = { role: "assistant", content: display };
          return copy;
        });
      }
      const hadEnd = /\[END(?:_SCENARIO)?\]/i.test(accumulated);
      if (hadEnd && session.mode === "scenario") {
        // Mark completed and show the end card after a beat
        onComplete?.();
        setTimeout(() => setConcluded(true), 700);
      }
    } catch (err) {
      console.warn("Stream error:", err);
      setSendError(String(err.message || err));
      // Remove empty placeholder
      setMessages((prev) => {
        const copy = [...prev];
        if (copy[placeholderIdx] && !copy[placeholderIdx].content) copy.pop();
        return copy;
      });
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleEndClick() {
    if (isGenerating) abortRef.current?.abort();
    if (session.mode === "scenario" && !completed) onComplete?.();
    setConcluded(true);
  }

  // Auto-grow textarea
  function onInputChange(e) {
    setInput(e.target.value);
    const t = e.target;
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight, 160) + "px";
  }

  // Render the body of a single message bubble. In cross-talk mode the bot's
  // reply is formatted as two blocks separated by a line containing only
  // "---": target-language on top, English translation on the bottom. The
  // parser is tolerant of small variations (extra whitespace, missing
  // separator while the model is still streaming, etc.).
  function renderBubbleBody(msg) {
    if (msg.role === "assistant" && session.mode === "crosstalk") {
      const text = msg.content;
      // Look for a line that consists entirely of dashes (---, ----, etc.)
      // OR a fallback: a trailing parenthetical block on its own line.
      const sepMatch = text.match(/\n[ \t]*-{3,}[ \t]*\n/);
      if (sepMatch) {
        const idx = sepMatch.index;
        const target = text.slice(0, idx).trim();
        const english = text.slice(idx + sepMatch[0].length).trim();
        if (target && english) {
          return (
            <>
              <span>{target}</span>
              <span className="cv-msg-gloss">{english}</span>
            </>
          );
        }
      }
      // Fallback: model used (…) on its own trailing line
      const parenMatch = text.match(/^([\s\S]*?)\n+(\([\s\S]+\))\s*$/);
      if (parenMatch) {
        return (
          <>
            <span>{parenMatch[1].trim()}</span>
            <span className="cv-msg-gloss">{parenMatch[2]}</span>
          </>
        );
      }
    }
    return msg.content;
  }

  const visibleMessages = messages.filter((m, i) =>
    !(m.role === "assistant" && m.content === "" && !isGenerating)
  );
  const lastMsg = visibleMessages[visibleMessages.length - 1];
  const showTypingDots = isGenerating && lastMsg?.role === "assistant" && !lastMsg.content;

  return (
    <div className="cv-chat" role="dialog" aria-modal="true">
      <header className="cv-chat-head">
        <button className="cv-exit" onClick={onClose} aria-label="Back">
          <svg viewBox="0 0 20 20" width="16" height="16">
            <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="cv-chat-title">
          <span className="cv-chat-eyebrow">
            {langName} · {level} · {session.mode === "scenario" ? "Roleplay" : session.mode === "crosstalk" ? "Cross-talk" : "Free chat"}
          </span>
          <span className="cv-chat-h">{session.nativeTitle}</span>
        </div>
        <button className="cv-end-btn" onClick={handleEndClick} disabled={concluded}>
          <svg viewBox="0 0 16 16" width="13" height="13"><rect x="4" y="4" width="8" height="8" rx="1" fill="currentColor" /></svg>
          <span>End</span>
        </button>
      </header>

      <div className="cv-chat-body" ref={bodyRef}>
        <div className="cv-chat-inner">
          {/* Setting card */}
          <div className="cv-setting">
            <span className="cv-setting-eyebrow">
              {session.mode === "scenario" ? "Roleplay setup" : "Chat setup"}
            </span>
            <div className="cv-setting-title">{session.title}</div>
            <div className="cv-setting-sub">
              <b style={{ color: "var(--ink-2)" }}>You're talking to:</b> {session.character}.<br />
              <b style={{ color: "var(--ink-2)" }}>Where:</b> {session.setting}
            </div>
            {session.goal && (
              <div className="cv-setting-goal">
                <b>Your task —</b> {session.goal}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
              <button
                onClick={() => setShowPrompt((v) => !v)}
                style={{
                  padding: "6px 10px",
                  border: "1px solid var(--rule)",
                  background: "transparent",
                  borderRadius: 8,
                  fontSize: 12, fontWeight: 600,
                  color: "var(--ink-3)",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: 0.02,
                }}
                aria-expanded={showPrompt}
              >
                {showPrompt ? "Hide system prompt" : "View system prompt"}
              </button>
              <span style={{
                fontSize: 11, color: "var(--ink-4)",
                fontFamily: "'JetBrains Mono', monospace",
                alignSelf: "center", letterSpacing: 0.04,
              }}>
                {session.systemPrompt.split(/\s+/).length} words · sent on every turn
              </span>
            </div>
            {showPrompt && (
              <pre style={{
                margin: "8px 0 0",
                padding: "14px 16px",
                background: "var(--cream-2)",
                border: "1px solid var(--rule)",
                borderRadius: 10,
                fontSize: 12,
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                lineHeight: 1.55,
                color: "var(--ink-2)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxHeight: 320,
                overflowY: "auto",
              }}>{session.systemPrompt}{session.mode === "scenario" ? "\n\n[After " + SOFT_END_NUDGE_AT + " user turns, this is appended as an additional system message:]\n\nInternal note: the conversation has gone on long enough. If the scene's goal has been substantially met, wrap up naturally in 1-2 in-character lines and finish with [END] on its own new line." : ""}</pre>
            )}
          </div>

          {/* Engine status banner during initial load */}
          {(engineStatus === "loading" || (engineStatus === "idle" && !engineRef.current)) && (
            <div className="cv-msg is-system">
              <div className="cv-msg-bubble">
                {`Warming up ${(WEBLLM_MODELS.find((m) => m.id === (engineId || modelId)) || {}).short || "the local model"}… ${Math.round((engineProgress?.progress || 0) * 100)}% — ${engineProgress?.text || ""}`}
              </div>
            </div>
          )}
          {engineStatus === "error" && (
            <div className="cv-msg is-system">
              <div className="cv-msg-bubble">
                Couldn't reach the model. {engineError || ""}
              </div>
            </div>
          )}

          {/* Messages */}
          {visibleMessages.map((m, i) => (
            <div key={i} className={"cv-msg " + (m.role === "user" ? "is-user" : "is-bot")}>
              <div className="cv-msg-bubble">{renderBubbleBody(m)}</div>
            </div>
          ))}
          {showTypingDots && (
            <div className="cv-msg is-bot">
              <div className="cv-msg-bubble">
                <span className="cv-typing"><span /><span /><span /></span>
              </div>
            </div>
          )}

          {sendError && (
            <div className="cv-msg is-system">
              <div className="cv-msg-bubble">Couldn't generate a reply: {sendError}</div>
            </div>
          )}

          {/* End-of-scenario card */}
          {concluded && (
            <div className="cv-end-card">
              <span className="cv-end-card-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22"><path d="M5 13l4 4 10-10" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <div className="cv-end-card-title">
                {session.mode === "scenario" ? "Scene wrapped." : "Conversation ended."}
              </div>
              <div className="cv-end-card-sub">
                {session.mode === "scenario"
                  ? "Nicely done. You can replay this scenario any time, or pick another."
                  : "Whenever you're ready, jump into another scenario or start a fresh chat."}
              </div>
              <div className="cv-end-card-actions">
                <button className="cv-end-card-btn is-primary" onClick={onClose}>Back</button>
                <button
                  className="cv-end-card-btn"
                  onClick={() => {
                    // Restart: reset messages, unset concluded
                    setMessages([{ role: "assistant", content: session.opener || "" }]);
                    setConcluded(false);
                    setSendError(null);
                  }}
                >
                  Start over
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {!concluded && (
        <div className="cv-chat-foot">
          <div className="cv-chat-foot-inner">
            {session.starters && session.starters.length > 0 && messages.filter(m => m.role === "user").length === 0 && (
              <div className="cv-starters">
                {session.starters.map((s, i) => (
                  <button key={i} className="cv-starter" onClick={() => handleSend(s)} disabled={isGenerating}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="cv-input-row">
              <textarea
                ref={inputRef}
                className="cv-input"
                value={input}
                onChange={onInputChange}
                onKeyDown={handleKey}
                placeholder={
                  session.mode === "crosstalk"
                    ? "Type in English…"
                    : `Type in ${langName}…`
                }
                rows={1}
                disabled={concluded}
              />
              <button
                className="cv-send"
                onClick={() => handleSend()}
                disabled={!input.trim() || isGenerating || concluded}
                aria-label="Send"
              >
                {isGenerating ? (
                  <svg viewBox="0 0 16 16" width="14" height="14"><rect x="4" y="4" width="8" height="8" rx="1" fill="currentColor" /></svg>
                ) : (
                  <svg viewBox="0 0 16 16" width="16" height="16">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
            <div className="cv-foot-meta">
              <span>
                {"Local · " + ((WEBLLM_MODELS.find((m) => m.id === (engineId || modelId)) || {}).label || (engineId || modelId))}
                {engineStatus === "ready" && <> <span className="dot" /> Ready</>}
                {engineStatus === "loading" && <> <span className="dot" /> Loading…</>}
              </span>
              <span>Press Enter to send · Shift+Enter for newline</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ConversationApp />);
