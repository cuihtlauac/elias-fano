import { motion, AnimatePresence } from "framer-motion";
import {
  NUM_BUCKETS,
  BUCKET_COUNTS,
  ELEMENTS,
  NONZERO_BUCKETS,
  UNARY_PARTS,
  UPPER_MERGED_X,
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

const SPRING = { type: "spring" as const, stiffness: 30, damping: 14 };

export function Buckets({ reached, sources }: Props) {
  const showDecimal = reached("buckets-decimal");
  const showBinary = reached("buckets-binary");
  const showArrows = reached("buckets-arrows");
  const fadeZero = reached("counts-fade-zero");
  const fly = reached("counts-fly");
  const toUnary = reached("counts-to-unary");
  const merge = reached("merge-bitvector");
  const isSummary = reached("summary");
  const mergeShiftX = merge ? UPPER_MERGED_X - BAR_X : 0;

  if (!showDecimal) return null;

  return (
    <g>
      {/* Bucket boxes */}
      {Array.from({ length: NUM_BUCKETS }, (_, i) => {
        const x = ORIGIN_X + i * BUCKET_SPACING;
        const binaryLabel = i.toString(2).padStart(3, "0");
        const count = BUCKET_COUNTS[i];
        const isZero = count === 0;

        return (
          <motion.g
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: isSummary ? 0 : 1 }}
            transition={{ duration: 0.4, delay: isSummary ? 0 : i * 0.08 }}
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
                  opacity: (fadeZero && isZero) || isSummary ? 0 : 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.3,
                  delay: isSummary
                    ? 0
                    : LAST_ARROW_PER_BUCKET[i] >= 0
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

          </motion.g>
        );
      })}

      {/* Upper bar content — slides during merge */}
      <motion.g
        animate={{ 
          x: mergeShiftX,
          y: isSummary ? -150 : 0
        }}
        transition={{ 
          type: "spring", 
          stiffness: 60, 
          damping: 20,
          delay: isSummary ? 0.5 : 0
        }}
      >
        {/* Flying numbers to bar */}
        {fly &&
          NONZERO_BUCKETS.map((bucket, nzIndex) => {
            const bIdx = bucket.bucketIndex;
            const startX = ORIGIN_X + bIdx * BUCKET_SPACING;
            const startY = ORIGIN_Y - 12 + 5; // circle center + text offset
            const destX = unaryDestX(nzIndex);
            const destY = DEST_BAR_Y;

            return (
              <motion.g
                key={`fly-${bIdx}`}
                initial={{ x: startX, y: startY, scale: 1 }}
                animate={{ x: destX, y: destY, scale: 18 / 12 }}
                transition={{ ...SPRING, delay: nzIndex * 0.12 }}
              >
                {/* Orange decimal — fades out when switching to unary */}
                <motion.text
                  x={0}
                  y={0}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight="bold"
                  fontFamily="Arial, sans-serif"
                  fill="orange"
                  animate={{ opacity: toUnary ? 0 : 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {bucket.count}
                </motion.text>
                {/* Red unary — fades in simultaneously */}
                <motion.text
                  x={0}
                  y={0}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight="bold"
                  fontFamily="monospace"
                  fill="#d32f2f"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: toUnary ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {UNARY_PARTS[bIdx]}
                </motion.text>
              </motion.g>
            );
          })}

        {/* "unary!" label to the left of the red bar */}
        {toUnary && (
          <motion.text
            x={BAR_X - 30}
            y={BAR_Y + BAR_H / 2 + 6}
            textAnchor="end"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            fontSize={18}
            fill="#d32f2f"
            initial={{ opacity: 0 }}
            animate={{ opacity: isSummary ? 0 : 1 }}
            transition={{ duration: 0.4, delay: isSummary ? 0 : 0.3 }}
          >
            unary!
          </motion.text>
        )}

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
      </motion.g>

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
            <motion.g
              key={`arrow-${arrow.value}`}
              animate={{ opacity: isSummary ? 0 : 1 }}
              transition={{ duration: 0.4 }}
            >
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
            </motion.g>
          );
        })}
    </g>
  );
}
