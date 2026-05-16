import { useState, useEffect, useRef, useCallback } from 'react';
import { SCENARIOS, FREE_MODES, buildScenarioSystem, buildFreeSystem, type Scenario, type FreeMode, type CefrLevel } from '../data/conversation';
import { COURSES } from '../data/courses';

interface ConversationPageProps {
  langId: string;
}

const LEVEL_NAMES: Record<string, string> = {
  A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate',
  B2: 'Upper-int.', C1: 'Advanced', C2: 'Mastery',
};

const WEBLLM_MODELS = [
  {
    id: 'Qwen2.5-1.5B-Instruct-q4f32_1-MLC',
    label: 'Qwen 2.5 — 1.5B Instruct',
    short: 'Qwen 2.5 — 1.5B',
    sizeMB: 1100,
    note: 'Runs entirely in your browser. Cached after first download.',
  },
];
const DEFAULT_MODEL_ID = WEBLLM_MODELS[0].id;
const MODEL_PREF_KEY  = 'glossa-conv-model-v1';
const COMPLETED_KEY   = 'glossa-conv-completed-v1';
const SOFT_END_NUDGE_AT = 10;

type EngineStatus = 'idle' | 'loading' | 'ready' | 'error';

interface EngineProgress { text: string; progress: number; }

interface ChatMessage { role: 'user' | 'assistant' | 'system'; content: string; }

interface SessionConfig {
  mode: string;
  scenarioId: string | null;
  title: string;
  nativeTitle: string;
  character: string;
  setting: string;
  goal: string | null;
  systemPrompt: string;
  opener: string;
  starters: string[];
}

function loadModelPref(): string {
  try {
    const v = localStorage.getItem(MODEL_PREF_KEY);
    if (v && WEBLLM_MODELS.some(m => m.id === v)) return v;
  } catch {}
  return DEFAULT_MODEL_ID;
}
function saveModelPref(v: string) { try { localStorage.setItem(MODEL_PREF_KEY, v); } catch {} }
function loadCompleted(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(COMPLETED_KEY) ?? 'null') || {}; } catch { return {}; }
}
function saveCompleted(m: Record<string, boolean>) {
  try { localStorage.setItem(COMPLETED_KEY, JSON.stringify(m)); } catch {}
}

// ── Engine wrapper ──────────────────────────────────────────────────────────
class WebLLMEngine {
  id = 'webllm';
  modelId: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  engine: any = null;

  constructor(modelId: string) {
    this.modelId = modelId || DEFAULT_MODEL_ID;
    const meta = WEBLLM_MODELS.find(m => m.id === this.modelId);
    this.label = meta ? meta.label : this.modelId;
  }

  async init(onProgress: (p: EngineProgress) => void) {
    const WebLLM = await import('@mlc-ai/web-llm');
    if (!('gpu' in navigator)) throw new Error('WebGPU not supported in this browser');
    this.engine = await WebLLM.CreateMLCEngine(this.modelId, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initProgressCallback: (r: any) => onProgress({ text: r.text || 'Loading model…', progress: r.progress ?? 0 }),
    });
  }

  async *streamReply(messages: ChatMessage[], signal?: AbortSignal): AsyncGenerator<string> {
    const stream = await this.engine.chat.completions.create({
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 280,
    });
    for await (const chunk of stream) {
      if (signal?.aborted) break;
      yield chunk.choices?.[0]?.delta?.content || '';
    }
  }
}

