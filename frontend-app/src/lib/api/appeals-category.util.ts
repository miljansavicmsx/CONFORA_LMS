import type { AppealCaseType } from "./appeals-types";

export function buildAppealReason(summary: string, grounds: string): string {
  const s = summary.trim();
  const g = grounds.trim();
  if (s && g) {
    return `${s}\n\n${g}`.slice(0, 8000);
  }
  return (g || s).slice(0, 8000);
}

export function legacyOutcomeToB14(outcome: "UPHELD" | "DISMISSED"): "APPEAL_UPHELD" | "APPEAL_REJECTED" {
  return outcome === "UPHELD" ? "APPEAL_UPHELD" : "APPEAL_REJECTED";
}

export function b14OutcomeToLegacyDisplay(outcome: string | null | undefined): string | null {
  if (!outcome) {
    return null;
  }
  switch (outcome) {
    case "APPEAL_UPHELD":
    case "APPEAL_PARTIALLY_UPHELD":
      return "UPHELD";
    case "APPEAL_REJECTED":
      return "DISMISSED";
    default:
      return outcome;
  }
}

/** Default appeal type when learner submits against a certification decision. */
export const DEFAULT_CERTIFICATION_APPEAL_TYPE: AppealCaseType = "CERTIFICATION_DECISION_APPEAL";

export function buildLegacyAliasAppealBody(input: {
  readonly certificationDecisionId: string;
  readonly summary: string;
  readonly grounds: string;
  readonly certificationApplicationId?: string;
}): {
  readonly decisionType: string;
  readonly decisionRef: string;
  readonly reason: string;
  readonly certificationApplicationId?: string;
} {
  return {
    decisionType: "CERTIFICATION_DECISION",
    decisionRef: input.certificationDecisionId.trim(),
    reason: buildAppealReason(input.summary, input.grounds),
    ...(input.certificationApplicationId?.trim()
      ? { certificationApplicationId: input.certificationApplicationId.trim() }
      : {}),
  };
}
