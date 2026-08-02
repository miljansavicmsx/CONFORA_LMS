import type { AuditReadinessTier, ComplianceHeuristicSnapshot, DomainReadiness, GovernanceDomain } from "./compliance-types";

function triage(score: number): AuditReadinessTier {
  if (score >= 82) return "ready";
  if (score >= 62) return "partial";
  if (score >= 42) return "warning";
  return "critical";
}

export function computeDomainReadiness(
  domain: GovernanceDomain,
  s: ComplianceHeuristicSnapshot,
  docCount: number,
): DomainReadiness {
  let score = 78;
  let narrative = "Heuristički presjek — nije regulatorna procjena.";

  switch (domain) {
    case "competence":
      score = Math.max(0, 100 - s.competenceDue * 2.5);
      narrative = `Zona isteka kompetencija: ${s.competenceDue}.`;
      break;
    case "impartiality":
      score = Math.max(0, 100 - s.impartialityThreats * 5 - s.impartialityReviewsOverdue * 4);
      narrative = `Impartiality prijetnje ${s.impartialityThreats}, pregledi u obvezi ${s.impartialityReviewsOverdue}.`;
      break;
    case "certification":
      score = Math.max(0, 100 - s.quorumPending * 2 - s.decisionsOpen * 1.2 - s.coiIncomplete * 3);
      narrative = `Odbor: kvorum ${s.quorumPending}, odluke ${s.decisionsOpen}, COI otvoreno ${s.coiIncomplete}.`;
      break;
    case "complaints":
      score = Math.max(0, 100 - s.openComplaints * 1.8 - s.openAppeals * 2.2);
      narrative = `Pritužbe ${s.openComplaints}, žalbe ${s.openAppeals}.`;
      break;
    case "governance":
      score = Math.max(
        0,
        100 - s.managementReviewOverdueActions * 4 - s.managementReviewPendingApproval * 2 - s.openGovernanceCases * 1.5,
      );
      narrative = `MR prekoračenja ${s.managementReviewOverdueActions}, čekanja ${s.managementReviewPendingApproval}, slučajevi ${s.openGovernanceCases}.`;
      break;
    case "traceability":
      score = Math.max(0, 100 - s.coiIncomplete * 4 - s.decisionsOpen * 1 - s.technicalValidationBacklog * 1.2);
      narrative = `Traceability pritisak: COI ${s.coiIncomplete}, validacija ${s.technicalValidationBacklog}.`;
      break;
    case "workflows":
      score = Math.max(0, 100 - s.certQueue * 0.35 - s.quorumPending * 2);
      narrative = `Operativni red/odbor: cert queue proxy ${s.certQueue}.`;
      break;
    case "auditability":
      score = Math.max(0, 88 - s.openAuditFindings * 4 + Math.min(20, s.internalAuditRecords * 2));
      narrative = `Interni audit zapisi ${s.internalAuditRecords}, otvoreni nalazi ${s.openAuditFindings}.`;
      break;
    case "information_security":
      score = Math.max(0, 92 - s.auditSensitiveFlags * 3);
      narrative = `Osjetljive platform oznake ${s.auditSensitiveFlags}, volumen audit događaja ${s.auditEventsRecent}.`;
      break;
    case "quality_ms":
      score = Math.max(0, 100 - s.capaOverdue * 3.5 - s.riskOverdueReviews * 2.5);
      narrative = `CAPA preko roka ${s.capaOverdue}, risk pregledi ${s.riskOverdueReviews}.`;
      break;
    case "accessibility":
      score = docCount >= 8 ? 80 : 55;
      narrative = "WCAG governance stub — provjerite stvarne auditove pristupačnosti odvojeno.";
      break;
    default:
      score = 70;
  }

  const rounded = Math.round(Math.max(0, Math.min(100, score)));
  return {
    domain,
    tier: triage(rounded),
    score: rounded,
    narrative,
  };
}

const ALL_DOMAINS: readonly GovernanceDomain[] = [
  "competence",
  "impartiality",
  "certification",
  "complaints",
  "governance",
  "traceability",
  "workflows",
  "auditability",
  "information_security",
  "quality_ms",
  "accessibility",
];

export function computeAllDomainReadiness(
  s: ComplianceHeuristicSnapshot,
  docCount: number,
): readonly DomainReadiness[] {
  return ALL_DOMAINS.map((domain) => computeDomainReadiness(domain, s, docCount));
}
