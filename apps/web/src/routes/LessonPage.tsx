import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { FillSlide } from '@glossa/shared';
import { useLessonContent } from '../hooks/useContent';
import { useLessonProgressMutation } from '../hooks/useProgress';
import { useAuth } from '../context/AuthContext';

interface LessonPageProps {
  langId: string;
}

export function LessonPage({ langId }: LessonPageProps) {
  const { lessonId = '' } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { data: lesson } = useLessonContent(langId, lessonId);
  const slides = lesson?.slides ?? [];
  const total = slides.length;
  const { accessToken } = useAuth();
  const progressMutation = useLessonProgressMutation();
  const markedInProgressRef = useRef(false);
  const markedDoneRef = useRef(false);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [fillValue, setFillValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);

  const slide = slides[idx];

  function resetSlide() {
    setSelected([]);
    setFillValue('');
    setChecked(false);
    setCorrect(null);
  }

  function goNext() {
    if (idx < total - 1) {
      setIdx(i => i + 1);
      resetSlide();
    }
  }

  function goPrev() {
    if (idx > 0) {
      setIdx(i => i - 1);
      resetSlide();
    }
  }

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!slide) return;
    if (e.key === 'ArrowRight' || e.key === 'Enter') {
      if (!checked && (slide.type === 'grammar' || slide.type === 'vocab' || slide.type === 'done')) {
        goNext();
      }
    }
    if (e.key === 'ArrowLeft') goPrev();
  }, [idx, checked, slide]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Mark lesson in_progress once both lesson and auth are ready
  useEffect(() => {
    if (!lesson || !lessonId || !accessToken || markedInProgressRef.current) return;
    markedInProgressRef.current = true;
    progressMutation.mutate({ lessonId, status: 'in_progress', lastSlideOrdinal: 0 });
  }, [lesson, lessonId, accessToken]);

  // Mark lesson done when reaching the done slide (once auth is ready)
  useEffect(() => {
    if (!slide || slide.type !== 'done' || !accessToken || markedDoneRef.current) return;
    markedDoneRef.current = true;
    progressMutation.mutate({ lessonId, status: 'done' });
  }, [slide?.type, lessonId, accessToken]);

  function checkFill(fill: FillSlide) {
    if (checked) return;
    const isCorrect = fillValue.trim().toLowerCase() === fill.answer.toLowerCase();
    setCorrect(isCorrect);
    setChecked(true);
  }

  function speak(text: string) {
    const ttsLang = langId === 'greek' ? 'el-GR' : 'es-ES';
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = ttsLang;
    speechSynthesis.speak(utt);
  }

  if (!lesson || !slide) {
    return (
      <div className="ls-app">
        <header className="ls-head">
          <button className="ls-exit" aria-label="Exit lesson" onClick={() => navigate('/')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </header>
        <div className="ls-stage"><div className="ls-stage-inner" /></div>
      </div>
    );
  }

  const pipStatus = slides.map((_, i) => {
    if (i < idx) return 'is-past';
    if (i === idx) return 'is-current';
    return '';
  });

  const canContinue =
    slide.type === 'grammar' || slide.type === 'vocab' || slide.type === 'done' ||
    (checked);

  return (
    <div className="ls-app">
      <header className="ls-head">
        <button className="ls-exit" aria-label="Exit lesson" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="ls-progress" role="progressbar" aria-valuenow={idx + 1} aria-valuemax={total}>
          {slides.map((_, i) => (
            <div key={i} className={`ls-pip ${pipStatus[i]}`} />
          ))}
        </div>

        <div className="ls-meta">
          <span className="ls-meta-lang">{langId} · lesson</span>
          <span className="ls-meta-title">{lesson.title}</span>
        </div>
      </header>

      <div className="ls-stage">
        <div className="ls-stage-inner">
          {slide.type === 'grammar' && (
            <div className="ls-slide ls-grammar">
              <div className="ls-eyebrow">Grammar</div>
              <h2 className="ls-h">{slide.title}</h2>
              <div className="ls-prose">
                {slide.body.map((p, i) => <p key={i}>{p}</p>)}
              </div>
              {slide.callout && (
                <div className="ls-callout">
                  <span className="ls-callout-mark">!</span>
                  <span>{slide.callout}</span>
                </div>
              )}
              {slide.table && (
                <div className="ls-tablewrap">
                  <table className="ls-table">
                    <thead>
                      <tr>{slide.table.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {slide.table.rows.map((row, i) => (
                        <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {slide.type === 'vocab' && (
            <div className="ls-slide ls-vocab">
              <div className="ls-eyebrow">Vocabulary</div>
              {slide.imageUrl ? (
                /* Photo layout */
                <div className="ls-vocab-main">
                  <div className="ls-vocab-text">
                    <p className="ls-word">{slide.word}</p>
                    {slide.romanization && <span className="ls-romanization">{slide.romanization}</span>}
                    <span className="ls-translation">{slide.translation}</span>
                    <button className="ls-audio" onClick={() => speak(slide.word)}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 6H1v4h2l4 3V3L3 6zM11 8a3 3 0 00-3-3M13 8a5 5 0 00-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Listen
                    </button>
                  </div>
                  <div className="ls-vocab-photo">
                    <div className="ls-photo">
                      <img src={slide.imageUrl} alt={slide.word} />
                      {slide.photoLabel && <span className="ls-photo-caption">{slide.photoLabel}</span>}
                    </div>
                  </div>
                </div>
              ) : (
                /* Typographic layout */
                <div className="ls-vocab-main" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="ls-vocab-text">
                    <p className="ls-word">{slide.word}</p>
                    {slide.romanization && <span className="ls-romanization">{slide.romanization}</span>}
                    <span className="ls-translation">{slide.translation}</span>
                    <button className="ls-audio" onClick={() => speak(slide.word)}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 6H1v4h2l4 3V3L3 6zM11 8a3 3 0 00-3-3M13 8a5 5 0 00-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Listen
                    </button>
                  </div>
                </div>
              )}
              <div className="ls-example">
                <div className="ls-example-head">
                  <span className="ls-example-label">Example</span>
                  <button className="ls-audio is-small" onClick={() => speak(slide.example.target)}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 6H1v4h2l4 3V3L3 6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Play
                  </button>
                </div>
                <span className="ls-example-target">{slide.example.target}</span>
                <span className="ls-example-en">{slide.example.english}</span>
              </div>
            </div>
          )}

          {slide.type === 'mc' && (
            <div className="ls-slide">
              <div className="ls-eyebrow">Multiple choice</div>
              <h2 className="ls-h ls-mc-prompt">{slide.prompt}</h2>
              <p className="ls-en-target">{slide.english}</p>
              <div className="ls-sentence">
                {slide.sentence.map((part, i) =>
                  part === '_' ? (
                    <span key={i} className={`ls-blank${selected.length === 0 ? ' is-empty' : checked ? (correct ? ' is-correct' : ' is-wrong') : ' is-filled'}`}>
                      {selected[slide.sentence.filter((p, j) => p === '_' && j < i).length] ?? '___'}
                    </span>
                  ) : (
                    <span key={i} className="ls-sent-word">{part}</span>
                  )
                )}
              </div>
              <div className="ls-bank">
                {slide.bank.map((word, i) => (
                  <button
                    key={i}
                    className={`ls-chip${selected.includes(word) ? ' is-used' : ''}`}
                    disabled={checked}
                    onClick={() => {
                      if (selected.includes(word)) {
                        setSelected(s => s.filter(w => w !== word));
                      } else {
                        const next = [...selected, word];
                        setSelected(next);
                        if (next.length === slide.answers.length) {
                          const isCorrect = JSON.stringify([...next].sort()) === JSON.stringify([...slide.answers].sort());
                          setCorrect(isCorrect);
                          setChecked(true);
                        }
                      }
                    }}
                  >
                    {word}
                  </button>
                ))}
              </div>
              {checked && (
                <div className={`ls-feedback${correct ? ' is-correct' : ' is-wrong'}`}>
                  <span className="ls-feedback-icon">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      {correct
                        ? <path d="M2.5 7l3 3L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        : <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      }
                    </svg>
                  </span>
                  <span>
                    {correct ? 'Correct!' : (
                      <span className="ls-feedback-expected">
                        The answer is <b>{slide.answers.join(', ')}</b>
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {slide.type === 'fill' && (
            <div className="ls-slide">
              <div className="ls-eyebrow">Fill in the blank</div>
              <h2 className="ls-h ls-mc-prompt">{slide.prompt}</h2>
              <p className="ls-en-target">{slide.english}</p>
              <div className="ls-sentence">
                {slide.sentence.map((part, i) =>
                  part === '_' ? (
                    <input
                      key={i}
                      className={`ls-input${checked ? (correct ? ' is-correct' : ' is-wrong') : ''}`}
                      value={fillValue}
                      onChange={e => setFillValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !checked) checkFill(slide as FillSlide); }}
                      disabled={checked}
                      placeholder="type here"
                      autoFocus
                      size={Math.max(6, fillValue.length + 2)}
                    />
                  ) : (
                    <span key={i} className="ls-sent-word">{part}</span>
                  )
                )}
              </div>
              {slide.hint && (
                <p className="ls-hint">
                  <span className="ls-hint-mark">?</span>
                  {slide.hint}
                </p>
              )}
              {checked && (
                <div className={`ls-feedback${correct ? ' is-correct' : ' is-wrong'}`}>
                  <span className="ls-feedback-icon">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      {correct
                        ? <path d="M2.5 7l3 3L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        : <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      }
                    </svg>
                  </span>
                  <span>
                    {correct ? 'Correct!' : (
                      <span className="ls-feedback-expected">
                        The answer is <b>{slide.answer}</b>
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {slide.type === 'done' && (
            <div className="ls-slide ls-done">
              <div className="ls-done-medal" aria-label="Lesson complete">
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
                  <circle cx="36" cy="36" r="34" fill="var(--accent-ghost)" stroke="var(--accent)" strokeWidth="2"/>
                  <path d="M22 36l10 10 18-18" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="ls-done-title">{slide.title}</h2>
              <div className="ls-done-stats">
                {slide.stats.map((s, i) => (
                  <div key={i} className="ls-done-stat">
                    <span className="ls-done-num">{s.num}</span>
                    <span className="ls-done-lbl">{s.lbl}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="ls-foot">
        <button className="ls-prev" onClick={goPrev} disabled={idx === 0}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Back</span>
        </button>

        <span className="ls-foot-count">
          {idx + 1} <span>/</span> {total}
        </span>

        {slide.type === 'fill' && !checked ? (
          <button
            className="ls-cta"
            disabled={!fillValue.trim()}
            onClick={() => checkFill(slide as FillSlide)}
          >
            Check
          </button>
        ) : slide.type === 'done' ? (
          <button className="ls-cta" onClick={() => navigate('/')}>
            Back to lessons
          </button>
        ) : (
          <button
            className={`ls-cta${correct === true ? ' is-ok' : correct === false ? ' is-wrong' : ''}`}
            disabled={!canContinue}
            onClick={goNext}
          >
            {correct === false ? 'Got it' : idx === total - 2 ? 'Finish' : 'Continue'}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </footer>
    </div>
  );
}
