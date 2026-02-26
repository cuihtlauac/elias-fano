import { UNSORTED, SORTED, ELEMENTS } from "./data";
import { useStepPlayer } from "./useStepPlayer";
import { STEP_LABELS } from "./steps";
import { NumberBox } from "./NumberBox";
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
          <g textAnchor="end">
            <text
              x={135}
              y={58}
              fill="#d32f2f"
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
              fontSize={13}
            >
              {"w\u2212\u2113 upper bits"}
            </text>
            <text
              x={135}
              y={74}
              fill="#1565c0"
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
              fontSize={13}
            >
              {"\u2113 lower bits"}
            </text>
          </g>
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
          sources={SORTED.map((_, i) => positionFor(i))}
        />
      </svg>
    </div>
  );
}
