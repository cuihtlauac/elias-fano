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

// Non-zero buckets in order (for the flying counts animation)
export const NONZERO_BUCKETS = BUCKET_COUNTS
  .map((count, bucketIndex) => ({
    bucketIndex,
    count,
    unary: UNARY_PARTS[bucketIndex],
  }))
  .filter((b) => b.count > 0);

// Bar layout constants (shared between Buckets and LowerBitsBar for merge)
export const BAR_CHAR_W = 11;
export const BAR_PAD = 20;

const UPPER_BAR_STRINGS = NONZERO_BUCKETS.map((b) => b.unary);
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
