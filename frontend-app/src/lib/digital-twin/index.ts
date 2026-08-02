import { buildAccreditationPillars } from "./twin-accreditation";
import { computeCommitteeCapacity } from "./twin-capacity";
import { normalizeTwinInputFromBuild } from "./twin-governance";
import { computeDigitalTwinHealth } from "./twin-health";
import { buildDigitalTwinInsights } from "./twin-insights";
import { computeGovernanceMaturity } from "./twin-maturity";
import { detectResilienceSignals } from "./twin-resilience";
import type { DigitalTwinBundle, ReadinessStatus, TwinAriaContext, TwinBuildInput } from "./twin-types";
import { buildOrganizationalTopology } from "./twin-topology";

export function buildDigitalTwinBundle(input: TwinBuildInput): DigitalTwinBundle {
  const norm = normalizeTwinInputFromBuild(input);
  const topology = buildOrganizationalTopology(input.committees);
  const accreditation = buildAccreditationPillars(norm);
  const maturity = computeGovernanceMaturity(norm);
  const resilience = detectResilienceSignals(norm);
  const capacity = computeCommitteeCapacity(input.committees, norm);
  const insights = buildDigitalTwinInsights(norm, resilience.signals, maturity, accreditation, capacity);
  const health = computeDigitalTwinHealth(accreditation.aggregateStatus, resilience.aggregateSeverity, maturity.score);

  const riskStatus: ReadinessStatus =
    norm.riskOpenHighCritical >= 6 || norm.riskOverdueReviews >= 6
      ? "critical"
      : norm.riskOpenHighCritical >= 3 || norm.riskOverdueReviews >= 3
        ? "warning"
        : "ready";

  const exposure = [
    {
      id: "complaints",
      label: "Neriješene pritužbe / žalbe",
      value: norm.openComplaints + norm.openAppeals,
      status:
        norm.openComplaints + norm.openAppeals > 22
          ? ("critical" as const)
          : norm.openComplaints > 10
            ? ("warning" as const)
            : ("ready" as const),
      hint: "Rano upozorenje na reputacijski i SLA pritisak.",
    },
    {
      id: "capa",
      label: "CAPA / NCR otvorenost",
      value: norm.capaOpen + norm.capaOverdue,
      status: norm.capaOverdue > 6 ? ("critical" as const) : norm.capaOpen > 16 ? ("warning" as const) : ("ready" as const),
      hint: `Preko roka: ${norm.capaOverdue}.`,
    },
    {
      id: "risks",
      label: "Rizici (teški + pregledi)",
      value: norm.riskOpenHighCritical + norm.riskOverdueReviews,
      status: riskStatus,
      hint: "HIGH/CRITICAL i overdue pregledi smanjuju dokaz o kontroli.",
    },
    {
      id: "workflow",
      label: "Blokade odbora (kvorum / odluke)",
      value: norm.quorumPending + norm.decisionsOpen,
      status:
        norm.quorumPending > 12 ? ("critical" as const) : norm.decisionsOpen > 14 ? ("warning" as const) : ("ready" as const),
      hint: "Traceability certifikacijskog odlučivanja.",
    },
    {
      id: "competence",
      label: "Istek / obnova kompetencija",
      value: norm.competenceDue,
      status:
        norm.competenceDue >= 20 ? ("critical" as const) : norm.competenceDue >= 12 ? ("warning" as const) : ("ready" as const),
      hint: "Skup isteka stvara audit uzorak bez pokrivenosti.",
    },
    {
      id: "approvals",
      label: "Odobrenja MR",
      value: norm.managementReviewPendingApproval,
      status: norm.managementReviewPendingApproval > 8 ? ("warning" as const) : ("ready" as const),
      hint: "Čekanje na potpis / odobrenje akcija.",
    },
    {
      id: "governance_backlog",
      label: "Governance backlog (slučajevi)",
      value: norm.openGovernanceCases,
      status: norm.openGovernanceCases > 14 ? ("warning" as const) : ("ready" as const),
      hint: "Integracija etike, pritužbi i MS planova.",
    },
  ] as const;

  return {
    input: norm,
    topology,
    accreditation,
    maturity,
    resilience,
    capacity,
    exposure: [...exposure],
    insights,
    health,
  };
}

export function summarizeTwinForAria(bundle: DigitalTwinBundle): TwinAriaContext {
  const { health, accreditation, maturity, resilience } = bundle;
  const summary = [
    `Digital twin zdravlje: ${health.band}, skor ${health.score}.`,
    `Akreditacijska spremnost: ${accreditation.aggregateStatus}.`,
    `Governance zrelost: ${maturity.level} (${maturity.score}).`,
    `Otpornost: ${resilience.aggregateSeverity}.`,
    bundle.insights
      .slice(0, 3)
      .map((i) => i.title)
      .join("; "),
  ].join(" ");
  return { summary };
}

export * from "./twin-types";
export { normalizeTwinInput, normalizeTwinInputFromBuild } from "./twin-governance";
export { buildOrganizationalTopology, buildTopologyEdges, topologyStressHint } from "./twin-topology";
export { buildAccreditationPillars } from "./twin-accreditation";
export { computeGovernanceMaturity } from "./twin-maturity";
export { detectResilienceSignals } from "./twin-resilience";
export { computeCommitteeCapacity } from "./twin-capacity";
export { classifyCommitteeFamily, countCommitteesByFamily, committeeDependencySummary } from "./twin-committees";
export { buildDigitalTwinInsights } from "./twin-insights";
export { computeDigitalTwinHealth } from "./twin-health";
