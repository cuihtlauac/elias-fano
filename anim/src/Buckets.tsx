import { motion, AnimatePresence } from "framer-motion";
import {
  NUM_BUCKETS,
  BUCKET_COUNTS,
  ELEMENTS,
  NONZERO_BUCKETS,
  UNARY_PARTS,
} from "./data";
import type { Step } from "./steps";

interface Props {
  reached: (s: Step) => boolean;
  /** Absolute (x, y) of each sorted NumberBox origin in SVG coords */
  sources: { x: number; y: number }[];
}

const BUCKET_SPACING = 60;
const ORIGIN_X = 80;
const ORIGIN_Y = 200;

// Arrow source offset from NumberBox origin (below the binary rect)
const SRC_OFFSET_Y = 24;
// Arrow destination: top of count circle (center at -12, radius 12)
const DEST_OFFSET_Y = -24;

// Build arrow data: for each element, which bucket it targets
const ARROWS = ELEMENTS.map((elem, sortedIndex) => ({
  sortedIndex,
  bucketIndex: parseInt(elem.upper, 2),
  value: elem.value,
}));

// For each bucket, find the last arrow index targeting it (to time count appearance)
const LAST_ARROW_PER_BUCKET: number[] = Array.from(
  { length: NUM_BUCKETS },
  (_, bucket) => {
    const indices = ARROWS
      .map((a, i) => (a.bucketIndex === bucket ? i : -1))
      .filter((i) => i >= 0);
    return indices.length > 0 ? Math.max(...indices) : -1;
  }
);

// --- Destination layout for the upper-bits bar (bottom left) ---
const BAR_X = 200;
const BAR_Y = 320;
const BAR_H = 40;
const CHAR_W = 11;

// Compute destination positions for flying counts
// They'll eventually show unary strings side by side
const UNARY_STRINGS = NONZERO_BUCKETS.map((b) => b.unary);
const UNARY_JOINED = UNARY_STRINGS.join(" ");
const BAR_W = UNARY_JOINED.length * CHAR_W + 20;
const BOX_PERIMETER = 2 * (BAR_W + BAR_H);

function unaryDestX(nzIndex: number): number {
  let offset = 0;
  for (let j = 0; j < nzIndex; j++) {
    offset += UNARY_STRINGS[j].length + 1;
  }
  offset += UNARY_STRINGS[nzIndex].length / 2;
  const totalChars = UNARY_JOINED.length;
  const textStartX = BAR_X + (BAR_W - totalChars * CHAR_W) / 2;
  return textStartX + offset * CHAR_W;
}

const DEST_BAR_Y = BAR_Y + BAR_H / 2 + 6; // text baseline

// Map bucketIndex → index in NONZERO_BUCKETS (or -1)
const BUCKET_TO_NZ: number[] = Array.from({ length: NUM_BUCKETS }, (_, i) => {
  const idx = NONZERO_BUCKETS.findIndex((b) => b.bucketIndex === i);
  return idx;
});

const SPRING = { type: "spring" as const, stiffness: 30, damping: 14 };

