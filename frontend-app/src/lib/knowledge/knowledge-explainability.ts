import type { TwinNormalizedInput } from "@/lib/digital-twin/twin-types";

import type {
  CoverageBand,
  KnowledgeExplainableRecommendation,
  KnowledgeRegistryClause,
  KnowledgeRequirement,
} from "./knowledge-types";
import { computeConfidence } from "./knowledge-confidence";
import { evidenceChannelsForFacet } from "./knowledge-evidence";

function bandFromConfidence(c: number): CoverageBand {
  if (c >= 78) return "strong";
  if (c >= 52) return "medium";
  if (c >= 30) return "weak";
  return "unknown";
}

export interface RequirementCoverageExplanation {
  readonly requirementId: string;
  readonly clauseRef: string;
  readonly narrative: string;
  readonly confidence: number;
  readonly band: CoverageBand;
  readonly evidenceBasis: readonly string[];
  readonly governanceBasis: readonly string[];
  readonly auditBasis: readonly string[];
  readonly relatedStandards: readonly string[];
  readonly humanReviewRequired: true;
}

export function explainRequirementCoverage(
  requirement: KnowledgeRequirement,
  clause: KnowledgeRegistryClause | undefined,
  snapshot: TwinNormalizedInput,
): RequirementCoverageExplanation {
  const conf = computeConfidence(requirement.facet, snapshot, clause);
  const channels = evidenceChannelsForFacet(requirement.facet);
  const narrative =
    clause != null
      ? `Zahtjev "${requirement.text.slice(0, 120)}${requirement.text.length > 120 ? "…" : ""}" mapiran je na klauzulu ${clause.clauseRef}. Operativni signali (CAPA/pritužbe/odbor) utječu na heurističku pouzdanost — potrebna ljudska provjera dokaza u modulima.`
      : `Zahtjev nema učitane klauzule u registry snapshotu — ručno mapiranje prije zaključaka.`;

  return {
    requirementId: requirement.id,
    clauseRef: clause?.clauseRef ?? "—",
    narrative,
    confidence: conf.score,
    band: bandFromConfidence(conf.score),
    evidenceBasis: channels.map((c) => c.label),
    governanceBasis: clause?.governanceMappings ?? [],
    auditBasis: clause?.auditGuidance ?? [],
    relatedStandards: clause ? [clause.standardId] : [],
    humanReviewRequired: true,
  };
}

export interface GapExplanation {
  readonly id: string;
  readonly narrative: string;
  readonly confidence: number;
  readonly evidenceBasis: readonly string[];
  readonly governanceBasis: readonly string[];
  readonly auditBasis: readonly string[];
  readonly relatedStandards: readonly string[];
  readonly humanReviewRequired: true;
}

export function explainGap(
  gapId: string,
  title: string,
  clause: KnowledgeRegistryClause | undefined,
  snapshot: TwinNormalizedInput,
): GapExplanation {
  const facet = clause?.facets[0] ?? "general";
  const conf = computeConfidence(facet, snapshot, clause);
  return {
    id: gapId,
    narrative: `${title}. Ovo je heuristički signal iz operativnog presjeka (npr. CAPA/pritužbe/odbor), ne automatska odluka. ${clause ? `Povezana referenca: ${clause.clauseRef}.` : ""}`,
    confidence: Math.max(20, Math.min(92, 100 - conf.score * 0.4)),
    evidenceBasis: evidenceChannelsForFacet(facet).map((e) => e.label),
    governanceBasis: clause?.governanceMappings ?? [],
    auditBasis: clause?.auditGuidance.length ? clause.auditGuidance : ["Interni uzorak dokaza"],
    relatedStandards: clause ? [clause.standardId] : ["ISO17024"],
    humanReviewRequired: true,
  };
}

export function explainRecommendation(
  title: string,
  clause: KnowledgeRegistryClause | undefined,
  snapshot: TwinNormalizedInput,
): KnowledgeExplainableRecommendation {
  const facet = clause?.facets[0] ?? "management_system";
  const conf = computeConfidence(facet, snapshot, clause);
  return {
    id: `rec-${clause?.id ?? "generic"}`,
    title,
    explanation:
      "AI guidance je navigaciona i preparatorska — ne zamjenjuje stručnu procjenu. Koristite module i formalne evidencije za konačni zaključak.",
    confidence: conf.score,
    confidenceBand: conf.score >= 72 ? "high" : conf.score >= 48 ? "medium" : "low",
    evidenceBasis: (clause?.evidenceGuidance ?? []).slice(0, 6),
    governanceBasis: clause?.governanceMappings ?? [],
    auditBasis: clause?.auditGuidance ?? [],
    relatedStandards: clause ? [clause.standardId] : ["ISO17024", "INTERNAL_GRC"],
    relatedClauseRefs: clause ? [clause.clauseRef] : [],
    humanReviewRequired: true,
  };
}
