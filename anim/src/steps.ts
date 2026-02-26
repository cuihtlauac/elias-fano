// Animation steps — grouped into sections
export interface Section {
  readonly name: string;
  readonly steps: readonly Step[];
}

export type Step =
  | "unsorted"
  | "sorted"
  | "binary"
  | "color-split"
  | "lower-to-bottom"
  | "buckets-decimal"
  | "buckets-binary"
  | "buckets-arrows"
  | "counts-fade-zero"
  | "counts-fly"
  | "counts-to-unary"
  | "merge-bitvector"
  | "show-total"
  | "summary"
  | "comparison"
  | "select-setup"
  | "select-scan"
  | "select-upper"
  | "select-lower"
  | "select-combine";

export const SECTIONS: readonly Section[] = [
  {
    name: "Encoding",
    steps: [
      "unsorted",
      "sorted",
      "binary",
      "color-split",
      "lower-to-bottom",
      "buckets-decimal",
      "buckets-binary",
      "buckets-arrows",
      "counts-fade-zero",
      "counts-fly",
      "counts-to-unary",
      "merge-bitvector",
      "show-total",
    ],
  },
  {
    name: "Coding, cont'd",
    steps: ["summary", "comparison"],
  },
  {
    name: "Select",
    steps: [
      "select-setup",
      "select-scan",
      "select-upper",
      "select-lower",
      "select-combine",
    ],
  },
];

// Derive flat STEPS from SECTIONS
export const STEPS: readonly Step[] = SECTIONS.flatMap((s) => s.steps);

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
  "show-total":         "Total bit count",
  "summary":            "Encoding complete",
  "comparison":         "Comparison: L = 1",
  "select-setup":       "Bitvector for decoding",
  "select-scan":        "Scan for the 5th one-bit",
  "select-upper":       "Compute upper bits",
  "select-lower":       "Read lower bits",
  "select-combine":     "Reconstruct the value",
};
