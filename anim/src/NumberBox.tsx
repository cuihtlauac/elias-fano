import { motion } from "framer-motion";
import type { Step } from "./steps";
import { W, L } from "./data";

interface Props {
  value: number;
  binary: string;
  upper: string;
  lower: string;
  x: number;
  y: number;
  step: Step;
  reached: (s: Step) => boolean;
  flyDelay?: number;
  isSummary?: boolean;
}

// Decimal box: square
const DEC_SIZE = 30;
const DEC_Y = -DEC_SIZE; // sits above origin

// Binary box dimensions
export const BIN_H = 16;
export const BIN_Y = 4;
export const BIN_TEXT_Y = BIN_Y + 12;
export const CHAR_W = 7.8; // monospace char width at fontSize 13
const PAD = 6; // horizontal padding inside box

const UPPER_CHARS = W - L; // 3
const LOWER_CHARS = L;     // 2

export const UPPER_BOX_W = UPPER_CHARS * CHAR_W + PAD;
export const LOWER_BOX_W = LOWER_CHARS * CHAR_W + PAD;
export const SPLIT_GAP = 4;

// Full (unsplit) binary box width
const FULL_BIN_W = 60;

// Scale factor for big numbers at step 0
export const BIG_SCALE = 2.0;

// Box perimeter for pen-draw stroke animation
const BOX_PERIMETER = 4 * DEC_SIZE; // 120

const SPLIT_TRANSITION = { type: "spring", stiffness: 80, damping: 18 };

// When split: upper shifts left, lower shifts right, relative to center
const TOTAL_SPLIT_W = UPPER_BOX_W + SPLIT_GAP + LOWER_BOX_W;
const UPPER_CENTER_X = -TOTAL_SPLIT_W / 2 + UPPER_BOX_W / 2;
export const LOWER_CENTER_X = TOTAL_SPLIT_W / 2 - LOWER_BOX_W / 2;

export function NumberBox({
  value,
  binary,
  upper,
  lower,
  x,
  y,
  step: _step,
  reached,
  flyDelay = 0,
  isSummary = false,
}: Props) {
  const showBinary = reached("binary");
  const showColor = reached("color-split");
  const sorted = reached("sorted");

  // Position transition: instant before sorted, slow spring after
  const posTransition = sorted
    ? { type: "spring" as const, stiffness: 30, damping: 14, delay: flyDelay }
    : { duration: 0 };

  // Scale transition: linear tween so shrink is gradual throughout the flight
  const scaleTransition = sorted
    ? { duration: 1.5, ease: "linear" as const, delay: flyDelay }
    : { duration: 0 };

  // Pen-draw transition for decimal box border
  const penDrawTransition = sorted
    ? { duration: 0.8, delay: flyDelay + 1.0, ease: "easeInOut" as const }
    : { duration: 0 };

  return (
    <motion.g
      initial={false}
      animate={{ x, y }}
      transition={posTransition}
    >
      {/* Decimal value box (square) — pen-drawn after fly */}
      <motion.rect
        x={-DEC_SIZE / 2}
        y={DEC_Y}
        width={DEC_SIZE}
        height={DEC_SIZE}
        fill="none"
        stroke="black"
        strokeWidth={1}
        strokeDasharray={BOX_PERIMETER}
        initial={false}
        animate={{ strokeDashoffset: sorted ? 0 : BOX_PERIMETER }}
        transition={penDrawTransition}
      />
      {/* Scale wrapper for decimal text */}
      <motion.g
        initial={false}
        animate={{ scale: sorted ? 1 : BIG_SCALE }}
        transition={scaleTransition}
        style={{ transformOrigin: "0px -15px" }}
      >
        <text
          x={0}
          y={DEC_Y + DEC_SIZE / 2 + 5}
          textAnchor="middle"
          fontWeight="bold"
          fontSize={16}
          fontFamily="Arial, sans-serif"
        >
          {value}
        </text>
      </motion.g>

      {/* Binary parts: move down in summary mode */}
      <motion.g
        animate={{ y: isSummary ? 105 : 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 60, 
          damping: 20,
          delay: isSummary ? 0.5 : 0
        }}
      >
        {/* Binary representation */}
        {showBinary && !showColor && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <rect
              x={-FULL_BIN_W / 2}
              y={BIN_Y}
              width={FULL_BIN_W}
              height={BIN_H}
              fill="none"
              stroke="black"
              strokeWidth={1}
            />
            <text
              x={0}
              y={BIN_TEXT_Y}
              textAnchor="middle"
              fontSize={13}
              fontWeight="bold"
              fontFamily="monospace"
              fill="#333"
            >
              {binary}
            </text>
          </motion.g>
        )}

        {/* Split boxes: upper (red) + lower (blue) */}
        {showColor && (
          <>
            {/* Upper bits box */}
            <motion.g
              initial={{ x: 0 }}
              animate={{ x: UPPER_CENTER_X }}
              transition={SPLIT_TRANSITION}
            >
              <rect
                x={-UPPER_BOX_W / 2}
                y={BIN_Y}
                width={UPPER_BOX_W}
                height={BIN_H}
                fill="none"
                stroke="black"
                strokeWidth={1}
              />
              <text
                x={0}
                y={BIN_TEXT_Y}
                textAnchor="middle"
                fontSize={13}
                fontWeight="bold"
                fontFamily="monospace"
                fill="#d32f2f"
              >
                {upper}
              </text>
            </motion.g>

            {/* Lower bits box (static, stays here) */}
            <motion.g
              initial={{ x: 0 }}
              animate={{ x: LOWER_CENTER_X }}
              transition={SPLIT_TRANSITION}
            >
              <rect
                x={-LOWER_BOX_W / 2}
                y={BIN_Y}
                width={LOWER_BOX_W}
                height={BIN_H}
                fill="none"
                stroke="black"
                strokeWidth={1}
              />
              <text
                x={0}
                y={BIN_TEXT_Y}
                textAnchor="middle"
                fontSize={13}
                fontWeight="bold"
                fontFamily="monospace"
                fill="#1565c0"
              >
                {lower}
              </text>
            </motion.g>
          </>
        )}
      </motion.g>
    </motion.g>
  );
}
