// Animation steps — add or reorder as needed
export const STEPS = [
  "unsorted",           // 1. Show numbers in their unsorted order
  "sorted",             // 2. Numbers slide into sorted order
  "binary",             // 3. Binary representation appears below each number
  "color-split",        // 4. Upper bits turn red, lower bits turn blue
  "lower-to-bottom",    // 5. Lower bits copy and move to bottom-right
  "buckets-decimal",    // 6. Bucket boxes appear with decimal labels 0–7
  "buckets-binary",     // 7. Decimal labels morph into binary
  "buckets-arrows",     // 8. Arrows from upper bits to buckets, counts appear
  "counts-fade-zero",   // 9. Zero counts fade away
  "counts-fly",         // 10. Non-zero counts fly to bottom left
  "counts-to-unary",    // 11. Counts morph to unary, orange → red, box drawn
  "merge-bitvector",    // 12. Red and blue bars slide together into one bitvector
] as const;

export type Step = (typeof STEPS)[number];

export const STEP_LABELS: Record<Step, string> = {
  "unsorted":           "Unsorted sequence",
  "sorted":             "Sort the sequence",
  "binary":             "Binary representation",
  "color-split":        "Split upper / lower bits",
  "lower-to-bottom":    "Extract lower bits",
  "buckets-decimal":    "Upper-bit buckets (decimal)",
  "buckets-binary":     "Upper-bit buckets (binary)",
  "buckets-arrows":     "Map elements to buckets",
  "counts-fade-zero":   "Discard empty buckets",
  "counts-fly":         "Collect counts",
  "counts-to-unary":    "Unary-encode counts",
  "merge-bitvector":    "Merged bitvector",
};
