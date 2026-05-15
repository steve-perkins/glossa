// Units list with expandable lesson rows + lesson detail card

const { useState: useStateU } = React;

function unitProgress(unit) {
  const total = unit.lessons.length;
  const done = unit.lessons.filter((l) => l.status === "done").length;
  const isFullyDone = done === total;
  const inProgress = unit.lessons.some((l) => l.status === "current");
  return { total, done, pct: Math.round((done / total) * 100), isFullyDone, inProgress };
}

function unitState(unit) {
  if (unit.lessons.every((l) => l.status === "done")) return "done";
  if (unit.lessons.some((l) => l.status === "current" || l.status === "done")) return "current";
  return "locked";
}

function UnitsList({ units, layout, density }) {
  // Auto-open the unit that's in progress (or the first one)
  const initial = (() => {
    const idx = units.findIndex((u) => unitState(u) === "current");
    return idx === -1 ? 0 : idx;
  })();
  const [openIdx, setOpenIdx] = useStateU(initial);

  return (
    <div className={"g-units g-units--" + density}>
      {units.map((u, i) => {
        const p = unitProgress(u);
        const state = unitState(u);
        const isOpen = openIdx === i;
        return (
          <article
            key={u.id}
            className={
              "g-unit" +
              (isOpen ? " is-open" : "") +
              " is-" + state
            }
          >
            <button
              className="g-unit-head"
              onClick={() => setOpenIdx(isOpen ? -1 : i)}
              aria-expanded={isOpen}
            >
              <span className="g-unit-num">
                <span className="g-unit-num-inner">
                  {state === "done" ? (
                    <svg viewBox="0 0 16 16" width="16" height="16">
                      <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : state === "locked" ? (
                    <svg viewBox="0 0 16 16" width="14" height="14">
                      <rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor" />
                      <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" fill="none" />
                    </svg>
                  ) : (
                    <span className="g-unit-numtext">{i + 1}</span>
                  )}
                </span>
              </span>

              <span className="g-unit-meta">
                <span className="g-unit-eyebrow">
                  Unit {i + 1}
                  <span className="g-unit-sep" aria-hidden="true">·</span>
                  <span className="g-unit-status">
                    {state === "done"
                      ? "Completed"
                      : state === "current"
                      ? `${p.done} of ${p.total} lessons`
                      : "Locked"}
                  </span>
                </span>
                <span className="g-unit-title">{u.title}</span>
                <span className="g-unit-sub">{u.subtitle}</span>
              </span>

              <span className="g-unit-progress" aria-hidden="true">
                <Ring pct={p.pct} state={state} />
              </span>

              <span className="g-unit-chev" aria-hidden="true">
                <svg viewBox="0 0 12 12" width="14" height="14">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>

            {isOpen && (
              <div className={"g-lessons g-lessons--" + layout}>
                {layout === "path" ? (
                  <PathLayout lessons={u.lessons} />
                ) : layout === "grid" ? (
                  <GridLayout lessons={u.lessons} />
                ) : (
                  <ListLayout lessons={u.lessons} />
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

// Progress ring
function Ring({ pct, state }) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg viewBox="0 0 36 36" width="36" height="36" className="g-ring">
      <circle cx="18" cy="18" r={r} className="g-ring-track" />
      {state !== "locked" && (
        <circle
          cx="18"
          cy="18"
          r={r}
          className={"g-ring-fill is-" + state}
          strokeDasharray={`${dash} ${c}`}
          strokeDashoffset={c / 4}
          transform="rotate(-90 18 18)"
        />
      )}
      <text x="18" y="21" textAnchor="middle" className="g-ring-text">
        {state === "locked" ? "" : `${pct}%`}
      </text>
    </svg>
  );
}

// ─── Lesson layouts ───

function ListLayout({ lessons }) {
  return (
    <ol className="g-list">
      {lessons.map((l, i) => (
        <li key={i}>
          <LessonRow lesson={l} index={i} total={lessons.length} />
        </li>
      ))}
    </ol>
  );
}

function GridLayout({ lessons }) {
  return (
    <div className="g-grid">
      {lessons.map((l, i) => (
        <LessonCard key={i} lesson={l} index={i} />
      ))}
    </div>
  );
}

function PathLayout({ lessons }) {
  return (
    <div className="g-path">
      {lessons.map((l, i) => {
        const offset = [0, 1, 2, 1, 0, -1, -2, -1][i % 8];
        return (
          <div key={i} className="g-path-row" style={{ "--offset": offset }}>
            {i > 0 && <span className={"g-path-line is-" + lessons[i - 1].status} aria-hidden="true" />}
            <LessonNode lesson={l} index={i} />
          </div>
        );
      })}
    </div>
  );
}

// ─── Lesson UI atoms ───

function LessonRow({ lesson, index, total }) {
  return (
    <button
      className={"g-row is-" + lesson.status}
      disabled={lesson.status === "locked"}
      onClick={() => { if (lesson.status !== "locked") window.location.href = "Lesson.html"; }}
    >
      <span className="g-row-bullet">
        <StatusIcon status={lesson.status} index={index} />
      </span>
      <span className="g-row-text">
        <span className="g-row-title">{lesson.title}</span>
        <span className="g-row-desc">{lesson.desc}</span>
      </span>
      {lesson.status === "current" ? (
        <span className="g-row-cta">Continue →</span>
      ) : lesson.status === "next" ? (
        <span className="g-row-cta is-ghost">Start</span>
      ) : lesson.status === "done" ? (
        <span className="g-row-cta is-ghost">Review</span>
      ) : null}
    </button>
  );
}

function LessonCard({ lesson, index }) {
  return (
    <button
      className={"g-card is-" + lesson.status}
      disabled={lesson.status === "locked"}
      onClick={() => { if (lesson.status !== "locked") window.location.href = "Lesson.html"; }}
    >
      <span className="g-card-top">
        <span className="g-card-num">Lesson {index + 1}</span>
        <StatusBadge status={lesson.status} />
      </span>
      <span className="g-card-title">{lesson.title}</span>
      <span className="g-card-desc">{lesson.desc}</span>
      {lesson.status === "current" && (
        <span className="g-card-foot">
          <span className="g-card-cta">Continue →</span>
        </span>
      )}
    </button>
  );
}

function LessonNode({ lesson, index }) {
  return (
    <button
      className={"g-node is-" + lesson.status}
      disabled={lesson.status === "locked"}
      title={lesson.title}
      onClick={() => { if (lesson.status !== "locked") window.location.href = "Lesson.html"; }}
    >
      <span className="g-node-circle">
        <StatusIcon status={lesson.status} index={index} />
      </span>
      <span className="g-node-info">
        <span className="g-node-num">Lesson {index + 1}</span>
        <span className="g-node-title">{lesson.title}</span>
        <span className="g-node-desc">{lesson.desc}</span>
      </span>
    </button>
  );
}

function StatusIcon({ status, index }) {
  if (status === "done") {
    return (
      <svg viewBox="0 0 16 16" width="16" height="16">
        <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "locked") {
    return (
      <svg viewBox="0 0 16 16" width="12" height="12">
        <rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor" />
        <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" fill="none" />
      </svg>
    );
  }
  if (status === "current") {
    return (
      <svg viewBox="0 0 16 16" width="12" height="12">
        <path d="M5 4l7 4-7 4z" fill="currentColor" />
      </svg>
    );
  }
  return <span className="g-row-num">{index + 1}</span>;
}

function StatusBadge({ status }) {
  if (status === "done") return <span className="g-badge is-done">Done</span>;
  if (status === "current") return <span className="g-badge is-current">In progress</span>;
  if (status === "locked") return <span className="g-badge is-locked">Locked</span>;
  return <span className="g-badge is-next">Up next</span>;
}

function KindPill({ kind }) {
  return <span className={"g-kind g-kind--" + kind.toLowerCase()}>{kind}</span>;
}

window.UnitsList = UnitsList;
