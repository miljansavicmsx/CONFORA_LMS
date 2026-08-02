import type { ComplianceHeuristicSnapshot, ComplianceRequirement, CoverageTier, RequirementCoverageRow } from "./compliance-types";

function tierFromScore(s: number): CoverageTier {
  if (s >= 78) return "covered";
  if (s >= 52) return "partial";
  if (s >= 28) return "needs_review";
  return "missing";
}

/** Jednostavna heuristika po domenama koje zahtjev dodiruje. */
export function computeRequirementCoverage(
  requirement: ComplianceRequirement,
  s: ComplianceHeuristicSnapshot,
  docCount: number,
): RequirementCoverageRow {
  const penalties: number[] = [];

  for (const d of requirement.domains) {
    if (d === "competence") penalties.push(s.competenceDue * 2.2);
    if (d === "impartiality") penalties.push(s.impartialityThreats * 4 + s.impartialityReviewsOverdue * 3);
    if (d === "certification")
      penalties.push(s.quorumPending * 1.5 + s.coiIncomplete * 3 + s.decisionsOpen * 0.8);
    if (d === "complaints") penalties.push(s.openComplaints * 2 + s.openAppeals * 2.5);
    if (d === "governance")
      penalties.push(
        s.managementReviewOverdueActions * 3 + s.managementReviewPendingApproval * 1.5 + s.openGovernanceCases * 1.2,
      );
    if (d === "traceability")
      penalties.push(s.technicalValidationBacklog * 1.5 + s.decisionsOpen * 0.5 + s.coiIncomplete * 2);
    if (d === "workflows") penalties.push(s.certQueue * 0.35 + s.quorumPending * 1.8);
    if (d === "auditability") penalties.push(s.openAuditFindings * 3 + Math.max(0, 6 - s.internalAuditRecords) * 2);
    if (d === "information_security")
      penalties.push(
        s.auditSensitiveFlags * 2 + Math.min(10, s.auditEventsRecent * 0.06),
      );
    if (d === "quality_ms") penalties.push(s.capaOverdue * 3.5 + s.riskOverdueReviews * 2);
    if (d === "accessibility") penalties.push(docCount < 4 ? 12 : 4);
  }

  const penalty = penalties.reduce((a, b) => a + b, 0) * requirement.weight;
  const score = Math.max(0, Math.min(100, Math.round(100 - penalty)));
  const tier = tierFromScore(score);

  const rationale =
    tier === "covered"
      ? "Agregirani signali ne pokazuju kritičan pritisak na tražene domene."
      : tier === "partial"
        ? "Postoje izolirani pritisak tačke — prioritetno zatvoriti otvorene tragove."
        : tier === "needs_review"
          ? "Trebaju ljudske provjere dokaza i workflow tragova prije procjene pokrivenosti."
          : "Nedostaje dokaz ili postoji značajan operativni jaz u traženim domenama.";

  return {
    requirementId: requirement.id,
    title: requirement.title,
    clauseRef: requirement.clauseRef,
    frameworkId: requirement.frameworkId,
    tier,
    score,
    rationale,
  };
}

export function computeAllRequirementCoverage(
  requirements: readonly ComplianceRequirement[],
  s: ComplianceHeuristicSnapshot,
  docCount: number,
): readonly RequirementCoverageRow[] {
  return requirements.map((r) => computeRequirementCoverage(r, s, docCount));
}
