import { motion } from "framer-motion";
import { ELEMENTS } from "./data";

interface Props {
  visible: boolean;
  /** Source positions: absolute (x, y) of each NumberBox origin in SVG coords */
  sources: { x: number; y: number }[];
}

// Destination layout for the bottom bar
const BAR_X = 480;
const BAR_Y = 320;
const BAR_H = 40;
const TEXT_SIZE = 18;
const CHAR_W = 11; // approximate monospace character width at fontSize 18

// Compute total bar width from content
const LOWER_STRINGS = ELEMENTS.map((e) => e.lower);
const JOINED = LOWER_STRINGS.join(" ");
const BAR_W = JOINED.length * CHAR_W + 20; // padding

// Each element's text x-center in the destination bar
function destX(index: number): number {
  let offset = 0;
  for (let i = 0; i < index; i++) {
    offset += LOWER_STRINGS[i].length + 1; // +1 for space
  }
  offset += LOWER_STRINGS[index].length / 2;
  const totalChars = JOINED.length;
  const textStartX = BAR_X + (BAR_W - totalChars * CHAR_W) / 2;
  return textStartX + offset * CHAR_W;
}

const DEST_Y = BAR_Y + BAR_H / 2 + 6; // text baseline

// Box perimeter for the "pen drawing" effect
const BOX_PERIMETER = 2 * (BAR_W + BAR_H);

export function LowerBitsBar({ visible, sources }: Props) {
  if (!visible) return null;

  return (
    <g>
      {/* Flying lower-bit texts */}
      {ELEMENTS.map((elem, i) => {
        const src = sources[i];
        if (!src) return null;
        // Source position: exact center of the lower-bits tspan (measured from DOM)
        const sx = src.x;
        const sy = src.y;
        // Destination position
        const dx = destX(i);
        const dy = DEST_Y;

        return (
          <motion.g
            key={elem.value}
            initial={{ x: sx, y: sy, scale: 1 }}
            animate={{ x: dx, y: dy, scale: TEXT_SIZE / 13 }}
            transition={{
              type: "spring",
              stiffness: 30,
              damping: 14,
              delay: i * 0.15,
            }}
          >
            <text
              textAnchor="middle"
              fontFamily="monospace"
              fontSize={13}
              fontWeight="bold"
              fill="#1565c0"
            >
              {elem.lower}
            </text>
          </motion.g>
        );
      })}

      {/* Box drawn with a pen-stroke effect, appears after texts land */}
      <motion.rect
        x={BAR_X}
        y={BAR_Y}
        width={BAR_W}
        height={BAR_H}
        fill="none"
        stroke="#1565c0"
        strokeWidth={2}
        strokeDasharray={BOX_PERIMETER}
        strokeDashoffset={BOX_PERIMETER}
        animate={{ strokeDashoffset: 0 }}
        transition={{
          duration: 0.8,
          delay: ELEMENTS.length * 0.15 + 0.8, // after all texts land
          ease: "easeInOut",
        }}
      />
    </g>
  );
}
