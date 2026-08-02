import type { KnowledgeFacetId } from "./knowledge-types";
import type { TwinNormalizedInput } from "@/lib/digital-twin/twin-types";
import type { KnowledgeRegistryClause } from "./knowledge-types";

export interface ConfidenceResult {
  readonly score: number;
  readonly rationale: string;
}

/** Deterministička pouzdanost (0–100) iz operativnog snapshot-a — explainable, nije ML. */
export function computeConfidence(
  facet: KnowledgeFacetId,
  snapshot: TwinNormalizedInput,
  clause: KnowledgeRegistryClause | undefined,
): ConfidenceResult {
  let penalty = 0;
  if (facet === "impartiality") {
    penalty += snapshot.impartialityThreats * 4 + snapshot.impartialityReviewsOverdue * 3;
  }
  if (facet === "competence") {
    penalty += snapshot.competenceDue * 2;
  }
  if (facet === "certification_decision" || facet === "examination") {
    penalty += snapshot.quorumPending * 2 + snapshot.coiIncomplete * 3 + snapshot.decisionsOpen * 1.2;
  }
  if (facet === "complaints" || facet === "appeals") {
    penalty += snapshot.openComplaints * 2 + snapshot.openAppeals * 2;
  }
  if (facet === "management_system") {
    penalty += snapshot.managementReviewOverdueActions * 3 + snapshot.openGovernanceCases * 1.5;
  }
  if (facet === "surveillance" || facet === "recertification") {
    penalty += snapshot.certQueue * 0.15 + snapshot.capaOverdue * 1.5;
  }
  if (facet === "information_security") {
    penalty += snapshot.auditSensitiveFlags * 4;
  }

  const clausePenalty = clause && clause.controls.length === 0 ? 5 : 0;
  const score = Math.max(15, Math.min(95, Math.round(88 - penalty - clausePenalty)));
  return {
    score,
    rationale:
      "Skor kombinira normalizirane operativne brojeve (digital twin) s facetom klauzule — bez modela strojnog učenja.",
  };
}
