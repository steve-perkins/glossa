// Lesson slide components — 4 types + a done screen
// All are stateful interactive components.

const { useState: useStateS, useRef: useRefS, useEffect: useEffectS } = React;

// ─── Grammar slide ─────────────────────────────────────────────────────
function GrammarSlide({ slide, onCheck }) {
  useEffectS(() => onCheck(true), []);
  return (
    <div className="ls-slide ls-grammar">
      <h2 className="ls-h">{slide.title}</h2>
      <div className="ls-prose">
        {slide.body.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      {slide.callout && (
        <aside className="ls-callout">
          <span className="ls-callout-mark">!</span>
          <span>{slide.callout}</span>
        </aside>
      )}
      {slide.table && (
        <div className="ls-tablewrap">
          <table className="ls-table">
            <thead>
              <tr>{slide.table.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {slide.table.rows.map((row, i) => (
                <tr key={i}>{row.map((c, j) => <td key={j}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Vocabulary slide ──────────────────────────────────────────────────
function VocabSlide({ slide, onCheck }) {
  useEffectS(() => onCheck(true), []);

  return (
    <div className="ls-slide ls-vocab">
      <span className="ls-eyebrow">New word</span>
      <div className="ls-vocab-main">
        <div className="ls-vocab-text">
          <h2 className="ls-word">{slide.word}</h2>
          <span className="ls-romanization">{slide.romanization}</span>
          <span className="ls-translation">{slide.translation}</span>
          <ListenButton text={slide.word.replace(" · ", ", ")} />
        </div>
        <div className="ls-vocab-photo" aria-hidden="true">
          <PhotoSlot label={slide.photoLabel} />
        </div>
      </div>
      <div className="ls-example">
        <div className="ls-example-head">
          <span className="ls-example-label">In context</span>
          <ListenButton text={slide.example.target} small />
        </div>
        <span className="ls-example-target">{slide.example.target}</span>
        <span className="ls-example-en">{slide.example.english}</span>
      </div>
    </div>
  );
}

// Reusable Listen button — uses Web Speech API for Greek pronunciation
function ListenButton({ text, small }) {
  const [playing, setPlaying] = useStateS(false);

  function play() {
    setPlaying(true);
    if ("speechSynthesis" in window) {
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "el-GR";
        u.rate = 0.85;
        u.onend = () => setPlaying(false);
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
      } catch (_) {
        setTimeout(() => setPlaying(false), 1200);
      }
    } else {
      setTimeout(() => setPlaying(false), 1200);
    }
  }

  return (
    <button
      className={"ls-audio" + (small ? " is-small" : "") + (playing ? " is-playing" : "")}
      onClick={play}
      aria-label="Play audio"
    >
      <svg viewBox="0 0 24 24" width={small ? 14 : 18} height={small ? 14 : 18} aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
        <path d="M16 8c1.5 1 1.5 7 0 8" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M19 5c3 2 3 12 0 14" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity={playing ? 1 : 0.5} />
      </svg>
      <span>{playing ? "Playing…" : "Listen"}</span>
    </button>
  );
}

function PhotoSlot({ label }) {
  return (
    <div className="ls-photo">
      <svg viewBox="0 0 200 240" preserveAspectRatio="none" className="ls-photo-stripe">
        <defs>
          <pattern id="ls-stripe" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="7" height="14" fill="currentColor" opacity="0.55" />
            <rect x="7" width="7" height="14" fill="currentColor" opacity="0.30" />
          </pattern>
        </defs>
        <rect width="200" height="240" fill="url(#ls-stripe)" />
      </svg>
      <span className="ls-photo-caption">photo · {label}</span>
    </div>
  );
}

// ─── Multiple choice (drop-into-blanks) ────────────────────────────────
function MultipleChoiceSlide({ slide, onCheck, checked, correct }) {
  // filled[blankIndex] = bank index (or null)
  const blanks = slide.sentence.filter((s) => s === "_").length;
  const [filled, setFilled] = useStateS(() => Array(blanks).fill(null));

  // Once all filled, mark as ready to check
  useEffectS(() => {
    onCheck(filled.every((x) => x !== null));
  }, [filled.join(",")]);

  function pickBank(i) {
    if (checked) return;
    if (filled.includes(i)) return; // already used
    const next = [...filled];
    const slot = next.indexOf(null);
    if (slot === -1) return;
    next[slot] = i;
    setFilled(next);
  }
  function clearBlank(slotIdx) {
    if (checked) return;
    const next = [...filled];
    next[slotIdx] = null;
    setFilled(next);
  }

  // Render sentence with blanks
  let blankI = 0;
  const sentenceNodes = slide.sentence.map((tok, i) => {
    if (tok === "_") {
      const idx = blankI++;
      const bankIdx = filled[idx];
      const word = bankIdx === null ? null : slide.bank[bankIdx];
      const isCorrectThis = checked && word === slide.answers[idx];
      const isWrongThis = checked && word !== slide.answers[idx];
      return (
        <button
          key={i}
          className={
            "ls-blank" +
            (word ? " is-filled" : " is-empty") +
            (isCorrectThis ? " is-correct" : "") +
            (isWrongThis ? " is-wrong" : "")
          }
          onClick={() => clearBlank(idx)}
        >
          {checked && isWrongThis ? slide.answers[idx] : (word || "—")}
        </button>
      );
    }
    return <span key={i} className="ls-sent-word">{tok}</span>;
  });

  return (
    <div className="ls-slide ls-mc">
      <span className="ls-eyebrow">Practice</span>
      <h2 className="ls-h ls-mc-prompt">{slide.prompt}</h2>
      <p className="ls-en-target">{slide.english}</p>
      <div className="ls-sentence">{sentenceNodes}</div>
      <div className="ls-bank">
        {slide.bank.map((w, i) => (
          <button
            key={i}
            className={"ls-chip" + (filled.includes(i) ? " is-used" : "")}
            onClick={() => pickBank(i)}
            disabled={checked}
          >
            {w}
          </button>
        ))}
      </div>
      {checked && (
        <FeedbackBar correct={correct} expected={slide.answers.join(" + ")} />
      )}
    </div>
  );
}

// ─── Fill in the blank (typed) ─────────────────────────────────────────
function FillBlankSlide({ slide, onCheck, checked, correct }) {
  const [val, setVal] = useStateS("");
  const inputRef = useRefS(null);

  useEffectS(() => onCheck(val.trim().length > 0), [val]);
  useEffectS(() => { if (inputRef.current) inputRef.current.focus(); }, []);

  // Render sentence with input
  const nodes = slide.sentence.map((tok, i) => {
    if (tok === "_") {
      return (
        <input
          key={i}
          ref={inputRef}
          className={
            "ls-input" +
            (checked && correct ? " is-correct" : "") +
            (checked && !correct ? " is-wrong" : "")
          }
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="…"
          autoComplete="off"
          spellCheck={false}
          disabled={checked && correct}
          style={{ width: Math.max(val.length, 4) + 2 + "ch" }}
        />
      );
    }
    return <span key={i} className="ls-sent-word">{tok}</span>;
  });

  return (
    <div className="ls-slide ls-fill">
      <span className="ls-eyebrow">Type your answer</span>
      <h2 className="ls-h ls-mc-prompt">{slide.prompt}</h2>
      <p className="ls-en-target">{slide.english}</p>
      <div className="ls-sentence">{nodes}</div>
      {slide.hint && (
        <p className="ls-hint">
          <span className="ls-hint-mark">?</span> {slide.hint}
        </p>
      )}
      {checked && (
        <FeedbackBar correct={correct} expected={slide.answer} />
      )}
    </div>
  );
}

// ─── Done screen ───────────────────────────────────────────────────────
function DoneSlide({ slide, onCheck }) {
  useEffectS(() => onCheck(true), []);
  return (
    <div className="ls-slide ls-done">
      <div className="ls-done-medal" aria-hidden="true">
        <svg viewBox="0 0 64 64" width="80" height="80">
          <circle cx="32" cy="32" r="26" fill="var(--accent)" />
          <path d="M22 32l8 8 14-16" stroke="var(--cream)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
  );
}

// ─── Feedback bar ──────────────────────────────────────────────────────
function FeedbackBar({ correct, expected }) {
  return (
    <div className={"ls-feedback" + (correct ? " is-correct" : " is-wrong")}>
      <span className="ls-feedback-icon">
        {correct ? (
          <svg viewBox="0 0 16 16" width="16" height="16"><path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        ) : (
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
        )}
      </span>
      <span className="ls-feedback-text">
        {correct ? "Spot on." : "Not quite."}
        {!correct && (
          <span className="ls-feedback-expected"> The answer is <b>{expected}</b>.</span>
        )}
      </span>
    </div>
  );
}

window.GrammarSlide = GrammarSlide;
window.VocabSlide = VocabSlide;
window.MultipleChoiceSlide = MultipleChoiceSlide;
window.FillBlankSlide = FillBlankSlide;
window.DoneSlide = DoneSlide;
