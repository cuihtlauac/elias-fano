import { motion } from "framer-motion";
import {
  ALL_BUCKETS,
  ELEMENTS,
  BAR_CHAR_W,
  BAR_PAD,
  UPPER_BAR_W,
  LOWER_BAR_W,
  UPPER_MERGED_X,
  LOWER_MERGED_X,
  UNARY_FLAT,
  ONE_POSITIONS,
  SELECT_J,
  SELECT_POS,
  SELECT_UPPER_BIN,
  SELECT_LOWER,
  SELECT_COMBINED,
  SELECT_DECIMAL,
  W,
  L,
} from "./data";
import type { Step } from "./steps";

interface Props {
  reached: (s: Step) => boolean;
}

// --- Layout constants ---
const BAR_Y = 120;
const BAR_H = 40;
const TEXT_SIZE = 18;
const TEXT_BASELINE = BAR_Y + BAR_H / 2 + 6;

// --- Upper bar character map ---
const BAR_STRING = ALL_BUCKETS.map((b) => b.unary).join(" ");
const UPPER_TEXT_START =
  UPPER_MERGED_X + (UPPER_BAR_W - BAR_STRING.length * BAR_CHAR_W) / 2;

interface BarCharInfo {
  char: string;
  barIdx: number;
  flatIdx: number; // -1 for spaces
  x: number;
  isOne: boolean;
  oneRank: number; // 0-indexed rank among 1-bits (-1 if not a 1-bit)
}

const BAR_CHARS: BarCharInfo[] = [];
{
  let flat = 0;
  let ones = 0;
  for (let i = 0; i < BAR_STRING.length; i++) {
    const ch = BAR_STRING[i];
    if (ch === " ") {
      BAR_CHARS.push({
        char: ch,
        barIdx: i,
        flatIdx: -1,
        x: UPPER_TEXT_START + i * BAR_CHAR_W,
        isOne: false,
        oneRank: -1,
      });
    } else {
      const isOne = ch === "1";
      if (isOne) ones++;
      BAR_CHARS.push({
        char: ch,
        barIdx: i,
        flatIdx: flat,
        x: UPPER_TEXT_START + i * BAR_CHAR_W,
        isOne,
        oneRank: isOne ? ones - 1 : -1,
      });
      flat++;
    }
  }
}

// --- Lower bar character map ---
const LOWER_STRING = ELEMENTS.map((e) => e.lower).join(" ");
const LOWER_TEXT_START =
  LOWER_MERGED_X + (LOWER_BAR_W - LOWER_STRING.length * BAR_CHAR_W) / 2;

// Lower bar slot positions (for highlighting the j-th element)
function lowerSlotX(index: number): number {
  let offset = 0;
  for (let i = 0; i < index; i++) {
    offset += ELEMENTS[i].lower.length + 1;
  }
  return LOWER_TEXT_START + offset * BAR_CHAR_W;
}
const TARGET_SLOT_X = lowerSlotX(SELECT_J);
const TARGET_SLOT_W = ELEMENTS[SELECT_J].lower.length * BAR_CHAR_W;

// --- Scan timing ---
const SCAN_BASE_DELAY = 0.3;
const SCAN_DELAY_PER_BIT = 0.18;
function scanDelay(flatIdx: number): number {
  return SCAN_BASE_DELAY + flatIdx * SCAN_DELAY_PER_BIT;
}
// Total time for scan to reach the target
const SCAN_DONE_DELAY = scanDelay(SELECT_POS) + 0.4;

// --- Result box layout ---
const RESULT_Y = 230;
const RESULT_CHAR_W = 9.6;
const RESULT_PAD = 8;
const RESULT_H = 22;
const UPPER_RESULT_W = (W - L) * RESULT_CHAR_W + RESULT_PAD; // "010" = 3 chars
const LOWER_RESULT_W = L * RESULT_CHAR_W + RESULT_PAD; // "11" = 2 chars
const RESULT_GAP = 8;
const RESULT_TOTAL_W = UPPER_RESULT_W + RESULT_GAP + LOWER_RESULT_W;
const UPPER_RESULT_X = 450 - RESULT_TOTAL_W / 2;
const LOWER_RESULT_X = UPPER_RESULT_X + UPPER_RESULT_W + RESULT_GAP;

// Combined box
const COMBINED_W = W * RESULT_CHAR_W + RESULT_PAD; // "01011" = 5 chars
const COMBINED_X = 450 - COMBINED_W / 2;
const COMBINED_Y = RESULT_Y + 55;

// Pen-drawn box helper
const upperPerimeter = 2 * (UPPER_RESULT_W + RESULT_H);
const lowerPerimeter = 2 * (LOWER_RESULT_W + RESULT_H);
const combinedPerimeter = 2 * (COMBINED_W + RESULT_H);
const barPerimeterUpper = 2 * (UPPER_BAR_W + BAR_H);
const barPerimeterLower = 2 * (LOWER_BAR_W + BAR_H);