// ── Chat view ───────────────────────────────────────────────────────────────
function ChatView({ session, langName, level, engineRef, engineId, modelId, engineStatus, engineProgress, engineError, ensureEngineReady, onClose, onComplete, completed }: {
  session: SessionConfig; langName: string; level: string;
  engineRef: React.MutableRefObject<WebLLMEngine | null>;
  engineId: string | null; modelId: string;
  engineStatus: EngineStatus; engineProgress: EngineProgress;
  engineError: string | null;
  ensureEngineReady: (id?: string) => Promise<WebLLMEngine>;
  onClose: () => void; onComplete: () => void; completed: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: session.opener }]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [concluded, setConcluded] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bodyRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isGenerating]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (messages.length > 1 && !concluded) {
          if (!confirm('End this conversation?')) return;
        }
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  function buildPrompt(history: ChatMessage[]): ChatMessage[] {
    const out: ChatMessage[] = [{ role: 'system', content: session.systemPrompt }];
    const userTurns = history.filter(m => m.role === 'user').length;
    if (session.mode === 'scenario' && userTurns >= SOFT_END_NUDGE_AT && session.goal) {
      out.push({ role: 'system', content: "Internal note: the conversation has gone on long enough. If the scene's goal has been substantially met, wrap up naturally in 1-2 in-character lines and finish with [END] on its own new line." });
    }
    for (const m of history) out.push(m);
    return out;
  }

  async function handleSend(text?: string) {
    const trimmed = (text ?? input).trim();
    if (!trimmed || isGenerating || concluded) return;
    setSendError(null);

    let eng = engineRef.current;
    if (!eng || engineStatus !== 'ready') {
      try { eng = await ensureEngineReady(); }
      catch (err) { setSendError(String((err as Error).message || err)); return; }
    }

    const history: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(history);
    setInput('');

    const placeholderIdx = history.length;
    setMessages([...history, { role: 'assistant', content: '' }]);
    setIsGenerating(true);

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      let accumulated = '';
      const promptMessages = buildPrompt(history);
      for await (const delta of eng!.streamReply(promptMessages, ac.signal)) {
        if (ac.signal.aborted) break;
        accumulated += delta;
        const display = accumulated.replace(/\[END(?:_SCENARIO)?\]/gi, '').trimEnd();
        setMessages(prev => {
          const copy = [...prev];
          copy[placeholderIdx] = { role: 'assistant', content: display };
          return copy;
        });
      }
      if (/\[END(?:_SCENARIO)?\]/i.test(accumulated) && session.mode === 'scenario') {
        onComplete();
        setTimeout(() => setConcluded(true), 700);
      }
    } catch (err) {
      setSendError(String((err as Error).message || err));
      setMessages(prev => {
        const copy = [...prev];
        if (copy[placeholderIdx] && !copy[placeholderIdx].content) copy.pop();
        return copy;
      });
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function handleEndClick() {
    if (isGenerating) abortRef.current?.abort();
    if (session.mode === 'scenario' && !completed) onComplete();
    setConcluded(true);
  }

  function onInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const t = e.target;
    t.style.height = 'auto';
    t.style.height = Math.min(t.scrollHeight, 160) + 'px';
  }

  function renderBubbleBody(msg: ChatMessage) {
    if (msg.role === 'assistant' && session.mode === 'crosstalk') {
      const sepMatch = msg.content.match(/\n[ \t]*-{3,}[ \t]*\n/);
      if (sepMatch) {
        const idx = sepMatch.index!;
        const target = msg.content.slice(0, idx).trim();
        const english = msg.content.slice(idx + sepMatch[0].length).trim();
        if (target && english) {
          return <><span>{target}</span><span className="cv-msg-gloss">{english}</span></>;
        }
      }
      const parenMatch = msg.content.match(/^([\s\S]*?)\n+(\([\s\S]+\))\s*$/);
      if (parenMatch) {
        return <><span>{parenMatch[1].trim()}</span><span className="cv-msg-gloss">{parenMatch[2]}</span></>;
      }
    }
    return msg.content;
  }

  const visibleMessages = messages.filter(m => !(m.role === 'assistant' && m.content === '' && !isGenerating));
  const lastMsg = visibleMessages[visibleMessages.length - 1];
  const showTypingDots = isGenerating && lastMsg?.role === 'assistant' && !lastMsg.content;
  const loadingModelMeta = WEBLLM_MODELS.find(m => m.id === (engineId || modelId));

  return (
    <div className="cv-chat" role="dialog" aria-modal="true">
      <header className="cv-chat-head">
        <button className="cv-exit" onClick={onClose} aria-label="Back">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
            <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="cv-chat-title">
          <span className="cv-chat-eyebrow">
            {langName} · {level} · {session.mode === 'scenario' ? 'Roleplay' : session.mode === 'crosstalk' ? 'Cross-talk' : 'Free chat'}
          </span>
          <span className="cv-chat-h">{session.nativeTitle}</span>
        </div>
        <button className="cv-end-btn" onClick={handleEndClick} disabled={concluded}>
          <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><rect x="4" y="4" width="8" height="8" rx="1" fill="currentColor"/></svg>
          <span>End</span>
        </button>
      </header>

      <div className="cv-chat-body" ref={bodyRef}>
        <div className="cv-chat-inner">
          <div className="cv-setting">
            <span className="cv-setting-eyebrow">{session.mode === 'scenario' ? 'Roleplay setup' : 'Chat setup'}</span>
            <div className="cv-setting-title">{session.title}</div>
            <div className="cv-setting-sub">
              <b>You're talking to:</b> {session.character}.<br/>
              <b>Where:</b> {session.setting}
            </div>
            {session.goal && <div className="cv-setting-goal"><b>Your task —</b> {session.goal}</div>}
            <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowPrompt(v => !v)}
                style={{ padding: '6px 10px', border: '1px solid var(--rule)', background: 'transparent', borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.02 }}
                aria-expanded={showPrompt}
              >
                {showPrompt ? 'Hide system prompt' : 'View system prompt'}
              </button>
              <span style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: "'JetBrains Mono', monospace", alignSelf: 'center', letterSpacing: 0.04 }}>
                {session.systemPrompt.split(/\s+/).length} words · sent on every turn
              </span>
            </div>
            {showPrompt && (
              <pre style={{ margin: '8px 0 0', padding: '14px 16px', background: 'var(--cream-2)', border: '1px solid var(--rule)', borderRadius: 10, fontSize: 12, fontFamily: "'JetBrains Mono', ui-monospace, monospace", lineHeight: 1.55, color: 'var(--ink-2)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 320, overflowY: 'auto' }}>
                {session.systemPrompt}
              </pre>
            )}
          </div>

          {(engineStatus === 'loading' || (engineStatus === 'idle' && !engineRef.current)) && (
            <div className="cv-msg is-system">
              <div className="cv-msg-bubble">
                {`Warming up ${loadingModelMeta?.short ?? 'the local model'}… ${Math.round((engineProgress.progress || 0) * 100)}% — ${engineProgress.text}`}
              </div>
            </div>
          )}
          {engineStatus === 'error' && (
            <div className="cv-msg is-system">
              <div className="cv-msg-bubble">Couldn't reach the model. {engineError}</div>
            </div>
          )}

          {visibleMessages.map((m, i) => (
            <div key={i} className={`cv-msg ${m.role === 'user' ? 'is-user' : 'is-bot'}`}>
              <div className="cv-msg-bubble">{renderBubbleBody(m)}</div>
            </div>
          ))}
          {showTypingDots && (
            <div className="cv-msg is-bot">
              <div className="cv-msg-bubble"><span className="cv-typing"><span/><span/><span/></span></div>
            </div>
          )}
          {sendError && (
            <div className="cv-msg is-system">
              <div className="cv-msg-bubble">Couldn't generate a reply: {sendError}</div>
            </div>
          )}

          {concluded && (
            <div className="cv-end-card">
              <span className="cv-end-card-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                  <path d="M5 13l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="cv-end-card-title">{session.mode === 'scenario' ? 'Scene wrapped.' : 'Conversation ended.'}</div>
              <div className="cv-end-card-sub">
                {session.mode === 'scenario'
                  ? 'Nicely done. You can replay this scenario any time, or pick another.'
                  : "Whenever you're ready, jump into another scenario or start a fresh chat."}
              </div>
              <div className="cv-end-card-actions">
                <button className="cv-end-card-btn is-primary" onClick={onClose}>Back</button>
                <button className="cv-end-card-btn" onClick={() => { setMessages([{ role: 'assistant', content: session.opener }]); setConcluded(false); setSendError(null); }}>
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
            {session.starters.length > 0 && messages.filter(m => m.role === 'user').length === 0 && (
              <div className="cv-starters">
                {session.starters.map((s, i) => (
                  <button key={i} className="cv-starter" onClick={() => handleSend(s)} disabled={isGenerating}>{s}</button>
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
                placeholder={session.mode === 'crosstalk' ? 'Type in English…' : `Type in ${langName}…`}
                rows={1}
                disabled={concluded}
              />
              <button
                className="cv-send"
                onClick={() => handleSend()}
                disabled={!input.trim() || isGenerating || concluded}
                aria-label="Send"
              >
                {isGenerating
                  ? <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="4" y="4" width="8" height="8" rx="1" fill="currentColor"/></svg>
                  : <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                }
              </button>
            </div>
            <div className="cv-foot-meta">
              <span>
                {'Local · ' + (WEBLLM_MODELS.find(m => m.id === (engineId || modelId))?.label ?? (engineId || modelId))}
                {engineStatus === 'ready' && <> <span className="dot"/> Ready</>}
                {engineStatus === 'loading' && <> <span className="dot"/> Loading…</>}
              </span>
              <span>Press Enter to send · Shift+Enter for newline</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Engine widget ────────────────────────────────────────────────────────────
function EngineWidget({ modelId, loadedModelId, status, progress, webGPUSupported, onPick }: {
  modelId: string; loadedModelId: string | null; status: EngineStatus;
  progress: EngineProgress; error?: string | null; webGPUSupported: boolean;
  onPick: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const meta = WEBLLM_MODELS.find(m => m.id === modelId) ?? WEBLLM_MODELS[0];
  const isLoadedActive = loadedModelId === modelId && status === 'ready';
  const sub = (() => {
    if (status === 'loading' && loadedModelId === modelId) {
      const pct = Math.round((progress.progress || 0) * 100);
      return progress.text || `Downloading… ${pct}%`;
    }
    if (status === 'error' && loadedModelId === modelId) return 'Unavailable in this browser';
    if (isLoadedActive) return 'Ready · runs in your browser';
    return `Loads on first chat (~${meta.sizeMB} MB cached)`;
  })();
  const cls = `cv-engine${status === 'loading' && loadedModelId === modelId ? ' is-loading' : ''}${isLoadedActive ? ' is-ready' : ''}${status === 'error' && loadedModelId === modelId ? ' is-error' : ''}`;
  const pct = status === 'loading' && loadedModelId === modelId ? Math.round((progress.progress || 0) * 100) : 0;

  return (
    <div className={cls} ref={ref} style={{ position: 'relative' }}>
      <span className="cv-engine-dot" aria-hidden="true"/>
      <span className="cv-engine-text">
        <span className="cv-engine-eyebrow">Model</span>
        <span className="cv-engine-label">{meta.label}</span>
        <span className="cv-engine-sub">{sub}</span>
        {status === 'loading' && loadedModelId === modelId && (
          <span className="cv-engine-progress" aria-hidden="true">
            <span className="cv-engine-progress-fill" style={{ width: `${pct}%` }}/>
          </span>
        )}
      </span>
      <button className="cv-engine-btn" onClick={() => setMenuOpen(v => !v)} aria-expanded={menuOpen}>Switch</button>
      {menuOpen && (
        <ul style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 12, padding: 6, listStyle: 'none', boxShadow: 'var(--shadow-pop)', width: 320, zIndex: 30 }}>
          <li style={{ padding: '8px 12px 6px', fontSize: 10, color: 'var(--ink-4)', letterSpacing: 0.12, textTransform: 'uppercase', fontWeight: 700 }}>Local models</li>
          {WEBLLM_MODELS.map(m => {
            const disabled = !webGPUSupported;
            const active = m.id === modelId;
            return (
              <li key={m.id}>
                <button
                  disabled={disabled}
                  onClick={() => { onPick(m.id); setMenuOpen(false); }}
                  style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, padding: '10px 12px', border: 0, background: active ? 'var(--accent-ghost)' : 'transparent', borderRadius: 8, textAlign: 'left', color: active ? 'var(--accent-2)' : 'var(--ink)', opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
                >
                  <span style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{m.label}</span>
                      {loadedModelId === m.id && status === 'ready' && <span style={{ fontSize: 9.5, letterSpacing: 0.08, textTransform: 'uppercase', color: 'var(--done)', background: 'var(--done-soft)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>Loaded</span>}
                      {loadedModelId === m.id && status === 'loading' && <span style={{ fontSize: 9.5, letterSpacing: 0.08, textTransform: 'uppercase', color: 'var(--accent-2)', background: 'var(--accent-ghost)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>Loading…</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.4 }}>
                      {!webGPUSupported ? 'Browser does not support WebGPU' : `~${m.sizeMB} MB · ${m.note}`}
                    </div>
                  </span>
                  {active && <span style={{ color: 'var(--accent)', alignSelf: 'center' }}><svg viewBox="0 0 16 16" width="14" height="14" fill="none"><path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>}
                </button>
              </li>
            );
          })}
          <li style={{ borderTop: '1px solid var(--rule)', margin: '6px 4px' }}/>
          <li style={{ padding: '8px 12px 10px', fontSize: 11.5, color: 'var(--ink-4)', letterSpacing: 0.04, lineHeight: 1.5 }}>
            Each model is downloaded once and cached in your browser. Switching back later is instant.
          </li>
        </ul>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export function ConversationPage({ langId }: ConversationPageProps) {
  const course = COURSES[langId];
  const levels = course?.levels ?? ['A1'];
  const [level, setLevel] = useState<CefrLevel>(levels[0]);
  const [completed, setCompleted] = useState<Record<string, boolean>>(loadCompleted);
  const [session, setSession] = useState<SessionConfig | null>(null);

  const [modelId, setModelId]           = useState(loadModelPref);
  const [engineId, setEngineId]         = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('idle');
  const [engineProgress, setEngineProgress] = useState<EngineProgress>({ text: '', progress: 0 });
  const [engineError, setEngineError]   = useState<string | null>(null);
  const engineRef = useRef<WebLLMEngine | null>(null);

  const webGPUSupported = typeof navigator !== 'undefined' && 'gpu' in navigator;

  useEffect(() => {
    if (!levels.includes(level)) setLevel(levels[0] as CefrLevel);
  }, [langId]);

  useEffect(() => {
    document.body.classList.toggle('in-chat', !!session);
    return () => document.body.classList.remove('in-chat');
  }, [session]);

  const ensureEngineReady = useCallback(async (targetModelId = modelId): Promise<WebLLMEngine> => {
    if (engineRef.current && engineId === targetModelId && engineStatus === 'ready') return engineRef.current;
    setEngineId(targetModelId);
    setEngineStatus('loading');
    setEngineError(null);
    setEngineProgress({ text: 'Starting…', progress: 0 });
    const eng = new WebLLMEngine(targetModelId);
    try {
      await eng.init(p => setEngineProgress(p));
      engineRef.current = eng;
      setEngineStatus('ready');
      return eng;
    } catch (err) {
      setEngineError(String((err as Error).message || err));
      setEngineStatus('error');
      throw err;
    }
  }, [modelId, engineId, engineStatus]);

  function startScenario(scenario: Scenario) {
    openSession({
      mode: 'scenario',
      scenarioId: scenario.id,
      title: scenario.title,
      nativeTitle: scenario.nativeTitle,
      character: scenario.character,
      setting: scenario.setting,
      goal: scenario.goal,
      systemPrompt: buildScenarioSystem(scenario, course?.name ?? langId, level),
      opener: scenario.opener,
      starters: scenario.starters,
    });
  }

  function startFreeChat(freeMode: FreeMode) {
    openSession({
      mode: freeMode.id,
      scenarioId: null,
      title: freeMode.title,
      nativeTitle: freeMode.nativeTitle,
      character: freeMode.id === 'crosstalk' ? 'A bilingual conversation partner' : 'A friendly conversation partner',
      setting: freeMode.id === 'crosstalk'
        ? `You write in English; the model replies in ${course?.name ?? langId} with a gloss.`
        : `An open-ended chat in ${course?.name ?? langId}, paced for ${level}.`,
      goal: null,
      systemPrompt: buildFreeSystem(freeMode.id, course?.name ?? langId, level),
      opener: freeMode.opener[langId] ?? '',
      starters: freeMode.starters[langId] ?? [],
    });
  }

  function openSession(s: SessionConfig) {
    setSession(s);
    ensureEngineReady().catch(() => {});
  }

  function markCompleted(scenarioId: string, val: boolean) {
    setCompleted(m => { const next = { ...m, [scenarioId]: val }; saveCompleted(next); return next; });
  }

  function switchModel(targetModelId: string) {
    if (!WEBLLM_MODELS.some(m => m.id === targetModelId)) return;
    setModelId(targetModelId); saveModelPref(targetModelId);
    if (engineRef.current?.modelId !== targetModelId) {
      engineRef.current = null;
      setEngineId(null); setEngineStatus('idle');
      setEngineProgress({ text: '', progress: 0 }); setEngineError(null);
    }
  }

  const scenarios = SCENARIOS[langId]?.[level] ?? [];

  return (
    <>
      <main className="g-main">
        <section className="cv-head">
          <div>
            <h1 className="g-page-title">
              Conversation
              <span className="g-page-title-native">in {course?.name ?? langId}</span>
            </h1>
            <p className="g-page-sub">Practice with a roleplay partner. Pick a scenario, or just chat. Everything runs in your browser.</p>
          </div>
          <EngineWidget
            modelId={modelId}
            loadedModelId={engineId}
            status={engineStatus}
            progress={engineProgress}
            error={engineError}
            webGPUSupported={webGPUSupported}
            onPick={switchModel}
          />
        </section>

        <aside className="cv-notice" role="note">
          <span className="cv-notice-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
              <path d="M12 3l10 18H2L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
              <path d="M12 10v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <circle cx="12" cy="18" r="1.1" fill="currentColor"/>
            </svg>
          </span>
          <div className="cv-notice-body">
            <div className="cv-notice-title">Best on a desktop or laptop, on Wi-Fi.</div>
            <p className="cv-notice-text">
              The conversation partner runs as an AI model inside your browser — no servers in the loop. The model file is about <b>1.1&nbsp;GB</b> the first time, then cached for future chats. Download it on <b>Wi-Fi</b> rather than mobile data, and expect slow replies on phones and tablets.
            </p>
          </div>
        </aside>

        <section>
          <div className="cv-levels" role="tablist" aria-label="Levels">
            {(['A1','A2','B1','B2','C1','C2'] as const).map(lv => {
              const exists = levels.includes(lv);
              const list   = exists ? (SCENARIOS[langId]?.[lv] ?? []) : [];
              return (
                <button
                  key={lv}
                  role="tab"
                  aria-selected={lv === level}
                  disabled={!exists}
                  className={`cv-level${lv === level ? ' is-active' : ''}${!exists ? ' is-empty' : ''}`}
                  onClick={() => exists && setLevel(lv)}
                >
                  <span className="cv-level-code">{lv}</span>
                  <span className="cv-level-name">{LEVEL_NAMES[lv]}</span>
                  {exists
                    ? <span className="cv-level-count">{list.length} {list.length === 1 ? 'scenario' : 'scenarios'}</span>
                    : <span className="cv-level-soon">Coming soon</span>
                  }
                </button>
              );
            })}
          </div>
        </section>

        <section className="cv-section">
          <div className="cv-section-head">
            <div>
              <h2 className="cv-section-title">Scenarios in {level}</h2>
              <p className="cv-section-sub">
                {scenarios.length} roleplay {scenarios.length === 1 ? 'scenario' : 'scenarios'} — pick one and the partner will start in character.
              </p>
            </div>
          </div>
          <div className="cv-grid">
            {scenarios.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: 'var(--ink-3)', background: 'var(--paper)', border: '1px dashed var(--rule)', borderRadius: 14 }}>
                More scenarios for {level} coming soon. Try a free chat below in the meantime.
              </div>
            )}
            {scenarios.map(s => (
              <button key={s.id} className="cv-card" onClick={() => startScenario(s)}>
                <span className="cv-card-glyph" aria-hidden="true">{s.glyph}</span>
                <span className="cv-card-body">
                  <span className="cv-card-native">{s.nativeTitle}</span>
                  <span className="cv-card-title">{s.title}</span>
                  <span className="cv-card-blurb">{s.blurb}</span>
                  {completed[s.id] && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--done)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 4 }}>
                      <svg viewBox="0 0 16 16" width="11" height="11" fill="none" aria-hidden="true"><path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Completed
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="cv-section">
          <div className="cv-section-head">
            <div>
              <h2 className="cv-section-title">Free chat</h2>
              <p className="cv-section-sub">No scenario, no goal — just keep talking. Two flavours, depending on how much English you want in the loop.</p>
            </div>
          </div>
          <div className="cv-free-grid">
            {FREE_MODES.map(m => (
              <button key={m.id} className="cv-free" onClick={() => startFreeChat(m)}>
                <span className="cv-free-glyph" aria-hidden="true">{m.glyph}</span>
                <span className="cv-free-eyebrow">
                  {m.id === 'crosstalk' ? `EN → ${course?.name ?? langId}` : `${course?.name ?? langId} ↔ ${course?.name ?? langId}`}
                </span>
                <span className="cv-free-title">{m.title}</span>
                <span className="cv-free-blurb">{m.blurb}</span>
                <span className="cv-free-foot">
                  <span>Open chat</span>
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
                    <path d="M5 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {session && (
        <ChatView
          session={session}
          langName={course?.name ?? langId}
          level={level}
          engineRef={engineRef}
          engineId={engineId}
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
    </>
  );
}
