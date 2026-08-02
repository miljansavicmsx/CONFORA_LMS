import type { AccreditationPillar, ReadinessStatus, TwinNormalizedInput } from "./twin-types";

function triage(score: number): ReadinessStatus {
  if (score >= 72) return "ready";
  if (score >= 45) return "warning";
  return "critical";
}

/** Inverzija pritiska: viši broj loose ends => niži score. */
function pressureScore(loose: number, soft: number, cap: number): number {
  const x = Math.min(loose, cap) / cap;
  const y = Math.min(soft, cap) / cap;
  return Math.max(0, Math.min(100, Math.round(100 - 55 * x - 25 * y)));
}

export function buildAccreditationPillars(input: TwinNormalizedInput): {
  readonly pillars: AccreditationPillar[];
  readonly aggregateStatus: ReadinessStatus;
} {
  const capaClosure = pressureScore(
    input.capaOverdue + Math.min(input.capaOpen, 40) * 0.35,
    input.capaOpen,
    20,
  );
  const complaintMaturity = pressureScore(input.openComplaints + input.openAppeals * 1.2, input.openComplaints, 18);
  const competence = pressureScore(input.competenceDue, input.competenceDue, 22);
  const impartiality = pressureScore(
    input.impartialityThreats * 2 + input.impartialityReviewsOverdue,
    input.impartialityThreats,
    14,
  );
  const auditComplete = pressureScore(input.openAuditFindings, input.internalAuditRecords < 1 ? 8 : 0, 16);
  const workflowTrace = pressureScore(
    input.quorumPending + input.decisionsOpen + input.coiIncomplete * 2,
    input.certQueue,
    28,
  );
  const governanceEvidence = pressureScore(
    input.openGovernanceCases + Math.max(0, 12 - input.documentCount),
    input.documentCount < 5 ? 10 : 0,
    24,
  );

  function pillar(
    id: string,
    label: string,
    standardRef: string,
    score: number,
    detail: string,
  ): { id: string; label: string; standardRef: string; status: ReadinessStatus; score: number; detail: string } {
    return { id, label, standardRef, status: triage(score), score, detail };
  }

  const pillars = [
    pillar(
      "iso17024-core",
      "ISO/IEC 17024 — operativna spremnost",
      "Kl. 4–8 (heuristički agregat)",
      Math.round(
        (capaClosure + complaintMaturity + competence + impartiality + auditComplete + workflowTrace + governanceEvidence) / 7,
      ),
      "Agregat četiri podsustava (CAPA, žalbe, kompetencije, audit) — nije zamjena za vanjsku procjenu.",
    ),
    pillar(
      "governance-docs",
      "Governance evidence",
      "MS dokumentacija",
      governanceEvidence,
      `Registrirano dokumenata (proxy): ${input.documentCount}. Otvoreni slučajevi: ${input.openGovernanceCases}.`,
    ),
    pillar(
      "competence",
      "Competence coverage",
      "Profili / valjanost",
      competence,
      `Profili u zoni isteka / obnove: ${input.competenceDue}.`,
    ),
    pillar(
      "audit",
      "Audit completeness",
      "Interni audit",
      auditComplete,
      `Interni zapisi audita: ${input.internalAuditRecords}. Otvoreni nalazi: ${input.openAuditFindings}.`,
    ),
    pillar(
      "traceability",
      "Workflow traceability",
      "Odbor / COI",
      workflowTrace,
      `COI nepotpuno: ${input.coiIncomplete}. Kvorum pending: ${input.quorumPending}.`,
    ),
    pillar(
      "impartiality",
      "Impartiality readiness",
      "Impartiality risk",
      impartiality,
      `Prijetnje: ${input.impartialityThreats}. Pregledi u zateznom roku: ${input.impartialityReviewsOverdue}.`,
    ),
    pillar(
      "capa",
      "CAPA responsiveness",
      "Korektivne mjere",
      capaClosure,
      `Preko roka: ${input.capaOverdue}. Otvoreno: ${input.capaOpen}.`,
    ),
    pillar(
      "complaints",
      "Complaint handling",
      "Pritužbe / žalbe",
      complaintMaturity,
      `Otvorene pritužbe: ${input.openComplaints}. Žalbe: ${input.openAppeals}.`,
    ),
  ];

  const avg = pillars.reduce((s, p) => s + p.score, 0) / pillars.length;
  return {
    pillars,
    aggregateStatus: triage(avg),
  };
}
