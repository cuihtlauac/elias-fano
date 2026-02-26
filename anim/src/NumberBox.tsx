import { motion } from "framer-motion";
import type { Step } from "./steps";

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

// Binary box: tight rectangle
const BIN_W = 60;
const BIN_H = 16; // tight around text
const BIN_Y = 4; // small gap below decimal box
const BIN_TEXT_Y = BIN_Y + 12; // baseline inside the tight rect

const TRANSITION = { type: "spring", stiffness: 120, damping: 20 };

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

      {/* Binary representation box (tight rectangle) */}
      {showBinary && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <rect
            x={-BIN_W / 2}
            y={BIN_Y}
            width={BIN_W}
            height={BIN_H}
            fill="none"
            stroke="black"
            strokeWidth={1}
          />
          {showColor ? (
            <text
              x={0}
              y={BIN_TEXT_Y}
              textAnchor="middle"
              fontSize={13}
              fontWeight="bold"
              fontFamily="monospace"
            >
              <tspan fill="#d32f2f">{upper}</tspan>
              <tspan> </tspan>
              <tspan fill="#1565c0">{lower}</tspan>
            </text>
          ) : (
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
          )}
        </motion.g>
      )}
    </motion.g>
  );
}