export function SelectAnimation({ reached }: Props) {
  const showSetup = reached("select-setup");
  const showScan = reached("select-scan");
  const showUpper = reached("select-upper");
  const showLower = reached("select-lower");
  const showCombine = reached("select-combine");

  if (!showSetup) return null;

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Query label */}
      <motion.text
        x={450}
        y={50}
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize={20}
        fill="#333"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <tspan>{"select"}</tspan>
        <tspan fontSize={13} dy={4}>
          {"1"}
        </tspan>
        <tspan dy={-4}>{"(4) \u2014 find element at index 4"}</tspan>
      </motion.text>

      {/* === Upper bar (red outline) === */}
      <motion.rect
        x={UPPER_MERGED_X}
        y={BAR_Y}
        width={UPPER_BAR_W}
        height={BAR_H}
        fill="none"
        stroke="#d32f2f"
        strokeWidth={2}
        strokeDasharray={barPerimeterUpper}
        initial={{ strokeDashoffset: barPerimeterUpper }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      {/* Upper bar label */}
      <text
        x={UPPER_MERGED_X + UPPER_BAR_W / 2}
        y={BAR_Y + BAR_H + 16}
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize={12}
        fill="#d32f2f"
      >
        upper (unary)
      </text>

      {/* Upper bar characters with scan highlights */}
      {BAR_CHARS.map((ch) => {
        if (ch.char === " ") return null;

        const isTarget = ch.flatIdx === SELECT_POS;
        const isScannedPast =
          showScan && ch.flatIdx < SELECT_POS && ch.flatIdx >= 0;
        const isScanned = showScan && ch.flatIdx <= SELECT_POS;

        return (
          <g key={`upper-${ch.barIdx}`}>
            {/* Highlight rect behind character */}
            {isScanned && (
              <motion.rect
                x={ch.x}
                y={BAR_Y + 2}
                width={BAR_CHAR_W}
                height={BAR_H - 4}
                rx={2}
                fill={isTarget ? "#ffeb3b" : "#fff9c4"}
                initial={{ opacity: 0 }}
                animate={{ opacity: isTarget ? 0.9 : 0.4 }}
                transition={{
                  duration: 0.15,
                  delay: scanDelay(ch.flatIdx),
                }}
              />
            )}

            {/* The character itself */}
            <motion.text
              x={ch.x + BAR_CHAR_W / 2}
              y={TEXT_BASELINE}
              textAnchor="middle"
              fontFamily="monospace"
              fontSize={TEXT_SIZE}
              fontWeight="bold"
              animate={{
                fill:
                  isScannedPast && !isTarget ? "#d32f2f88" : "#d32f2f",
              }}
              transition={{ duration: 0.2, delay: isScannedPast ? scanDelay(ch.flatIdx) : 0 }}
            >
              {ch.char}
            </motion.text>

            {/* Count badge for 1-bits (shown during scan) */}
            {showScan && ch.isOne && ch.oneRank <= SELECT_J && (
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.2,
                  delay: scanDelay(ch.flatIdx) + 0.1,
                }}
              >
                <circle
                  cx={ch.x + BAR_CHAR_W / 2}
                  cy={BAR_Y - 14}
                  r={10}
                  fill={ch.oneRank === SELECT_J ? "orange" : "none"}
                  stroke="orange"
                  strokeWidth={1.5}
                />
                <text
                  x={ch.x + BAR_CHAR_W / 2}
                  y={BAR_Y - 10}
                  textAnchor="middle"
                  fontFamily="Arial, sans-serif"
                  fontSize={11}
                  fontWeight="bold"
                  fill={ch.oneRank === SELECT_J ? "white" : "orange"}
                >
                  {ch.oneRank + 1}
                </text>
              </motion.g>
            )}

            {/* Position label under the target bit */}
            {showScan && isTarget && (
              <motion.text
                x={ch.x + BAR_CHAR_W / 2}
                y={BAR_Y + BAR_H + 30}
                textAnchor="middle"
                fontFamily="Arial, sans-serif"
                fontSize={12}
                fontWeight="bold"
                fill="#333"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: SCAN_DONE_DELAY }}
              >
                pos = {SELECT_POS}
              </motion.text>
            )}
          </g>
        );
      })}

      {/* === Lower bar (blue outline) === */}
      <motion.rect
        x={LOWER_MERGED_X}
        y={BAR_Y}
        width={LOWER_BAR_W}
        height={BAR_H}
        fill="none"
        stroke="#1565c0"
        strokeWidth={2}
        strokeDasharray={barPerimeterLower}
        initial={{ strokeDashoffset: barPerimeterLower }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut", delay: 0.3 }}
      />

      {/* Lower bar label */}
      <text
        x={LOWER_MERGED_X + LOWER_BAR_W / 2}
        y={BAR_Y + BAR_H + 16}
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize={12}
        fill="#1565c0"
      >
        lower bits
      </text>

      {/* Lower bar characters */}
      {LOWER_STRING.split("").map((ch, i) => {
        if (ch === " ") return null;
        return (
          <text
            key={`lower-${i}`}
            x={LOWER_TEXT_START + i * BAR_CHAR_W + BAR_CHAR_W / 2}
            y={TEXT_BASELINE}
            textAnchor="middle"
            fontFamily="monospace"
            fontSize={TEXT_SIZE}
            fontWeight="bold"
            fill="#1565c0"
          >
            {ch}
          </text>
        );
      })}

      {/* Lower bar: highlight the j-th slot */}
      {showLower && (
        <motion.rect
          x={TARGET_SLOT_X}
          y={BAR_Y + 2}
          width={TARGET_SLOT_W}
          height={BAR_H - 4}
          rx={2}
          fill="#bbdefb"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Lower bar: index label under the highlighted slot */}
      {showLower && (
        <motion.text
          x={TARGET_SLOT_X + TARGET_SLOT_W / 2}
          y={BAR_Y + BAR_H + 30}
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontSize={12}
          fontWeight="bold"
          fill="#1565c0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          index {SELECT_J}
        </motion.text>
      )}

      {/* === Formula (at select-upper step) === */}
      {showUpper && (
        <motion.text
          x={450}
          y={RESULT_Y - 20}
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontSize={15}
          fill="#333"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <tspan fontWeight="bold" fill="#d32f2f">
            upper
          </tspan>
          <tspan>{" = pos \u2212 j = "}</tspan>
          <tspan fontWeight="bold">{SELECT_POS}</tspan>
          <tspan>{" \u2212 "}</tspan>
          <tspan fontWeight="bold">{SELECT_J}</tspan>
          <tspan>{" = "}</tspan>
          <tspan fontWeight="bold">{SELECT_POS - SELECT_J}</tspan>
        </motion.text>
      )}

      {/* === Result boxes === */}

      {/* Upper bits result box (red) */}
      {showUpper && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            x: showCombine ? COMBINED_X - UPPER_RESULT_X : 0,
            y: showCombine ? COMBINED_Y - RESULT_Y : 0,
          }}
          transition={{
            opacity: { duration: 0.3 },
            x: { type: "spring", stiffness: 60, damping: 18 },
            y: { type: "spring", stiffness: 60, damping: 18 },
          }}
        >
          <motion.rect
            x={UPPER_RESULT_X}
            y={RESULT_Y}
            width={UPPER_RESULT_W}
            height={RESULT_H}
            fill="none"
            stroke="#d32f2f"
            strokeWidth={2}
            strokeDasharray={upperPerimeter}
            initial={{ strokeDashoffset: upperPerimeter }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
          <text
            x={UPPER_RESULT_X + UPPER_RESULT_W / 2}
            y={RESULT_Y + RESULT_H / 2 + 5}
            textAnchor="middle"
            fontFamily="monospace"
            fontSize={14}
            fontWeight="bold"
            fill="#d32f2f"
          >
            {SELECT_UPPER_BIN}
          </text>
        </motion.g>
      )}

      {/* Lower bits result box (blue) */}
      {showLower && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            x: showCombine
              ? COMBINED_X + UPPER_RESULT_W - LOWER_RESULT_X : 0,
            y: showCombine ? COMBINED_Y - RESULT_Y : 0,
          }}
          transition={{
            opacity: { duration: 0.3 },
            x: { type: "spring", stiffness: 60, damping: 18 },
            y: { type: "spring", stiffness: 60, damping: 18 },
          }}
        >
          <motion.rect
            x={LOWER_RESULT_X}
            y={RESULT_Y}
            width={LOWER_RESULT_W}
            height={RESULT_H}
            fill="none"
            stroke="#1565c0"
            strokeWidth={2}
            strokeDasharray={lowerPerimeter}
            initial={{ strokeDashoffset: lowerPerimeter }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
          <text
            x={LOWER_RESULT_X + LOWER_RESULT_W / 2}
            y={RESULT_Y + RESULT_H / 2 + 5}
            textAnchor="middle"
            fontFamily="monospace"
            fontSize={14}
            fontWeight="bold"
            fill="#1565c0"
          >
            {SELECT_LOWER}
          </text>
        </motion.g>
      )}

      {/* === Combined result (at select-combine) === */}
      {showCombine && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Combined binary box */}
          <motion.rect
            x={COMBINED_X}
            y={COMBINED_Y}
            width={COMBINED_W}
            height={RESULT_H}
            fill="none"
            stroke="#333"
            strokeWidth={2}
            strokeDasharray={combinedPerimeter}
            initial={{ strokeDashoffset: combinedPerimeter }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut", delay: 0.3 }}
          />
          <text
            x={COMBINED_X + COMBINED_W / 2}
            y={COMBINED_Y + RESULT_H / 2 + 5}
            textAnchor="middle"
            fontFamily="monospace"
            fontSize={14}
            fontWeight="bold"
          >
            <tspan fill="#d32f2f">{SELECT_UPPER_BIN}</tspan>
            <tspan fill="#1565c0">{SELECT_LOWER}</tspan>
          </text>

          {/* Decimal result */}
          <motion.text
            x={450}
            y={COMBINED_Y + RESULT_H + 30}
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            fontSize={22}
            fill="#333"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            = {SELECT_DECIMAL}
          </motion.text>
        </motion.g>
      )}
    </motion.g>
  );
}
