/**
 * Semantic color — governance-facing meanings map to design tokens + Severity.
 */

export const SEMANTIC_COLOR_POLICY = {
  healthExcellent: "success / brand-adjacent — never imply legal certification of health",
  healthWarning: "warning / amber",
  healthCritical: "danger / red",
  informationalNeutral: "border-border/50 + text-text-secondary",
  aiAccent: "brand + explicit HITL badge",
} as const;

export const SEMANTIC_COLOR_ANTI_PATTERNS: readonly string[] = [
  "Using green-500 for “AI approved” outcomes",
  "Using red for non-error emphasis (marketing)",
];
