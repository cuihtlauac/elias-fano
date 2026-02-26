import { useState, useCallback, useMemo } from "react";
import { STEPS, SECTIONS, type Step } from "./steps";

function sectionForIndex(globalIndex: number) {
  let offset = 0;
  for (let i = 0; i < SECTIONS.length; i++) {
    const section = SECTIONS[i];
    const end = offset + section.steps.length - 1;
    if (globalIndex <= end) {
      return {
        sectionIndex: i,
        section,
        localStepIndex: globalIndex - offset,
        sectionStartIndex: offset,
        sectionEndIndex: end,
      };
    }
    offset += section.steps.length;
  }
  // Fallback to last section
  const last = SECTIONS[SECTIONS.length - 1];
  const start = STEPS.length - last.steps.length;
  return {
    sectionIndex: SECTIONS.length - 1,
    section: last,
    localStepIndex: globalIndex - start,
    sectionStartIndex: start,
    sectionEndIndex: STEPS.length - 1,
  };
}

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

  // Section-aware state
  const sectionInfo = useMemo(() => sectionForIndex(stepIndex), [stepIndex]);
  const sectionName = sectionInfo.section.name;
  const localStepIndex = sectionInfo.localStepIndex;
  const sectionStepCount = sectionInfo.section.steps.length;
  const sectionIndex = sectionInfo.sectionIndex;
  const isFirstSection = sectionIndex === 0 && localStepIndex === 0;
  const isLastSection =
    sectionIndex === SECTIONS.length - 1 &&
    localStepIndex === sectionInfo.section.steps.length - 1;

  const nextSection = useCallback(() => {
    setStepIndex((i) => {
      const info = sectionForIndex(i);
      if (info.sectionIndex < SECTIONS.length - 1) {
        return info.sectionEndIndex + 1;
      }
      return i;
    });
  }, []);

  const prevSection = useCallback(() => {
    setStepIndex((i) => {
      const info = sectionForIndex(i);
      if (info.localStepIndex > 0) {
        // Mid-section: go to section start
        return info.sectionStartIndex;
      }
      if (info.sectionIndex > 0) {
        // At section start: go to previous section's start
        return sectionForIndex(info.sectionStartIndex - 1).sectionStartIndex;
      }
      return i;
    });
  }, []);

  return {
    step,
    stepIndex,
    isFirst,
    isLast,
    next,
    prev,
    goTo,
    reached,
    sectionName,
    localStepIndex,
    sectionStepCount,
    sectionIndex,
    isFirstSection,
    isLastSection,
    nextSection,
    prevSection,
  };
}
