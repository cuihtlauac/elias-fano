// The example sequence (unsorted input, then sorted)
export const UNSORTED = [13, 3, 24, 7, 2, 11, 5];
export const SORTED = [...UNSORTED].sort((a, b) => a - b);
// => [2, 3, 5, 7, 11, 13, 24]

// Elias-Fano parameters
// n = 7 elements, max value u = 24
// l = floor(log2(u / n)) = floor(log2(24/7)) = floor(1.78) = 1
// but the SVG uses l=2, w=5. Let's match the SVG.
export const L = 2; // lower bits
export const W = 5; // total bits to represent max value (ceil(log2(24+1)) = 5)

export function lowerBits(x: number): string {
  return (x & ((1 << L) - 1)).toString(2).padStart(L, "0");
}

export function upperBits(x: number): string {
  return (x >> L).toString(2).padStart(W - L, "0");
}

// Precomputed for convenience
export const ELEMENTS = SORTED.map((value, index) => ({
  value,
  binary: value.toString(2).padStart(W, "0"),
  upper: upperBits(value),
  lower: lowerBits(value),
  index,
}));

// Bucket counts for unary encoding of upper bits
// Count how many elements fall in each bucket (by upper-bit value)
export const NUM_BUCKETS = 1 << (W - L); // 2^3 = 8
export const BUCKET_COUNTS: number[] = Array.from(
  { length: NUM_BUCKETS },
  (_, bucket) => ELEMENTS.filter((e) => parseInt(e.upper, 2) === bucket).length
);

// Unary encoding: each count c is encoded as c ones followed by a zero
export const UNARY_PARTS = BUCKET_COUNTS.map(
  (c) => "1".repeat(c) + "0"
);

// All buckets in order (for the flying counts animation)
export const ALL_BUCKETS = BUCKET_COUNTS.map((count, bucketIndex) => ({
  bucketIndex,
  count,
  unary: UNARY_PARTS[bucketIndex],
}));

// Non-zero buckets (kept for backward compat)
export const NONZERO_BUCKETS = ALL_BUCKETS.filter((b) => b.count > 0);

// Bar layout constants (shared between Buckets and LowerBitsBar for merge)
export const BAR_CHAR_W = 11;
export const BAR_PAD = 20;

const UPPER_BAR_STRINGS = ALL_BUCKETS.map((b) => b.unary);
const UPPER_BAR_JOINED = UPPER_BAR_STRINGS.join(" ");
export const UPPER_BAR_W = UPPER_BAR_JOINED.length * BAR_CHAR_W + BAR_PAD;

const LOWER_BAR_STRINGS = ELEMENTS.map((e) => e.lower);
const LOWER_BAR_JOINED = LOWER_BAR_STRINGS.join(" ");
export const LOWER_BAR_W = LOWER_BAR_JOINED.length * BAR_CHAR_W + BAR_PAD;

// Merged bitvector: both bars centered in SVG
const SVG_CENTER_X = 450;
const MERGED_TOTAL_W = UPPER_BAR_W + LOWER_BAR_W;
export const UPPER_MERGED_X = SVG_CENTER_X - MERGED_TOTAL_W / 2;
export const LOWER_MERGED_X = UPPER_MERGED_X + UPPER_BAR_W;

// --- L=1 variant for comparison block ---
export const L1 = 1;

export const ELEMENTS_L1 = SORTED.map((value, index) => ({
  value,
  binary: value.toString(2).padStart(W, "0"),
  upper: (value >> L1).toString(2).padStart(W - L1, "0"),
  lower: (value & ((1 << L1) - 1)).toString(2).padStart(L1, "0"),
  index,
}));

export const NUM_BUCKETS_L1 = 1 << (W - L1); // 16
export const BUCKET_COUNTS_L1: number[] = Array.from(
  { length: NUM_BUCKETS_L1 },
  (_, bucket) =>
    ELEMENTS_L1.filter((e) => parseInt(e.upper, 2) === bucket).length
);

export const UNARY_PARTS_L1 = BUCKET_COUNTS_L1.map(
  (c) => "1".repeat(c) + "0"
);

