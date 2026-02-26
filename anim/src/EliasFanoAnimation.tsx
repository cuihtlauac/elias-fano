import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  UNSORTED,
  SORTED,
  ELEMENTS,
  UPPER_MERGED_X,
  UPPER_BAR_W,
  LOWER_BAR_W,
} from "./data";
import { useStepPlayer } from "./useStepPlayer";
import { STEP_LABELS } from "./steps";
import { NumberBox, BIN_Y, BIN_H, BIN_TEXT_Y, LOWER_CENTER_X } from "./NumberBox";
import { LowerBitsBar } from "./LowerBitsBar";
import { Buckets } from "./Buckets";

const SVG_W = 900;
const SVG_H = 450;

// Horizontal positions for 7 sorted boxes
const BOX_SPACING = 95;
const BOX_START_X = 200;
const BOX_Y = 40;

function positionFor(index: number) {
  return { x: BOX_START_X + index * BOX_SPACING, y: BOX_Y };
}

// Big-mode positions for step 0 (vertically centered, spread out)
const BIG_SPACING = 105;
const BIG_START_X = (SVG_W - 6 * BIG_SPACING) / 2; // center 7 items
const BIG_Y = SVG_H / 2 - 15; // vertically center the text

function bigPositionFor(index: number) {
  return { x: BIG_START_X + index * BIG_SPACING, y: BIG_Y };
}

// Lower-bits source positions: computed from NumberBox layout constants
function lowerBitsSourceFor(index: number, isSummary: boolean = false) {
  const pos = positionFor(index);
  const yOffset = isSummary ? 105 : 0;
  return {
    x: pos.x + LOWER_CENTER_X,
    y: pos.y + BIN_TEXT_Y + yOffset,
  };
}

export function EliasFanoAnimation() {
  const {
    step,
    isFirst,
    isLast,
    next,
    prev,
    reached,
    sectionName,
    localStepIndex,
    sectionStepCount,
    isFirstSection,
    isLastSection,
    nextSection,
    prevSection,
    sectionIndex,
  } = useStepPlayer();

  const isSummary = reached("summary");

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (e.shiftKey) nextSection();
        else next();
      } else if (e.key === "ArrowLeft") {
        if (e.shiftKey) prevSection();
        else prev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev, nextSection, prevSection]);

  // Determine order: unsorted or sorted
  const isSorted = reached("sorted");
  const displayOrder = isSorted ? SORTED : UNSORTED;

  return (
    <div>
      {/* Header */}
      <div className="header">
        <span className="header-title">Elias-Fano: {sectionName}</span>
        <span className="header-step">
          {STEP_LABELS[step]} — {sectionIndex + 1}.{localStepIndex}
        </span>
      </div>

      {/* SVG canvas */}
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} xmlns="http://www.w3.org/2000/svg">
        <rect width={SVG_W} height={SVG_H} fill="white" />

        {/* Legend (visible once we color-split) */}
        {reached("color-split") && (
          <motion.g 
            animate={{ y: isSummary ? 105 : 0 }}
            transition={{ type: "spring", stiffness: 60, damping: 20, delay: isSummary ? 0.5 : 0 }}
          >
            <g textAnchor="end">
              <text
                x={135}
                y={BOX_Y + BIN_Y + BIN_H / 2 - 4}
                fill="#d32f2f"
                fontFamily="Arial, sans-serif"
                fontWeight="bold"
                fontSize={13}
              >
                3 upper bits
              </text>
              <text
                x={135}
                y={BOX_Y + BIN_Y + BIN_H / 2 + 12}
                fill="#1565c0"
                fontFamily="Arial, sans-serif"
                fontWeight="bold"
                fontSize={13}
              >
                2 lower bits
              </text>
            </g>
            <text
              x={810}
              y={BOX_Y + BIN_Y + BIN_H / 2 + 4}
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
              fontSize={13}
            >
              <tspan fill="black">(</tspan>
              <tspan fill="#d32f2f">3</tspan>
              <tspan fill="black">{" + "}</tspan>
              <tspan fill="#1565c0">2</tspan>
              <tspan fill="black">{") \u00D7 7 = 35 bits"}</tspan>
            </text>
          </motion.g>
        )}

        {/* Number boxes */}
        {displayOrder.map((value, displayIndex) => {
          const elem = ELEMENTS.find((e) => e.value === value)!;
          const bigMode = !reached("sorted");
          const pos = bigMode
            ? bigPositionFor(displayIndex)
            : positionFor(displayIndex);
          const sortedIndex = SORTED.indexOf(value);
          const flyDelay = sortedIndex * 0.15;

          return (
            <NumberBox
              key={elem.value}
              value={elem.value}
              binary={elem.binary}
              upper={elem.upper}
              lower={elem.lower}
              x={pos.x}
              y={pos.y}
              step={step}
              reached={reached}
              flyDelay={flyDelay}
              isSummary={isSummary}
            />
          );
        })}

        {/* Buckets with counts */}
        <Buckets
          reached={reached}
          sources={SORTED.map((_, i) => {
            const pos = positionFor(i);
            const yOffset = isSummary ? 105 : 0;
            return { x: pos.x, y: pos.y + yOffset };
          })}
        />

        {/* Bottom bars */}
        <LowerBitsBar
          visible={reached("lower-to-bottom")}
          merged={reached("merge-bitvector")}
          sources={SORTED.map((_, i) => lowerBitsSourceFor(i, isSummary))}
          reached={reached}
        />

        {/* Plus sign between the two bars, before they merge */}
        {reached("counts-to-unary") && !reached("merge-bitvector") && (
          <motion.text
            x={440}
            y={346}
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            fontSize={30}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            +
          </motion.text>
        )}

        {/* Total bit count below merged bitvector */}
        {reached("merge-bitvector") && (
          <motion.text
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            fontSize={18}
            initial={{ opacity: 0, x: 450, y: 390, textAnchor: "middle" as const }}
            animate={{ 
              opacity: 1,
              x: reached("summary") ? (UPPER_MERGED_X + UPPER_BAR_W + LOWER_BAR_W + 30) : 450,
              y: reached("summary") ? 196 : 390,
              textAnchor: reached("summary") ? ("start" as const) : ("middle" as const)
            }}
            transition={{ 
              duration: 0.5,
              delay: reached("summary") ? 0.5 : 0
            }}
          >
            <tspan fill="#d32f2f">12</tspan>
            <tspan fill="black">{" + "}</tspan>
            <tspan fill="#1565c0">2</tspan>
            <tspan fill="black">{" \u00D7 7 = 26 bits"}</tspan>
          </motion.text>
        )}
      </svg>

      {/* Controls */}
      <div className="controls">
        <button onClick={prevSection} disabled={isFirstSection} aria-label="Previous section">
          {"\u23EA\uFE0E"}
        </button>
        <button onClick={prev} disabled={isFirst} aria-label="Previous step">
          &#x25C0;
        </button>
        <button onClick={next} disabled={isLast} aria-label="Next step">
          &#x25B6;
        </button>
        <button onClick={nextSection} disabled={isLastSection} aria-label="Next section">
          {"\u23E9\uFE0E"}
        </button>
      </div>
    </div>
  );
}
