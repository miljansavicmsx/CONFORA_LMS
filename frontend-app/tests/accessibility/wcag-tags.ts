/**
 * R0-7D2 — axe tags for WCAG_2_2_AA_AUTOMATED_SUBSET (blocking).
 * Best-practice / experimental / AAA are intentionally excluded.
 */
export const WCAG_22_AA_AUTOMATED_SUBSET_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
] as const;

export type Wcag22AaAutomatedSubsetTag =
  (typeof WCAG_22_AA_AUTOMATED_SUBSET_TAGS)[number];
