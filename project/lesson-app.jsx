// Lesson app — slide engine, progress, exit

const { useState: useStateLA, useEffect: useEffectLA, useMemo: useMemoLA, useRef: useRefS } = React;

function LessonApp() {
  const lesson = window.GLOSSA_LESSON;
  const [idx, setIdx] = useStateLA(0);
  const [readyToCheck, setReadyToCheck] = useStateLA(false);
  const [checked, setChecked] = useStateLA(false);
  const [correct, setCorrect] = useStateLA(false);
  // status per slide: 'todo' | 'correct' | 'wrong' | 'seen'
  const [status, setStatus] = useStateLA(() => lesson.slides.map(() => "todo"));

  const slide = lesson.slides[idx];
  const isExercise = slide.type === "mc" || slide.type === "fill";
  const isLast = idx === lesson.slides.length - 1;

  // Reset transient state on slide change
  useEffectLA(() => {
    setReadyToCheck(false);
    setChecked(false);
    setCorrect(false);
  }, [idx]);

  function checkAnswer() {
    if (slide.type === "mc") {
      // We don't have direct access to filled state here; the slide renders
      // its own check via window.__currentMC. Simpler: have child slides
      // manage their own check via callback. We'll trigger via a custom event.
      window.dispatchEvent(new CustomEvent("ls-check"));
    } else if (slide.type === "fill") {
      window.dispatchEvent(new CustomEvent("ls-check"));
    }
  }

  function onSlideResult(isCorrect) {
    setChecked(true);
    setCorrect(isCorrect);
    setStatus((s) => {
      const next = [...s];
      next[idx] = isCorrect ? "correct" : "wrong";
      return next;
    });
  }

  function next() {
    if (isLast) {
      window.location.href = "Glossa.html";
      return;
    }
    setStatus((s) => {
      const next = [...s];
      if (next[idx] === "todo") next[idx] = "seen";
      return next;
    });
    setIdx((i) => Math.min(i + 1, lesson.slides.length - 1));
  }

  function prev() {
    setIdx((i) => Math.max(i - 1, 0));
  }

  function exit() {
    window.location.href = "Glossa.html";
  }

  // Keyboard
  useEffectLA(() => {
    function onKey(e) {
      if (e.key === "Escape") exit();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Enter") {
        if (isExercise && !checked && readyToCheck) checkAnswer();
        else if (!isExercise || (checked && correct) || (checked && !correct)) next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, checked, correct, readyToCheck, isExercise]);

  // CTA logic
  let cta = null;
  if (slide.type === "done") {
    cta = { label: "Back to lessons", action: exit, primary: true };
  } else if (!isExercise) {
    cta = { label: "Continue", action: next, primary: true };
  } else if (!checked) {
    cta = { label: "Check", action: checkAnswer, primary: true, disabled: !readyToCheck };
  } else if (checked && correct) {
    cta = { label: isLast ? "Finish" : "Continue", action: next, primary: true, tone: "ok" };
  } else {
    cta = { label: "Continue anyway", action: next, primary: true, tone: "wrong" };
  }

  // Slide router
  const SlideEl = ({
    grammar: window.GrammarSlide,
    vocab: window.VocabSlide,
    mc: window.MultipleChoiceSlide,
    fill: window.FillBlankSlide,
    done: window.DoneSlide,
  })[slide.type];

  return (
    <div className="ls-app">
      {/* Header: exit + progress */}
      <header className="ls-head">
        <button className="ls-exit" onClick={exit} aria-label="Exit lesson">
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <div className="ls-progress" aria-label={`Slide ${idx + 1} of ${lesson.slides.length}`}>
          {lesson.slides.map((_, i) => (
            <span
              key={i}
              className={
                "ls-pip" +
                (i === idx ? " is-current" : "") +
                (i < idx ? " is-past" : "") +
                (status[i] === "wrong" ? " is-wrong" : "") +
                (status[i] === "correct" ? " is-correct" : "")
              }
            />
          ))}
        </div>
        <div className="ls-meta">
          <span className="ls-meta-lang">{lesson.language} · {lesson.level}</span>
          <span className="ls-meta-title">{lesson.title}</span>
        </div>
      </header>

      {/* Slide stage */}
      <main className="ls-stage" key={idx}>
        <div className="ls-stage-inner">
          <SlideHost
            slide={slide}
            SlideEl={SlideEl}
            onCheck={setReadyToCheck}
            onResult={onSlideResult}
            checked={checked}
            correct={correct}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="ls-foot">
        <button className="ls-prev" onClick={prev} disabled={idx === 0} aria-label="Previous slide">
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>Back</span>
        </button>
        <span className="ls-foot-count">{idx + 1} <span>/</span> {lesson.slides.length}</span>
        <button
          className={"ls-cta is-" + (cta.tone || "primary")}
          disabled={cta.disabled}
          onClick={cta.action}
        >
          <span>{cta.label}</span>
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M5 3l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </footer>
    </div>
  );
}

// SlideHost — wraps the slide so MC/Fill can listen for the global "ls-check" event
// and report a result. Other slide types just pass through.
function SlideHost({ slide, SlideEl, onCheck, onResult, checked, correct }) {
  // For mc/fill, intercept onCheck of children: keep child stateful; we use
  // a different approach: render the child but with a wrapper that captures
  // the latest "answer" via context. To keep things simple, we instead extend
  // the slide components by passing a "registerCheck" prop.

  // We re-implement MC/Fill here as wrappers because we need access to internal
  // state to evaluate. The cleanest fix: hoist the answer into this host.
  if (slide.type === "mc") return <MCHost slide={slide} onCheck={onCheck} onResult={onResult} checked={checked} correct={correct}/>;
  if (slide.type === "fill") return <FillHost slide={slide} onCheck={onCheck} onResult={onResult} checked={checked} correct={correct}/>;
  return <SlideEl slide={slide} onCheck={onCheck} />;
}

// MC wrapper that owns state, listens for ls-check
function MCHost({ slide, onCheck, onResult, checked, correct }) {
  const blanks = slide.sentence.filter((s) => s === "_").length;
  const [filled, setFilled] = useStateLA(() => Array(blanks).fill(null));

  useEffectLA(() => onCheck(filled.every((x) => x !== null)), [filled.join(",")]);

  useEffectLA(() => {
    function handler() {
      const got = filled.map((bi) => bi === null ? "" : slide.bank[bi]);
      const ok = got.every((w, i) => w === slide.answers[i]);
      onResult(ok);
    }
    window.addEventListener("ls-check", handler);
    return () => window.removeEventListener("ls-check", handler);
  }, [filled.join(","), slide]);

  function pickBank(i) {
    if (checked) return;
    if (filled.includes(i)) return;
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
          {checked && isWrongThis ? slide.answers[idx] : (word || "·")}
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
      {checked && <FeedbackBar correct={correct} expected={slide.answers.join(" + ")} />}
    </div>
  );
}

function FillHost({ slide, onCheck, onResult, checked, correct }) {
  const [val, setVal] = useStateLA("");
  const ref = useRefS(null);

  useEffectLA(() => onCheck(val.trim().length > 0), [val]);
  useEffectLA(() => { if (ref.current) ref.current.focus(); }, []);
  useEffectLA(() => {
    function handler() {
      const ok = val.trim().toLowerCase() === slide.answer.trim().toLowerCase();
      onResult(ok);
    }
    window.addEventListener("ls-check", handler);
    return () => window.removeEventListener("ls-check", handler);
  }, [val, slide]);

  const nodes = slide.sentence.map((tok, i) => {
    if (tok === "_") {
      return (
        <input
          key={i}
          ref={ref}
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
      {checked && <FeedbackBar correct={correct} expected={slide.answer} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<LessonApp />);
