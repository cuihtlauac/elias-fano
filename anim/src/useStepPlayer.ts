import { useState, useCallback } from "react";
import { STEPS, type Step } from "./steps";

export function useStepPlayer() {
  const [stepIndex, setStepIndex] = useState(0);

  const step: Step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  const next = useCallback(
    () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1)),
    []
  );
  const prev = useCallback(
    () => setStepIndex((i) => Math.max(i - 1, 0)),
    []
  );
  const goTo = useCallback(
    (s: Step) => setStepIndex(STEPS.indexOf(s)),
    []
  );

  // Which steps have been reached (for cumulative display)
  const reached = useCallback(
    (s: Step) => STEPS.indexOf(s) <= stepIndex,
    [stepIndex]
  );

  return { step, stepIndex, isFirst, isLast, next, prev, goTo, reached };
}