export const UNARY_JOINED_L1 = UNARY_PARTS_L1.join(" ");
export const LOWER_JOINED_L1 = ELEMENTS_L1.map((e) => e.lower).join(" ");

export const UPPER_BAR_W_L1 = UNARY_JOINED_L1.length * BAR_CHAR_W + BAR_PAD;
export const LOWER_BAR_W_L1 = LOWER_JOINED_L1.length * BAR_CHAR_W + BAR_PAD;

const MERGED_TOTAL_L1 = UPPER_BAR_W_L1 + LOWER_BAR_W_L1;
export const UPPER_MERGED_X_L1 = SVG_CENTER_X - MERGED_TOTAL_L1 / 2;
export const LOWER_MERGED_X_L1 = UPPER_MERGED_X_L1 + UPPER_BAR_W_L1;

// --- L=3 variant for comparison block ---
export const L3 = 3;

export const ELEMENTS_L3 = SORTED.map((value, index) => ({
  value,
  binary: value.toString(2).padStart(W, "0"),
  upper: (value >> L3).toString(2).padStart(W - L3, "0"),
  lower: (value & ((1 << L3) - 1)).toString(2).padStart(L3, "0"),
  index,
}));

export const NUM_BUCKETS_L3 = 1 << (W - L3); // 4
export const BUCKET_COUNTS_L3: number[] = Array.from(
  { length: NUM_BUCKETS_L3 },
  (_, bucket) =>
    ELEMENTS_L3.filter((e) => parseInt(e.upper, 2) === bucket).length
);

export const UNARY_PARTS_L3 = BUCKET_COUNTS_L3.map(
  (c) => "1".repeat(c) + "0"
);

export const UNARY_JOINED_L3 = UNARY_PARTS_L3.join(" ");
export const LOWER_JOINED_L3 = ELEMENTS_L3.map((e) => e.lower).join(" ");

export const UPPER_BAR_W_L3 = UNARY_JOINED_L3.length * BAR_CHAR_W + BAR_PAD;
export const LOWER_BAR_W_L3 = LOWER_JOINED_L3.length * BAR_CHAR_W + BAR_PAD;

const MERGED_TOTAL_L3 = UPPER_BAR_W_L3 + LOWER_BAR_W_L3;
export const UPPER_MERGED_X_L3 = SVG_CENTER_X - MERGED_TOTAL_L3 / 2;
export const LOWER_MERGED_X_L3 = UPPER_MERGED_X_L3 + UPPER_BAR_W_L3;

// --- select_1() precomputed data (L=2 encoding) ---

// Flat unary string (no spaces): "110110101000100"
export const UNARY_FLAT = UNARY_PARTS.join("");

// Positions of 1-bits in the flat unary string
export const ONE_POSITIONS: number[] = [];
for (let i = 0; i < UNARY_FLAT.length; i++) {
  if (UNARY_FLAT[i] === "1") ONE_POSITIONS.push(i);
}
// => [0, 1, 3, 4, 6, 8, 12]

// Query: select_1(4) — find the element at index j=4
export const SELECT_J = 4;
export const SELECT_POS = ONE_POSITIONS[SELECT_J]; // position 6
export const SELECT_UPPER_VAL = SELECT_POS - SELECT_J; // 2
export const SELECT_UPPER_BIN = SELECT_UPPER_VAL.toString(2).padStart(W - L, "0"); // "010"
export const SELECT_LOWER = ELEMENTS[SELECT_J].lower; // "11"
export const SELECT_COMBINED = SELECT_UPPER_BIN + SELECT_LOWER; // "01011"
export const SELECT_DECIMAL = ELEMENTS[SELECT_J].value; // 11

// Lower-bits bar: individual slot positions (for highlighting the j-th slot)
export const LOWER_BAR_SLOTS = ELEMENTS.map((e, i) => {
  // Each slot is the lower-bit string, separated by spaces
  // Position of slot i = sum of (lower.length + 1) for slots 0..i-1
  let charOffset = 0;
  for (let k = 0; k < i; k++) {
    charOffset += ELEMENTS[k].lower.length + 1; // +1 for space
  }
  return { charOffset, text: e.lower, width: e.lower.length };
});
