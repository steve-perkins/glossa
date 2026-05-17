import { useState, useCallback, useEffect } from 'react';
import type { VocabItem } from '@glossa/shared';
import { useLanguageContent } from '../hooks/useContent';

type PracticeItem = VocabItem;

interface PracticePageProps {
  langId: string;
}

type Mode = 'mc' | 'fill';
type Phase = 'config' | 'session' | 'results';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeDisctractors(item: PracticeItem, pool: PracticeItem[]): string[] {
  const others = shuffle(pool.filter(p => p.word !== item.word)).slice(0, 3);
  return shuffle([item.word, ...others.map(p => p.word)]);
}

export function PracticePage({ langId }: PracticePageProps) {
  const { data: content } = useLanguageContent(langId);
  const poolItems = content?.vocabItems ?? null;
  const [phase, setPhase] = useState<Phase>('config');
  const [mode, setMode] = useState<Mode>('mc');
  const [roundSize, setRoundSize] = useState(10);

  const [queue, setQueue] = useState<PracticeItem[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [fillValue, setFillValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [distractors, setDistractors] = useState<string[]>([]);

  function startSession() {
    const q = shuffle(poolItems ?? []).slice(0, roundSize);
    setQueue(q);
    setQIdx(0);
    setScore({ correct: 0, wrong: 0 });
    setPhase('session');
    setupQuestion(q, 0);
  }

  function setupQuestion(q: PracticeItem[], i: number) {
    setFillValue('');
    setChecked(false);
    setCorrect(null);
    if (mode === 'mc' && poolItems) {
      setDistractors(makeDisctractors(q[i], poolItems));
    }
  }

  function checkMC(word: string) {
    if (checked) return;
    const isCorrect = word === queue[qIdx].word;
    setCorrect(isCorrect);
    setChecked(true);
    setScore(s => isCorrect ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 });
  }

  function checkFill() {
    if (checked) return;
    const isCorrect = fillValue.trim().toLowerCase() === queue[qIdx].word.toLowerCase();
    setCorrect(isCorrect);
    setChecked(true);
    setScore(s => isCorrect ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 });
  }

  function advance() {
    const next = qIdx + 1;
    if (next >= queue.length) {
      setPhase('results');
    } else {
      setQIdx(next);
      setupQuestion(queue, next);
    }
  }

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (phase !== 'session') return;
    if (e.key === 'Enter' && checked) advance();
    if (e.key === 'Enter' && !checked && mode === 'fill') checkFill();
  }, [phase, checked, fillValue, mode, qIdx]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  if (!poolItems) return <main className="g-main"><p>No practice data for this language yet.</p></main>;

  const item = queue[qIdx];
  const progress = queue.length ? qIdx / queue.length : 0;

  if (phase === 'session' && item) {
    return (
      <div className="pr-session">
        <header className="pr-session-head">
          <button className="ls-exit" aria-label="End session" onClick={() => setPhase('results')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="pr-pipbar">
            <div className="pr-pipbar-fill" style={{ width: `${progress * 100}%` }} />
            <div className="pr-pipbar-cur" style={{ left: `${progress * 100}%`, width: `${100 / queue.length}%` }} />
          </div>
          <div className="pr-tally">
            <span className="pr-tally-chip pr-tally-chip--good">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6l2.8 3L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {score.correct}
            </span>
            <span className="pr-tally-chip pr-tally-chip--bad">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              {score.wrong}
            </span>
          </div>
        </header>

        <div className="ls-stage">
          <div className="ls-stage-inner">
            <div className="ls-slide">
              <div className="ls-eyebrow">{item.unitTitle}</div>
              <h2 className="ls-h ls-mc-prompt">
                {mode === 'mc' ? 'Which word means…' : 'Type the word in the target language'}
              </h2>
              <p className="ls-en-target">"{item.translation}"</p>

              <div className="ls-sentence">
                {item.sentence.map((part, i) =>
                  part === '_' ? (
                    mode === 'mc' ? (
                      <span key={i} className={`ls-blank${!checked ? ' is-empty' : correct ? ' is-correct' : ' is-wrong'}`}>
                        {checked ? item.word : '___'}
                      </span>
                    ) : (
                      <input
                        key={i}
                        className={`ls-input${checked ? (correct ? ' is-correct' : ' is-wrong') : ''}`}
                        value={fillValue}
                        onChange={e => setFillValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !checked) checkFill(); }}
                        disabled={checked}
                        placeholder="…"
                        autoFocus
                        size={Math.max(6, fillValue.length + 2)}
                      />
                    )
                  ) : (
                    <span key={i} className="ls-sent-word">{part}</span>
                  )
                )}
              </div>

              {mode === 'mc' && !checked && (
                <div className="pr-mc-grid">
                  {distractors.map((word, i) => (
                    <button key={i} className="pr-mc-btn" onClick={() => checkMC(word)}>
                      <span className="pr-mc-letter">{String.fromCharCode(65 + i)}</span>
                      <span className="pr-mc-word">{word}</span>
                    </button>
                  ))}
                </div>
              )}

              {checked && (
                <div className={`ls-feedback${correct ? ' is-correct' : ' is-wrong'}`} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center' }}>
                  <span className="ls-feedback-icon">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      {correct
                        ? <path d="M2.5 7l3 3L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        : <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      }
                    </svg>
                  </span>
                  <div className="pr-feedback-text">
                    <span className="pr-feedback-headline">{correct ? 'Correct!' : 'Not quite'}</span>
                    {!correct && (
                      <span className="pr-feedback-sub">
                        The answer is <b>{item.word}</b>
                        {item.romanization && <> ({item.romanization})</>}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="pr-session-foot">
          <div className="pr-foot-meta">
            <span className="pr-foot-meta-eyebrow">Word</span>
            <span className="pr-foot-meta-text">{qIdx + 1} of {queue.length}</span>
          </div>
          <span className="ls-foot-count">{qIdx + 1} <span>/</span> {queue.length}</span>
          {mode === 'fill' && !checked ? (
            <button className="ls-cta" disabled={!fillValue.trim()} onClick={checkFill}>Check</button>
          ) : (
            <button
              className={`ls-cta${correct === true ? ' is-ok' : correct === false ? ' is-wrong' : ''}`}
              disabled={!checked && mode !== 'mc'}
              onClick={advance}
            >
              {qIdx + 1 >= queue.length ? 'Finish' : 'Next'}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </footer>
      </div>
    );
  }

  if (phase === 'results') {
    const total = score.correct + score.wrong;
    const pct = total ? Math.round((score.correct / total) * 100) : 0;
    return (
      <main className="g-main">
        <div className="pr-results">
          <div className="pr-results-medal" aria-label="Practice complete">
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
              <circle cx="36" cy="36" r="34" fill="var(--accent-ghost)" stroke="var(--accent)" strokeWidth="2"/>
              <path d="M22 36l10 10 18-18" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="pr-results-title">{pct >= 80 ? 'Great work!' : pct >= 50 ? 'Good effort!' : 'Keep practising!'}</h2>
          <p className="pr-results-sub">
            {pct >= 80 ? 'Your recall is strong. Come back tomorrow to keep the streak alive.' : 'Practice makes perfect. Try again to reinforce the words.'}
          </p>
          <div className="pr-results-stats">
            <div className="pr-result-stat pr-result-stat--accent">
              <span className="pr-result-num">{pct}%</span>
              <span className="pr-result-lbl">accuracy</span>
            </div>
            <div className="pr-result-stat">
              <span className="pr-result-num">{score.correct}</span>
              <span className="pr-result-lbl">correct</span>
            </div>
            <div className="pr-result-stat">
              <span className="pr-result-num">{score.wrong}</span>
              <span className="pr-result-lbl">missed</span>
            </div>
          </div>
          <div className="pr-results-cta">
            <button className="pr-start-cta" onClick={startSession}>Practice again</button>
            <button className="pr-secondary-cta" onClick={() => setPhase('config')}>Change settings</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="g-main">
      <div className="pr-hero">
        <div className="pr-hero-text">
          <div className="pr-eyebrow">Vocabulary practice</div>
          <h1 className="g-page-title" style={{ fontSize: 'clamp(36px,5vw,56px)' }}>Practice</h1>
          <p className="g-page-sub">Drill the words you've learned — or challenge yourself with everything in the pool.</p>
        </div>
        <div className="pr-stats">
          <div className="pr-stat">
            <span className="pr-stat-num">{poolItems.length}</span>
            <span className="pr-stat-lbl">words available</span>
          </div>
          <div className="pr-stat pr-stat--good">
            <span className="pr-stat-num">0</span>
            <span className="pr-stat-lbl">mastered</span>
          </div>
          <div className="pr-stat pr-stat--bad">
            <span className="pr-stat-num">0</span>
            <span className="pr-stat-lbl">due for review</span>
          </div>
        </div>
      </div>

      <div className="pr-config">
        <div className="pr-config-row">
          <div className="pr-config-label">
            <span className="pr-config-eyebrow">Round size</span>
            <h3 className="pr-config-title">How many words?</h3>
            <p className="pr-config-sub">A shorter round keeps it snappy. A longer one builds stamina.</p>
          </div>
          <div className="pr-select-wrap">
            <select
              className="pr-select"
              value={roundSize}
              onChange={e => setRoundSize(Number(e.target.value))}
            >
              {[5, 10, 15, 20].map(n => (
                <option key={n} value={n}>{n} words</option>
              ))}
            </select>
            <svg className="pr-select-chev" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="pr-config-row">
          <div className="pr-config-label">
            <span className="pr-config-eyebrow">Exercise type</span>
            <h3 className="pr-config-title">How do you want to practise?</h3>
            <p className="pr-config-sub">Multiple choice is gentler. Fill-in challenges your recall more directly.</p>
          </div>
          <div className="pr-modes">
            {(['mc', 'fill'] as Mode[]).map(m => (
              <button
                key={m}
                className={`pr-mode${mode === m ? ' is-active' : ''}`}
                onClick={() => setMode(m)}
              >
                <span className="pr-mode-icon">
                  {m === 'mc'
                    ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M6 9l2.5 2.5L13 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="2" y="5" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M6 9h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  }
                </span>
                <span className="pr-mode-text">
                  <span className="pr-mode-title">{m === 'mc' ? 'Multiple choice' : 'Fill in the blank'}</span>
                  <span className="pr-mode-sub">{m === 'mc' ? 'Pick the right word from four options' : 'Type the word from memory'}</span>
                </span>
                <span className="pr-mode-check">
                  {mode === m && <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="pr-start-bar">
          <div className="pr-start-summary">
            <span className="pr-summary-eyebrow">Ready to start</span>
            <span className="pr-summary-text">{roundSize} words · {mode === 'mc' ? 'Multiple choice' : 'Fill in the blank'}</span>
          </div>
          <button className="pr-start-cta" onClick={startSession}>
            Start practice
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}
