export type AiConfidenceBand = "high" | "medium" | "low" | "unknown";

/** Bands align with observability-model thresholds for UI consistency. */
export function aiConfidenceBandFromScore01(score: number): AiConfidenceBand {
  if (score >= 0.72) return "high";
  if (score >= 0.45) return "medium";
  if (score > 0) return "low";
  return "unknown";
}

export function aiConfidenceNarrationHr(band: AiConfidenceBand): string {
  switch (band) {
    case "high":
      return "AI pouzdanost (heuristika): viša — i dalje zahtijeva ljudsku potvrdu.";
    case "medium":
      return "AI pouzdanost: srednja — koristite kao navigacijski signal.";
    case "low":
      return "AI pouzdanost: niska — ne donosite odluke samo na ovom signalu.";
    default:
      return "AI pouzdanost: nije definirana u ovom presjeku.";
  }
}
