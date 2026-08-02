export type AiRecommendationKind =
  | "navigation_focus"
  | "evidence_gap_hint"
  | "readiness_pressure"
  | "clarifying_question"
  | "training_suggestion";

export const AI_RECOMMENDATION_KIND_LABELS_HR: Record<AiRecommendationKind, string> = {
  navigation_focus: "Navigacijski fokus",
  evidence_gap_hint: "Mogući praznini u dokazima",
  readiness_pressure: "Pritisak spremnosti (heuristika)",
  clarifying_question: "Pojašnjavajuće pitanje",
  training_suggestion: "Prijedlog za učenje (ne certifikacijska odluka)",
};

/** Kinds that must never imply certification outcome. */
export const AI_RECOMMENDATION_KINDS_NON_OUTCOME: readonly AiRecommendationKind[] = [
  "navigation_focus",
  "evidence_gap_hint",
  "readiness_pressure",
  "clarifying_question",
  "training_suggestion",
];
