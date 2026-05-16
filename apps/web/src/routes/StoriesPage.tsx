import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { STORIES, type Story } from '../data/stories';
import { COURSES, type LevelCode } from '../data/courses';

interface StoriesPageProps {
  langId: string;
}

const LEVEL_NAMES: Record<string, string> = {
  A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate',
  B2: 'Upper-int.', C1: 'Advanced', C2: 'Mastery',
};

const SPEECH_LANG: Record<string, string> = { greek: 'el-GR', spanish: 'es-ES' };

const SPEED_PRESETS = [
  { id: 'slow',    label: 'Slow',    sub: 'learning a new sound',   rate: 0.55 },
  { id: 'easy',    label: 'Easy',    sub: 'comfortable listening',   rate: 0.75 },
  { id: 'default', label: 'Default', sub: 'recommended for stories', rate: 0.9  },
  { id: 'native',  label: 'Native',  sub: 'full speaking speed',     rate: 1.0  },
];

const READ_KEY   = 'glossa-stories-read-v1';
const SPEED_KEY  = 'glossa-stories-speed-v1';

function loadReadMap(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(READ_KEY) ?? 'null') || {}; } catch { return {}; }
}
function saveReadMap(m: Record<string, boolean>) {
  try { localStorage.setItem(READ_KEY, JSON.stringify(m)); } catch {}
}
function loadSpeedId(): string {
  try { return localStorage.getItem(SPEED_KEY) || 'default'; } catch { return 'default'; }
}
function saveSpeedId(id: string) {
  try { localStorage.setItem(SPEED_KEY, id); } catch {}
}