export function Buckets({ reached, sources }: Props) {
  const showDecimal = reached("buckets-decimal");
  const showBinary = reached("buckets-binary");
  const showArrows = reached("buckets-arrows");
  const fadeZero = reached("counts-fade-zero");
  const fly = reached("counts-fly");
  const toUnary = reached("counts-to-unary");
  const showPlus = reached("upper-plus");

  if (!showDecimal) return null;

  return (
    <g>
      {/* Bucket boxes */}
      {Array.from({ length: NUM_BUCKETS }, (_, i) => {
        const x = ORIGIN_X + i * BUCKET_SPACING;
        const binaryLabel = i.toString(2).padStart(3, "0");
        const count = BUCKET_COUNTS[i];
        const isZero = count === 0;
        const nzIndex = BUCKET_TO_NZ[i];

        // Count circle position: at bucket or flying to bar
        const circleAtBucketX = x;
        const circleAtBucketY = ORIGIN_Y - 12;
        const circleDestX = nzIndex >= 0 ? unaryDestX(nzIndex) : circleAtBucketX;
        const circleDestY = DEST_BAR_Y;

        // Determine circle animated position
        const circleX = fly && !isZero ? circleDestX : circleAtBucketX;
        const circleY = fly && !isZero ? circleDestY : circleAtBucketY;

        // Color: orange by default, red when morphed to unary
        const countColor = toUnary && !isZero ? "#d32f2f" : "orange";

        // Text content: decimal count or unary
        const countText =
          toUnary && !isZero
            ? UNARY_PARTS[i]
            : String(count);

        // Should the circle be visible?
        const circleVisible = showArrows && !(fadeZero && isZero);

        // When flying, hide the circle border (they merge into the bar)
        const showCircleBorder = !fly || isZero;

        return (
          <motion.g
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <g transform={`translate(${x}, ${ORIGIN_Y})`}>
              {/* Bucket box */}
              <rect
                x={-25}
                y={0}
                width={50}
                height={25}
                fill="none"
                stroke="black"
                strokeWidth={2}
              />

              {/* Label: decimal or binary with crossfade */}
              <AnimatePresence mode="wait">
                {!showBinary ? (
                  <motion.text
                    key="decimal"
                    x={0}
                    y={18}
                    textAnchor="middle"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {i}
                  </motion.text>
                ) : (
                  <motion.text
                    key="binary"
                    x={0}
                    y={18}
                    textAnchor="middle"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {binaryLabel}
                  </motion.text>
                )}
              </AnimatePresence>
            </g>

            {/* Count circle + number — stays at bucket */}
            {showArrows && (
              <motion.g
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: fadeZero && isZero ? 0 : 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.3,
                  delay:
                    LAST_ARROW_PER_BUCKET[i] >= 0
                      ? LAST_ARROW_PER_BUCKET[i] * 0.15 + 1.1
                      : 1.1,
                }}
              >
                <g transform={`translate(${x}, ${ORIGIN_Y - 12})`}>
                  <circle
                    cx={0}
                    cy={0}
                    r={12}
                    fill="none"
                    stroke="orange"
                    strokeWidth={2}
                  />
                  <text
                    x={0}
                    y={5}
                    textAnchor="middle"
                    fontSize={12}
                    fill="orange"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                  >
                    {count}
                  </text>
                </g>
              </motion.g>
            )}

            {/* Flying number (no circle) — travels to the bar, grows in size */}
            {fly && !isZero && nzIndex >= 0 && (
              <motion.g
                initial={{
                  x: circleAtBucketX,
                  y: circleAtBucketY,
                  scale: 1,
                }}
                animate={{
                  x: circleDestX,
                  y: circleDestY,
                  scale: 18 / 12, // grow from fontSize 12 to 18
                }}
                transition={{ ...SPRING, delay: nzIndex * 0.12 }}
              >
                {/* Orange decimal — fades out when switching to unary */}
                <motion.text
                  x={0}
                  y={5}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight="bold"
                  fontFamily="Arial, sans-serif"
                  fill="orange"
                  animate={{ opacity: toUnary ? 0 : 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {count}
                </motion.text>
                {/* Red unary — fades in simultaneously */}
                <motion.text
                  x={0}
                  y={5}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight="bold"
                  fontFamily="monospace"
                  fill="#d32f2f"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: toUnary ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {UNARY_PARTS[i]}
                </motion.text>
              </motion.g>
            )}
          </motion.g>
        );
      })}

      {/* Pen-drawn red box around the unary bar */}
      {toUnary && (
        <motion.rect
          x={BAR_X}
          y={BAR_Y}
          width={BAR_W}
          height={BAR_H}
          fill="none"
          stroke="#d32f2f"
          strokeWidth={2}
          strokeDasharray={BOX_PERIMETER}
          strokeDashoffset={BOX_PERIMETER}
          animate={{ strokeDashoffset: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Plus sign between upper and lower bars */}
      {showPlus && (
        <motion.text
          x={445}
          y={350}
          fontFamily="Arial, sans-serif"
          fontSize={30}
          fontWeight="bold"
          textAnchor="middle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          +
        </motion.text>
      )}

      {/* Arrows from upper bits to buckets */}
      {showArrows &&
        ARROWS.map((arrow, i) => {
          const src = sources[arrow.sortedIndex];
          if (!src) return null;

          const sx = src.x;
          const sy = src.y + SRC_OFFSET_Y;
          const dx = ORIGIN_X + arrow.bucketIndex * BUCKET_SPACING;
          const dy = ORIGIN_Y + DEST_OFFSET_Y;

          // Control point: halfway horizontally, biased toward source vertically
          const cx = (sx + dx) / 2;
          const cy = sy + (dy - sy) * 0.3;
          const curveD = `M ${sx},${sy} Q ${cx},${cy} ${dx},${dy}`;
          const maskId = `arrow-mask-${arrow.value}`;

          // Approximate curve length
          const chord = Math.hypot(dx - sx, dy - sy);
          const pathLen = chord * 1.3;

          const duration = 1.2;
          const delay = i * 0.15;

          return (
            <g key={`arrow-${arrow.value}`}>
              <defs>
                {/* Mask: a solid stroke that grows, revealing the dashed line */}
                <mask id={maskId}>
                  <motion.path
                    d={curveD}
                    fill="none"
                    stroke="white"
                    strokeWidth={4}
                    strokeDasharray={pathLen}
                    initial={{ strokeDashoffset: pathLen }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{
                      duration,
                      ease: "easeOut",
                      delay,
                    }}
                  />
                </mask>
              </defs>

              {/* Dashed curve, revealed by the growing mask */}
              <path
                d={curveD}
                fill="none"
                stroke="orange"
                strokeWidth={1.5}
                strokeDasharray="6,4"
                mask={`url(#${maskId})`}
              />

              {/* Arrowhead appears at destination when curve arrives */}
              <motion.polygon
                points="0,-4 8,0 0,4"
                fill="orange"
                transform={`translate(${dx},${dy}) rotate(${Math.atan2(dy - cy, dx - cx) * (180 / Math.PI)})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, delay: delay + duration - 0.1 }}
              />
            </g>
          );
        })}
    </g>
  );
}
