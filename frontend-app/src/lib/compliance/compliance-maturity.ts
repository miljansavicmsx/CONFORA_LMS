import type { ComplianceHeuristicSnapshot, ComplianceMaturityLevel, ComplianceMaturityResult } from "./compliance-types";

function levelFromScore(s: number): ComplianceMaturityLevel {
  if (s < 32) return "ad_hoc";
  if (s < 55) return "managed";
  if (s < 75) return "controlled";
  return "optimized";
}

export function computeComplianceMaturity(s: ComplianceHeuristicSnapshot, docCount: number): ComplianceMaturityResult {
  const cadence = Math.max(0, 100 - s.managementReviewOverdueActions * 4 - s.riskOverdueReviews * 3);
  const evidence = Math.max(0, 100 - Math.max(0, 10 - docCount) * 5 - s.openAuditFindings * 3);
  const workflow = Math.max(0, 100 - s.coiIncomplete * 5 - s.quorumPending * 1.5 - s.certQueue * 0.15);
  const auditCov = Math.max(0, 60 + s.internalAuditRecords * 4 - s.openAuditFindings * 4);
  const corrective = Math.max(0, 100 - s.capaOverdue * 4 - s.capaOpen * 0.35);

  const score = Math.round((cadence + evidence + workflow + auditCov + corrective) / 5);
  const level = levelFromScore(score);

  const narrative =
    level === "optimized"
      ? "Compliance orchestration je u visokoj disciplini — održavajte evidence ritam i odborske snimke."
      : level === "controlled"
        ? "Većina kontrola je zatvorena; prioritet su preostali tragovi i CAPA zatvaranja."
        : level === "managed"
          ? "Postoji struktura, ali tehnički dug tragova ili pregleda pritisče zrelost."
          : "Ad hoc profil: fokus na hitno zatvaranje MR/CAPA i odborskih čekanja.";

  return { level, score, narrative };
}