function tokenizeWords(text: string): number[] {
  const starts: number[] = [];
  const re = /\S+/g;
  let m;
  while ((m = re.exec(text))) starts.push(m.index);
  return starts;
}
function charToWordIdx(starts: number[], charIndex: number): number {
  let lo = 0, hi = starts.length - 1, ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (starts[mid] <= charIndex) { ans = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  return ans;
}

// ── Paragraph with word highlights ─────────────────────────────────────────
function StoryParagraph({ paraIdx, text, active, activeWord }: {
  paraIdx: number; text: string; active: boolean; activeWord: number;
}) {
  const parts = useMemo(() => text.split(/(\s+)/), [text]);
  let wIdx = 0;
  return (
    <p className={`st-para${active ? ' is-active-para' : ''}`} data-para-idx={paraIdx}>
      {parts.map((part, i) => {
        if (!part || /^\s+$/.test(part)) return <span key={i}>{part}</span>;
        const myIdx = wIdx++;
        return (
          <span key={i} className={`st-word${myIdx === activeWord ? ' is-active' : ''}`} data-word-idx={myIdx}>
            {part}
          </span>
        );
      })}
    </p>
  );
}

// ── Reader overlay ──────────────────────────────────────────────────────────
function Reader({ story, langId, langName, level, onClose, onMarkRead, read }: {
  story: Story; langId: string; langName: string; level: string;
  onClose: () => void; onMarkRead: (val: boolean) => void; read: boolean;
}) {
  const [split, setSplit] = useState(true);
  const [audioState, setAudioState] = useState<'idle' | 'playing'>('idle');
  const [paraIdx, setParaIdx] = useState(-1);
  const [wordIdx, setWordIdx] = useState(-1);
  const [audioSupported, setAudioSupported] = useState(true);
  const [speedId, setSpeedId] = useState(loadSpeedId);
  const [speedOpen, setSpeedOpen] = useState(false);

  const targetPaneRef = useRef<HTMLDivElement>(null);
  const transPaneRef  = useRef<HTMLDivElement>(null);
  const speedWrapRef  = useRef<HTMLDivElement>(null);
  const stoppedRef    = useRef(false);
  const ignoreUntilRef = useRef({ target: 0, trans: 0 });
  const markedRef     = useRef(false);

  const speechLang = SPEECH_LANG[langId] || 'en-US';
  const speed = SPEED_PRESETS.find(s => s.id === speedId) ?? SPEED_PRESETS[2];
  const rateRef = useRef(speed.rate);
  useEffect(() => { rateRef.current = speed.rate; }, [speed.rate]);

  const wordStarts = useMemo(
    () => story.paragraphs.map(p => tokenizeWords(p.t)),
    [story],
  );

  // body class
  useEffect(() => {
    document.body.classList.add('in-reader');
    return () => document.body.classList.remove('in-reader');
  }, []);

  // stop audio on unmount
  useEffect(() => () => {
    stoppedRef.current = true;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  // detect speech support
  useEffect(() => {
    if (!('speechSynthesis' in window)) setAudioSupported(false);
  }, []);

  // close speed menu on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (speedWrapRef.current && !speedWrapRef.current.contains(e.target as Node)) setSpeedOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // mark read on scroll to bottom
  useEffect(() => {
    function onScroll() {
      const el = targetPaneRef.current;
      if (!el || markedRef.current || read) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
        markedRef.current = true;
        onMarkRead(true);
      }
    }
    const el = targetPaneRef.current;
    el?.addEventListener('scroll', onScroll, { passive: true });
    return () => el?.removeEventListener('scroll', onScroll);
  }, [read, onMarkRead]);

  // scroll sync
  const syncFrom = useCallback((from: 'target' | 'trans') => {
    if (!split) return;
    const a = from === 'target' ? targetPaneRef.current : transPaneRef.current;
    const b = from === 'target' ? transPaneRef.current  : targetPaneRef.current;
    if (!a || !b) return;
    const aParas = a.querySelectorAll<HTMLElement>('.st-para');
    if (!aParas.length) return;
    const aRect = a.getBoundingClientRect();
    const aCenter = aRect.top + aRect.height * 0.4;
    let bestIdx = 0, bestDelta = Infinity, bestFrac = 0;
    aParas.forEach((p, i) => {
      const r = p.getBoundingClientRect();
      const center = r.top + r.height / 2;
      const delta = Math.abs(center - aCenter);
      if (delta < bestDelta) {
        bestDelta = delta; bestIdx = i;
        const f = (aCenter - r.top) / Math.max(r.height, 1);
        bestFrac = Math.max(0, Math.min(1, f));
      }
    });
    const bParas = b.querySelectorAll<HTMLElement>('.st-para');
    const target = bParas[bestIdx];
    if (!target) return;
    const bRect = b.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    const desiredTop = tRect.top - bRect.top + tRect.height * bestFrac - bRect.height * 0.4;
    ignoreUntilRef.current[from === 'target' ? 'trans' : 'target'] = Date.now() + 220;
    b.scrollTo({ top: b.scrollTop + desiredTop, behavior: 'auto' });
  }, [split]);

  useEffect(() => {
    if (!split) return;
    const t = targetPaneRef.current, r = transPaneRef.current;
    if (!t || !r) return;
    const onT = () => { if (Date.now() >= ignoreUntilRef.current.target) syncFrom('target'); };
    const onR = () => { if (Date.now() >= ignoreUntilRef.current.trans)  syncFrom('trans'); };
    t.addEventListener('scroll', onT, { passive: true });
    r.addEventListener('scroll', onR, { passive: true });
    return () => { t.removeEventListener('scroll', onT); r.removeEventListener('scroll', onR); };
  }, [split, syncFrom]);

  useEffect(() => {
    if (split) requestAnimationFrame(() => syncFrom('target'));
  }, [split, syncFrom]);

  // keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        toggleAudio();
      }
      if (e.key === 's' || e.key === 'S') setSplit(v => !v);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  // ── audio ─────────────────────────────────────────────────────────────────
  function pickVoice(langCode: string) {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.lang === langCode)
      || voices.find(v => v.lang.toLowerCase().startsWith(langCode.slice(0, 2).toLowerCase()))
      || null;
  }

  function scrollParaIntoView(i: number) {
    const pane = targetPaneRef.current;
    if (!pane) return;
    const p = pane.querySelector<HTMLElement>(`[data-para-idx="${i}"]`);
    if (!p) return;
    const pRect = p.getBoundingClientRect(), paneRect = pane.getBoundingClientRect();
    const delta = pRect.top - (paneRect.top + paneRect.height * 0.18);
    if (Math.abs(delta) > 8) pane.scrollBy({ top: delta, behavior: 'smooth' });
  }
  function scrollWordIntoView(pi: number, wi: number) {
    const pane = targetPaneRef.current;
    if (!pane) return;
    const p = pane.querySelector<HTMLElement>(`[data-para-idx="${pi}"]`);
    const w = p?.querySelector<HTMLElement>(`[data-word-idx="${wi}"]`);
    if (!w) return;
    const wRect = w.getBoundingClientRect(), paneRect = pane.getBoundingClientRect();
    const top = wRect.top - paneRect.top;
    if (top < paneRect.height * 0.20 || top > paneRect.height * 0.65) {
      pane.scrollBy({ top: top - paneRect.height * 0.30, behavior: 'smooth' });
    }
  }

  function speakParagraph(i: number) {
    if (stoppedRef.current) return;
    if (i >= story.paragraphs.length) {
      setAudioState('idle'); setParaIdx(-1); setWordIdx(-1);
      if (!read) { markedRef.current = true; onMarkRead(true); }
      return;
    }
    setParaIdx(i); setWordIdx(-1);
    scrollParaIntoView(i);
    const text = story.paragraphs[i].t;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = speechLang;
    u.rate = rateRef.current;
    const voice = pickVoice(speechLang);
    if (voice) u.voice = voice;
    u.onboundary = (ev) => {
      if (ev.name && ev.name !== 'word') return;
      const wIdx = charToWordIdx(wordStarts[i], ev.charIndex || 0);
      setWordIdx(wIdx);
      scrollWordIntoView(i, wIdx);
    };
    u.onend = () => { if (!stoppedRef.current) setTimeout(() => speakParagraph(i + 1), 220); };
    u.onerror = () => { if (!stoppedRef.current) setTimeout(() => speakParagraph(i + 1), 220); };
    try { window.speechSynthesis.speak(u); } catch { setAudioState('idle'); }
  }

  function startAudio() {
    if (!('speechSynthesis' in window)) { setAudioSupported(false); return; }
    stoppedRef.current = false;
    setAudioState('playing');
    window.speechSynthesis.cancel();
    speakParagraph(paraIdx >= 0 ? paraIdx : 0);
  }
  function stopAudio() {
    stoppedRef.current = true;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setAudioState('idle');
  }
  function toggleAudio() {
    if (audioState === 'playing') stopAudio(); else startAudio();
  }

  function pickSpeed(id: string) {
    setSpeedId(id); saveSpeedId(id); setSpeedOpen(false);
    const preset = SPEED_PRESETS.find(s => s.id === id);
    if (!preset) return;
    rateRef.current = preset.rate;
    if (audioState === 'playing') {
      const resumeAt = Math.max(paraIdx, 0);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setTimeout(() => { if (!stoppedRef.current) speakParagraph(resumeAt); }, 60);
    }
  }

  const progressPct = audioState === 'playing'
    ? Math.round((paraIdx / Math.max(story.paragraphs.length, 1)) * 100)
    : 0;

  return (
    <div className="st-reader" role="dialog" aria-modal="true">
      <header className="st-reader-head">
        <button className="st-exit" onClick={onClose} aria-label="Close reader">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
            <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="st-reader-title">
          <span className="st-reader-eyebrow">{langName} · {level} · {story.minutes} min</span>
          <span className="st-reader-h">{story.nativeTitle}</span>
        </div>

        <div className="st-tools">
          <button
            className={`st-tool${split ? ' is-active' : ''}`}
            onClick={() => setSplit(v => !v)}
            aria-pressed={split}
            title="Toggle split-screen translation (S)"
          >
            <span className="st-tool-icon">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
                <rect x="2" y="2.5" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="8" y1="2.5" x2="8" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray={split ? '0' : '2 2'}/>
              </svg>
            </span>
            <span className="st-tool-label">Split</span>
          </button>

          <button
            className={`st-tool${audioState === 'playing' ? ' is-playing' : ''}`}
            onClick={toggleAudio}
            disabled={!audioSupported}
            aria-pressed={audioState === 'playing'}
            title={audioSupported ? 'Play story aloud (Space)' : 'Audio not supported in this browser'}
          >
            <span className="st-tool-icon">
              {audioState === 'playing'
                ? <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="4" y="4" width="8" height="8" rx="1" fill="currentColor"/></svg>
                : <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 3.5v9l8-4.5z" fill="currentColor"/></svg>
              }
            </span>
            <span className="st-tool-label">{audioState === 'playing' ? 'Stop' : 'Read aloud'}</span>
          </button>

          <div className="st-speedwrap" ref={speedWrapRef}>
            <button
              className={`st-tool${speedOpen ? ' is-active' : ''}`}
              onClick={() => setSpeedOpen(v => !v)}
              disabled={!audioSupported}
              aria-haspopup="listbox"
              aria-expanded={speedOpen}
              title="Reading speed"
            >
              <span className="st-speed-val">{speed.rate.toFixed(2).replace(/0$/, '')}×</span>
              <svg viewBox="0 0 12 12" width="10" height="10" fill="none" className="st-speed-chev" aria-hidden="true">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {speedOpen && (
              <ul className="st-speedmenu" role="listbox" aria-label="Reading speed">
                <li className="st-speedmenu-h">Reading speed</li>
                {SPEED_PRESETS.map(p => (
                  <li key={p.id}>
                    <button
                      role="option"
                      aria-selected={p.id === speedId}
                      className={`st-speeditem${p.id === speedId ? ' is-active' : ''}`}
                      onClick={() => pickSpeed(p.id)}
                    >
                      <span>
                        <div className="st-speeditem-label">{p.label}</div>
                        <div className="st-speeditem-sub">{p.sub}</div>
                      </span>
                      <span className="st-speeditem-val">{p.rate.toFixed(2).replace(/0$/, '')}×</span>
                      {p.id === speedId && (
                        <span className="st-speeditem-check">
                          <svg viewBox="0 0 16 16" width="11" height="11" fill="none" aria-hidden="true">
                            <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </header>

      <div className={`st-reader-body${split ? ' is-split' : ''}`}>
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
              <StoryParagraph
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
                <button className="st-end-btn is-primary" onClick={() => onMarkRead(!read)}>
                  {read ? 'Mark as unread' : 'Mark as read'}
                </button>
                <button className="st-end-btn" onClick={onClose}>Back to stories</button>
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
                  className={`st-para${paraIdx === i ? ' is-active-para' : ''}`}
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
          <div className="st-audio-strip-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export function StoriesPage({ langId }: StoriesPageProps) {
  const course = COURSES[langId];
  const allStories = STORIES[langId] ?? {};
  const levels = course?.levels ?? ['A1'];
  const [level, setLevel] = useState<LevelCode>(levels[0]);
  const [readMap, setReadMap] = useState<Record<string, boolean>>(loadReadMap);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [openStory, setOpenStory] = useState<Story | null>(null);

  useEffect(() => {
    if (!levels.includes(level)) setLevel(levels[0] as LevelCode);
  }, [langId]);

  function isRead(s: Story) {
    return s.id in readMap ? readMap[s.id] : !!s.read;
  }
  function markRead(storyId: string, val: boolean) {
    setReadMap(m => { const next = { ...m, [storyId]: val }; saveReadMap(next); return next; });
  }

  const storiesAtLevel = allStories[level] ?? [];
  const visibleStories = storiesAtLevel.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'read') return isRead(s);
    return !isRead(s);
  });

  const totalAtLevel = storiesAtLevel.length;
  const readAtLevel  = storiesAtLevel.filter(isRead).length;
  const totalAll = levels.flatMap(lv => allStories[lv] ?? []).length;
  const readAll  = levels.flatMap(lv => allStories[lv] ?? []).filter(isRead).length;

  return (
    <>
      <main className="g-main">
        <section className="st-head">
          <div>
            <h1 className="g-page-title">
              Stories
              <span className="g-page-title-native">in {course?.name ?? langId}</span>
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

        <section>
          <div className="st-levels" role="tablist" aria-label="Levels">
            {(['A1','A2','B1','B2','C1','C2'] as const).map(lv => {
              const exists = levels.includes(lv);
              const list   = exists ? (allStories[lv] ?? []) : [];
              const total  = list.length;
              const done   = list.filter(isRead).length;
              const pct    = total ? Math.round((done / total) * 100) : 0;
              return (
                <button
                  key={lv}
                  role="tab"
                  aria-selected={lv === level}
                  disabled={!exists}
                  className={`st-level${lv === level ? ' is-active' : ''}${!exists ? ' is-empty' : ''}`}
                  onClick={() => exists && setLevel(lv)}
                >
                  <span className="st-level-code">{lv}</span>
                  <span className="st-level-name">{LEVEL_NAMES[lv]}</span>
                  {exists ? (
                    <>
                      <span className="st-level-count">{done} / {total}</span>
                      <span className="st-level-bar" aria-hidden="true">
                        <span className="st-level-bar-fill" style={{ width: `${pct}%` }} />
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

        <section className="st-list-section">
          <div className="st-list-head">
            <div>
              <h2 className="st-section-title">{level} · {LEVEL_NAMES[level]}</h2>
              <p className="st-section-sub">
                {totalAtLevel} {totalAtLevel === 1 ? 'story' : 'stories'} · {readAtLevel} read · {totalAtLevel - readAtLevel} new
              </p>
            </div>
            <div className="st-filter" role="group" aria-label="Filter">
              {(['all', 'unread', 'read'] as const).map(f => (
                <button
                  key={f}
                  className={`st-filter-btn${filter === f ? ' is-active' : ''}`}
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="st-grid">
            {visibleStories.length === 0 && (
              <div className="st-card-empty">Nothing here yet. Try another filter or level.</div>
            )}
            {visibleStories.map(s => {
              const r = isRead(s);
              return (
                <button key={s.id} className={`st-card${r ? ' is-read' : ''}`} onClick={() => setOpenStory(s)}>
                  <div className="st-card-cover">
                    <div className="st-card-cover-pat" aria-hidden="true" />
                    <span className="st-card-cover-glyph" aria-hidden="true">{s.glyph}</span>
                    <span className={`st-card-tag ${r ? 'is-read' : 'is-unread'}`}>
                      {r ? (
                        <>
                          <svg viewBox="0 0 16 16" width="11" height="11" fill="none" aria-hidden="true">
                            <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Read
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true">
                            <circle cx="8" cy="8" r="4" fill="currentColor"/>
                          </svg>
                          New
                        </>
                      )}
                    </span>
                  </div>
                  <div className="st-card-body">
                    <div className="st-card-native">{s.nativeTitle}</div>
                    <div className="st-card-title">{s.title}</div>
                    <p className="st-card-excerpt">{s.excerpt}</p>
                    <div className="st-card-foot">
                      <span className="st-card-foot-meta">
                        <span>{s.minutes} min</span>
                        <span className="dot" />
                        <span>{s.words} words</span>
                      </span>
                      <span>{s.paragraphs.length} ¶</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {openStory && (
        <Reader
          story={openStory}
          langId={langId}
          langName={course?.name ?? langId}
          level={level}
          onClose={() => setOpenStory(null)}
          onMarkRead={val => markRead(openStory.id, val)}
          read={isRead(openStory)}
        />
      )}
    </>
  );
}
