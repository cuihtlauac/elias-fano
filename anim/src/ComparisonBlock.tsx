import { motion } from "framer-motion";
import {
  SORTED,
  W,
  L1,
  ELEMENTS_L1,
  UNARY_PARTS_L1,
  UNARY_JOINED_L1,
  LOWER_JOINED_L1,
  UPPER_BAR_W_L1,
  LOWER_BAR_W_L1,
  UPPER_MERGED_X_L1,
  LOWER_MERGED_X_L1,
} from "./data";

interface Props {
  visible: boolean;
}

// Horizontal layout (same as block 1)
const BOX_START_X = 200;
const BOX_SPACING = 95;

// Vertical origin for binary sub-boxes
const ORIGIN_Y = 238;

// Binary sub-boxes (same metrics as NumberBox)
const CHAR_W = 7.8;
const PAD = 6;
const BIN_Y = 4;
const BIN_H = 16;
const BIN_TEXT_Y = BIN_Y + 12;

const UPPER_CHARS = W - L1; // 4
const LOWER_CHARS = L1; // 1
const UPPER_BOX_W = UPPER_CHARS * CHAR_W + PAD;
const LOWER_BOX_W = LOWER_CHARS * CHAR_W + PAD;
const SPLIT_GAP = 4;
const TOTAL_SPLIT_W = UPPER_BOX_W + SPLIT_GAP + LOWER_BOX_W;
const UPPER_CENTER_X = -TOTAL_SPLIT_W / 2 + UPPER_BOX_W / 2;
const LOWER_CENTER_X = TOTAL_SPLIT_W / 2 - LOWER_BOX_W / 2;

// Bar layout
const BAR_Y = 263;
const BAR_H = 40;
const BAR_TEXT_SIZE = 18;

// Bit counts
const UNARY_BITS = UNARY_PARTS_L1.reduce((sum, p) => sum + p.length, 0);
const TOTAL_BITS = UNARY_BITS + L1 * SORTED.length;

export function ComparisonBlock({ visible }: Props) {
  if (!visible) return null;

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Legend */}
      <g textAnchor="end">
        <text
          x={135}
          y={ORIGIN_Y + BIN_Y + BIN_H / 2 - 4}
          fill="#d32f2f"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          fontSize={13}
        >
          4 upper bits
        </text>
        <text
          x={135}
          y={ORIGIN_Y + BIN_Y + BIN_H / 2 + 12}
          fill="#1565c0"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          fontSize={13}
        >
          1 lower bit
        </text>
      </g>

      {/* Split binary sub-boxes */}
      {ELEMENTS_L1.map((elem, i) => {
        const x = BOX_START_X + i * BOX_SPACING;
        return (
          <g key={elem.value} transform={`translate(${x}, ${ORIGIN_Y})`}>
            {/* Upper bits box (red) */}
            <g transform={`translate(${UPPER_CENTER_X}, 0)`}>
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
                {elem.upper}
              </text>
            </g>

            {/* Lower bits box (blue) */}
            <g transform={`translate(${LOWER_CENTER_X}, 0)`}>
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
                {elem.lower}
              </text>
            </g>
          </g>
        );
      })}

      {/* Red unary bar */}
      <rect
        x={UPPER_MERGED_X_L1}
        y={BAR_Y}
        width={UPPER_BAR_W_L1}
        height={BAR_H}
        fill="none"
        stroke="#d32f2f"
        strokeWidth={2}
      />
      <text
        x={UPPER_MERGED_X_L1 + UPPER_BAR_W_L1 / 2}
        y={BAR_Y + BAR_H / 2 + 6}
        textAnchor="middle"
        fontFamily="monospace"
        fontWeight="bold"
        fontSize={BAR_TEXT_SIZE}
        fill="#d32f2f"
      >
        {UNARY_JOINED_L1}
      </text>

      {/* Blue lower-bits bar */}
      <rect
        x={LOWER_MERGED_X_L1}
        y={BAR_Y}
        width={LOWER_BAR_W_L1}
        height={BAR_H}
        fill="none"
        stroke="#1565c0"
        strokeWidth={2}
      />
      <text
        x={LOWER_MERGED_X_L1 + LOWER_BAR_W_L1 / 2}
        y={BAR_Y + BAR_H / 2 + 6}
        textAnchor="middle"
        fontFamily="monospace"
        fontWeight="bold"
        fontSize={BAR_TEXT_SIZE}
        fill="#1565c0"
      >
        {LOWER_JOINED_L1}
      </text>

      {/* Total bit count to the right of bars */}
      <text
        x={LOWER_MERGED_X_L1 + LOWER_BAR_W_L1 + 15}
        y={BAR_Y + BAR_H / 2 + 6}
        textAnchor="start"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize={14}
      >
        <tspan fill="#d32f2f">{UNARY_BITS}</tspan>
        <tspan fill="black">{" + "}</tspan>
        <tspan fill="#1565c0">{L1}</tspan>
        <tspan fill="black">{` \u00D7 ${SORTED.length} = ${TOTAL_BITS} bits`}</tspan>
      </text>
    </motion.g>
  );
}
