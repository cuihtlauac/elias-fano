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
  | "comparison";

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
    name: "Summary",
    steps: ["summary", "comparison"],
  },
  // Future: { name: "Select", steps: [...] },
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
};
