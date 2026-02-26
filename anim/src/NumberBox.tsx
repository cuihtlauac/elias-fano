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

const TRANSITION = { type: "spring", stiffness: 120, damping: 20 };
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
}: Props) {
  const showBinary = reached("binary");
  const showColor = reached("color-split");

  return (
    <motion.g
      animate={{ x, y }}
      transition={TRANSITION}
    >
      {/* Decimal value box (square) */}
      <rect
        x={-DEC_SIZE / 2}
        y={DEC_Y}
        width={DEC_SIZE}
        height={DEC_SIZE}
        fill="none"
        stroke="black"
        strokeWidth={1}
      />
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
  );
}
