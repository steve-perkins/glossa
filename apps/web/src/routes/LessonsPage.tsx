import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CefrLevel } from '@glossa/shared';
import { useLanguageContent } from '../hooks/useContent';

interface LessonsPageProps {
  langId: string;
}

type Layout = 'list' | 'grid' | 'path';

const ALL_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function LessonsPage({ langId }: LessonsPageProps) {
  const { data: content } = useLanguageContent(langId);
  const navigate = useNavigate();
  const availableLevels = content?.levels ?? [];
  const [activeLevel, setActiveLevel] = useState<CefrLevel>('A1');
  const [layout, setLayout] = useState<Layout>('list');
  const [openUnits, setOpenUnits] = useState<Set<string>>(new Set(['greek-people-and-family', 'spanish-greetings']));

  if (!content) return null;

  const units = content.unitsByLevel[activeLevel] ?? [];

  function toggleUnit(id: string) {
    setOpenUnits(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <main className="g-main">
      {/* Continue card */}
      <div className="g-continue">
        <div className="g-continue-inner">
          <div>
            <div className="g-continue-eyebrow">Continue where you left off</div>
            <h2 className="g-continue-title">This is my…</h2>
            <div className="g-continue-meta">
              <span>People &amp; Family</span>
              <span className="g-dot" />
              <span>Lesson 3 of 6</span>
              <span className="g-dot" />
              <span>~8 min</span>
            </div>
          </div>
          <button className="g-continue-cta" onClick={() => navigate('/lesson/greek-people-and-family-this-is-my')}>
            Continue
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="g-continue-art" aria-hidden="true">
          <svg className="g-meander" viewBox="0 0 400 160" preserveAspectRatio="xMaxYMid slice" fill="none">
            <path d="M400 0 L360 0 L360 40 L320 40 L320 80 L360 80 L360 120 L320 120 L320 160 L280 160 L280 120 L240 120 L240 80 L280 80 L280 40 L240 40 L240 0 L200 0 L200 40 L160 40 L160 80 L200 80 L200 120 L160 120 L160 160" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      </div>

      {/* Level + stats */}
      <div className="g-level-section">
        <div className="g-level-head">
          <div>
            <h1 className="g-page-title">
              {content.language.name}
              <span className="g-page-title-native">{content.language.nativeName}</span>
            </h1>
            <p className="g-page-sub">Track your progress through every unit and lesson.</p>
          </div>
          <div className="g-level-stats">
            <div className="g-stat">
              <span className="g-stat-num">3</span>
              <span className="g-stat-lbl">lessons<br/>done</span>
            </div>
            <div className="g-stat">
              <span className="g-stat-num">24</span>
              <span className="g-stat-lbl">words<br/>learned</span>
            </div>
          </div>
        </div>

        <div className="g-levels">
          {ALL_LEVELS.map(code => {
            const hasContent = availableLevels.includes(code);
            return (
              <button
                key={code}
                className={`g-level${activeLevel === code ? ' is-active' : ''}${!hasContent ? ' is-empty' : ''}`}
                disabled={!hasContent}
                onClick={() => hasContent && setActiveLevel(code)}
              >
                <span className="g-level-code">{code}</span>
                <span className="g-level-name">
                  {code === 'A1' ? 'Beginner' : code === 'A2' ? 'Elementary' :
                   code === 'B1' ? 'Intermediate' : code === 'B2' ? 'Upper-Int.' :
                   code === 'C1' ? 'Advanced' : 'Proficient'}
                </span>
                {hasContent && (
                  <span className="g-level-bar">
                    <span className="g-level-bar-fill" style={{ width: activeLevel === code ? '40%' : '0%' }} />
                  </span>
                )}
                {!hasContent && <span className="g-level-soon">soon</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Units */}
      <div className="g-units-section">
        <div className="g-units-head">
          <div>
            <h2 className="g-section-title">{activeLevel} Units</h2>
            <p className="g-section-sub">{units.length} units · {units.reduce((s, u) => s + u.lessons.length, 0)} lessons</p>
          </div>
          <div className="g-layout-toggle" role="group" aria-label="Layout">
            {(['list', 'grid', 'path'] as Layout[]).map(v => (
              <button
                key={v}
                className={`g-layout-btn${layout === v ? ' is-active' : ''}`}
                onClick={() => setLayout(v)}
              >
                {v === 'list' && <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 4h10M2 7h10M2 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                {v === 'grid' && <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>}
                {v === 'path' && <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="3" r="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="7" cy="11" r="2" stroke="currentColor" strokeWidth="1.5"/></svg>}
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className={`g-units g-units--${layout === 'list' ? 'regular' : layout}`}>
          {units.map((unit, ui) => {
            const isOpen = openUnits.has(unit.id);
            const doneCount = unit.lessons.filter(l => l.status === 'done').length;
            const hasCurrent = unit.lessons.some(l => l.status === 'current');
            const allDone = doneCount === unit.lessons.length;
            const unitClass = `g-unit${isOpen ? ' is-open' : ''}${allDone ? ' is-done' : hasCurrent ? ' is-current' : ''}`;

            return (
              <div key={unit.id} className={unitClass}>
                <button className="g-unit-head" onClick={() => toggleUnit(unit.id)}>
                  <span className="g-unit-num">{ui + 1}</span>
                  <span className="g-unit-meta">
                    <span className="g-unit-eyebrow">
                      <span className="g-unit-status">{allDone ? 'Complete' : hasCurrent ? 'In progress' : 'Locked'}</span>
                      <span className="g-unit-sep">·</span>
                      <span>{unit.lessons.length} lessons</span>
                    </span>
                    <span className="g-unit-title">{unit.title}</span>
                    <span className="g-unit-sub">{unit.subtitle}</span>
                  </span>
                  <span className="g-unit-progress" aria-hidden="true">
                    <svg className="g-ring" width="44" height="44" viewBox="0 0 44 44">
                      <circle className="g-ring-track" cx="22" cy="22" r="18"/>
                      <circle
                        className={`g-ring-fill${allDone ? ' is-done' : ''}`}
                        cx="22" cy="22" r="18"
                        strokeDasharray={`${(doneCount / unit.lessons.length) * 113} 113`}
                        strokeDashoffset="28"
                        transform="rotate(-90 22 22)"
                      />
                      <text className="g-ring-text" x="22" y="26" textAnchor="middle">
                        {doneCount}/{unit.lessons.length}
                      </text>
                    </svg>
                  </span>
                  <svg className="g-unit-chev" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {isOpen && (
                  <div className="g-lessons">
                    {layout === 'grid' ? (
                      <div className="g-grid">
                        {unit.lessons.map((lesson, li) => (
                          <button
                            key={lesson.id}
                            className={`g-card${lesson.status === 'current' ? ' is-current' : lesson.status === 'done' ? ' is-done' : lesson.status === 'locked' ? ' is-locked' : ''}`}
                            disabled={lesson.status === 'locked'}
                            onClick={() => lesson.status !== 'locked' && navigate(`/lesson/${lesson.id}`)}
                          >
                            <div className="g-card-top">
                              <span className="g-card-title">{lesson.title}</span>
                              <span className="g-card-num">{li + 1}</span>
                            </div>
                            <span className="g-card-desc">{lesson.description}</span>
                            <div className="g-card-foot">
                              <span className="g-card-cta">
                                {lesson.status === 'done' ? 'Review' : lesson.status === 'current' ? 'Continue' : lesson.status === 'next' ? 'Start' : 'Locked'}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : layout === 'path' ? (
                      <div className="g-path">
                        {unit.lessons.map((lesson, li) => (
                          <div key={lesson.id} className="g-path-row" style={{ '--offset': (li % 2 === 0 ? 0 : 1) } as React.CSSProperties}>
                            {li > 0 && <div className={`g-path-line${lesson.status === 'done' ? ' is-done' : lesson.status === 'current' ? ' is-current' : ''}`} />}
                            <button
                              className={`g-node${lesson.status === 'done' ? ' is-done' : lesson.status === 'current' ? ' is-current' : lesson.status === 'next' ? ' is-next' : ' is-locked'}`}
                              disabled={lesson.status === 'locked'}
                              onClick={() => lesson.status !== 'locked' && navigate(`/lesson/${lesson.id}`)}
                            >
                              <span className="g-node-circle">
                                {lesson.status === 'done' ? (
                                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                                    <path d="M4 9l3.5 3.5L14 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                ) : lesson.status === 'locked' ? (
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                    <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                                    <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.5"/>
                                  </svg>
                                ) : (
                                  <span style={{ fontSize: 14, fontWeight: 700 }}>{li + 1}</span>
                                )}
                              </span>
                              <span className="g-node-info">
                                <span className="g-node-num">Lesson {li + 1}</span>
                                <span className="g-node-title">{lesson.title}</span>
                                <span className="g-node-desc">{lesson.description}</span>
                              </span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul className="g-list">
                        {unit.lessons.map((lesson, li) => (
                          <li key={lesson.id}>
                            <button
                              className={`g-row${lesson.status === 'done' ? ' is-done' : lesson.status === 'current' ? ' is-current' : lesson.status === 'next' ? ' is-next' : ' is-locked'}`}
                              disabled={lesson.status === 'locked'}
                              onClick={() => lesson.status !== 'locked' && navigate(`/lesson/${lesson.id}`)}
                            >
                              <span className="g-row-bullet">
                                {lesson.status === 'done' ? (
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                    <path d="M2.5 6l2.5 2.5L9.5 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                ) : lesson.status === 'locked' ? (
                                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                                    <rect x="1" y="4.5" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                                    <path d="M3 4.5V3a2 2 0 014 0v1.5" stroke="currentColor" strokeWidth="1.3"/>
                                  </svg>
                                ) : (
                                  li + 1
                                )}
                              </span>
                              <span className="g-row-text">
                                <span className="g-row-title">{lesson.title}</span>
                                <span className="g-row-desc">{lesson.description}</span>
                              </span>
                              <span className={`g-row-cta${lesson.status === 'done' || lesson.status === 'next' ? ' is-ghost' : ''}`}>
                                {lesson.status === 'done' ? 'Review' : lesson.status === 'current' ? 'Continue →' : lesson.status === 'next' ? 'Start' : ''}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Culture card */}
      <div className="g-culture">
        <div className="g-culture-text">
          <div className="g-culture-eyebrow">Culture</div>
          <h3 className="g-culture-title">
            {langId === 'greek' ? 'The kafeneion — heart of Greek village life' : 'La tertulia — the art of Spanish conversation'}
          </h3>
          <p>
            {langId === 'greek'
              ? 'Every Greek village has its kafeneion — a coffee house where locals debate politics, play backgammon, and watch the world go by. Understanding this space unlocks a key part of everyday Greek social life.'
              : 'La tertulia is an informal gathering of friends to discuss art, culture, and ideas. A cornerstone of Spanish intellectual life, it shows up in cafés, bookshops, and living rooms across the Spanish-speaking world.'}
          </p>
        </div>
        <div className="g-culture-tile" aria-hidden="true">
          {langId === 'greek' ? 'κ' : 't'}
        </div>
      </div>
    </main>
  );
}
