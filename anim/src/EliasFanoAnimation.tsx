import { motion } from "framer-motion";
import { UNSORTED, SORTED, ELEMENTS } from "./data";
import { useStepPlayer } from "./useStepPlayer";
import { STEP_LABELS } from "./steps";
import { NumberBox, BIN_Y, BIN_H, BIN_TEXT_Y, LOWER_CENTER_X } from "./NumberBox";
import { LowerBitsBar } from "./LowerBitsBar";
import { Buckets } from "./Buckets";

const SVG_W = 900;
const SVG_H = 450;

// Horizontal positions for 7 boxes (centered-ish)
const BOX_SPACING = 95;
const BOX_START_X = 200;
const BOX_Y = 40;

function positionFor(index: number) {
  return { x: BOX_START_X + index * BOX_SPACING, y: BOX_Y };
}

// Lower-bits source positions: computed from NumberBox layout constants
function lowerBitsSourceFor(index: number) {
  const pos = positionFor(index);
  return {
    x: pos.x + LOWER_CENTER_X,
    y: pos.y + BIN_TEXT_Y,
  };
}

export function EliasFanoAnimation() {
  const { step, stepIndex, isFirst, isLast, next, prev, reached } =
    useStepPlayer();

  // Determine order: unsorted or sorted
  const isSorted = reached("sorted");
  const displayOrder = isSorted ? SORTED : UNSORTED;

  return (
    <div>
      {/* Controls */}
      <div className="controls">
        <button onClick={prev} disabled={isFirst} aria-label="Previous step">
          &#x25C0;
        </button>
        <button onClick={next} disabled={isLast} aria-label="Next step">
          &#x25B6;
        </button>
        <span className="step-label">
          Step {stepIndex + 1}: {STEP_LABELS[step]}
        </span>
      </div>

      {/* SVG canvas */}
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} xmlns="http://www.w3.org/2000/svg">
        <rect width={SVG_W} height={SVG_H} fill="white" />

        {/* Legend (visible once we color-split) */}
        {reached("color-split") && (
          <>
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
          </>
        )}

        {/* Number boxes */}
        {displayOrder.map((value, displayIndex) => {
          const elem = ELEMENTS.find((e) => e.value === value)!;
          const pos = positionFor(displayIndex);

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
            />
          );
        })}

        {/* Buckets with counts */}
        <Buckets
          reached={reached}
          sources={SORTED.map((_, i) => positionFor(i))}
        />

        {/* Bottom bars */}
        <LowerBitsBar
          visible={reached("lower-to-bottom")}
          merged={reached("merge-bitvector")}
          sources={SORTED.map((_, i) => lowerBitsSourceFor(i))}
        />

        {/* Total bit count below merged bitvector */}
        {reached("show-total") && (
          <motion.text
            x={450}
            y={390}
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            fontSize={16}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <tspan fill="#d32f2f">12</tspan>
            <tspan fill="black">{" + "}</tspan>
            <tspan fill="#1565c0">2</tspan>
            <tspan fill="black">{" \u00D7 7 = 26 bits"}</tspan>
          </motion.text>
        )}
      </svg>
    </div>
  );
}
