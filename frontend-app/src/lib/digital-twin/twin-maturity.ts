import type { GovernanceMaturityResult, MaturityLevel, TwinNormalizedInput } from "./twin-types";

function levelFromScore(s: number): MaturityLevel {
  if (s < 34) return "reactive";
  if (s < 58) return "managed";
  if (s < 78) return "controlled";
  return "optimized";
}

/**
 * Zreleije stanje = viši score (100 = optimized).
 * Heuristika: coverage audita, discipline zatvaranja, traceability, kadenca pregleda.
 */
export function computeGovernanceMaturity(input: TwinNormalizedInput): GovernanceMaturityResult {
  const auditCoverage = Math.min(100, 40 + input.internalAuditRecords * 6 - input.openAuditFindings * 5);
  const workflowEnforcement = Math.max(
    0,
    100 - input.coiIncomplete * 12 - input.quorumPending * 2 - input.decisionsOpen * 1.5,
  );
  const competenceGovernance = Math.max(0, 100 - input.competenceDue * 2.2);
  const capaDiscipline =
    input.capaOpen <= 0
      ? 88
      : Math.max(0, 100 - (input.capaOverdue / Math.max(1, input.capaOpen)) * 55 - input.capaOverdue * 3);
  const reviewCadence = Math.max(0, 100 - input.managementReviewOverdueActions * 5 - input.riskOverdueReviews * 4);
  const traceability = Math.max(
    0,
    100 - input.technicalValidationBacklog * 3 - Math.min(40, input.openGovernanceCases * 2),
  );

  const drivers = [
    { id: "audit", label: "Interni audit i nalazi", contribution: auditCoverage },
    { id: "workflow", label: "Odborsko provođenje / COI", contribution: workflowEnforcement },
    { id: "competence", label: "Governance kompetencija", contribution: competenceGovernance },
    { id: "capa", label: "CAPA disciplina zatvaranja", contribution: capaDiscipline },
    { id: "reviews", label: "Kadenca MR i rizika", contribution: reviewCadence },
    { id: "trace", label: "Traceability (validacija / slučajevi)", contribution: traceability },
  ];

  const score = Math.round(drivers.reduce((a, d) => a + d.contribution, 0) / drivers.length);
  const level = levelFromScore(score);

  const narrative =
    level === "optimized"
      ? "Model pokazuje visoku disciplinu zatvaranja i praćenja — održavajte governance ritam i mentoring odbora."
      : level === "controlled"
        ? "Procesi su uglavnom pod kontrolom; prioritet su preostale kvorum i CAPA zastoje."
        : level === "managed"
          ? "Operativa je upravljiva, ali postoji tehnički dug pregleda, CAPA ili traceability sloja."
          : "Reaktivni profil: višestruki signali istovremeno — potreban fokus na odbor, CAPA i risk review.";

  return {
    level,
    score,
    narrative,
    drivers: drivers.sort((a, b) => b.contribution - a.contribution),
  };
}
