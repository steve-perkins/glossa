export type SrsResult = 'wrong' | 'correct' | 'easy';

export interface SrsState {
  ease: number;
  intervalDays: number;
  repetitions: number;
  dueAt: Date;
}

const RESULT_QUALITY: Record<SrsResult, number> = {
  wrong: 1,
  correct: 3,
  easy: 5,
};

export function computeNextSrs(state: SrsState | null, result: SrsResult): SrsState {
  const q = RESULT_QUALITY[result];
  const now = new Date();

  if (!state) {
    const intervalDays = q >= 3 ? 1 : 0.5;
    return {
      ease: 2.5,
      intervalDays,
      repetitions: q >= 3 ? 1 : 0,
      dueAt: addDays(now, intervalDays),
    };
  }

  if (q < 3) {
    return {
      ease: Math.max(1.3, state.ease - 0.2),
      intervalDays: 1,
      repetitions: 0,
      dueAt: addDays(now, 1),
    };
  }

  const newEase = Math.max(1.3, state.ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  let newInterval: number;
  if (state.repetitions === 0) newInterval = 1;
  else if (state.repetitions === 1) newInterval = 6;
  else newInterval = state.intervalDays * newEase;

  return {
    ease: newEase,
    intervalDays: newInterval,
    repetitions: state.repetitions + 1,
    dueAt: addDays(now, newInterval),
  };
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}
