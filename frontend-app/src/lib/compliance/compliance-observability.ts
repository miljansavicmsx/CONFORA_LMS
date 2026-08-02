import type { AccreditationExposureItem, ComplianceHeuristicSnapshot, ComplianceTelemetrySlice } from "./compliance-types";

export function buildAccreditationExposure(s: ComplianceHeuristicSnapshot): AccreditationExposureItem[] {
  return [
    {
      id: "exp-domains",
      label: "High-exposure domene (proxy)",
      value: s.capaOverdue + s.riskOpenHighCritical + s.openComplaints,
      tier: s.capaOverdue + s.openComplaints > 20 ? "critical" : "warning",
      hint: "Zbroj prekoračenja, teških rizika i pritužbi kao accreditation pressure index.",
    },
    {
      id: "exp-critical-open",
      label: "Kritični otvoreni tragovi",
      value: s.quorumPending + s.coiIncomplete,
      tier: s.quorumPending > 12 ? "critical" : "partial",
      hint: "Odborska zastoja povećavaju regulatorni narativ rizika.",
    },
    {
      id: "exp-evidence",
      label: "Nedostatak dokaznog uzorka (audit)",
      value: Math.max(0, s.openAuditFindings - s.internalAuditRecords),
      tier: Math.max(0, s.openAuditFindings - s.internalAuditRecords) >= 4 ? "warning" : "partial",
      hint: "Relativno više nalaza nego audit uzorka u modelu.",
    },
    {
      id: "exp-blocked",
      label: "Blokade workflowa (odbor)",
      value: s.decisionsOpen + s.managementReviewPendingApproval,
      tier: s.managementReviewPendingApproval > 10 ? "warning" : "partial",
      hint: "Čekanja na odobrenje i odluke.",
    },
    {
      id: "exp-overdue-gov",
      label: "Prekoračen governance",
      value: s.managementReviewOverdueActions + s.impartialityReviewsOverdue,
      tier: s.managementReviewOverdueActions >= 8 ? "critical" : "warning",
      hint: "MR i impartiality pregledi izvan kadence.",
    },
    {
      id: "exp-committee-dep",
      label: "Odborska ovisnost",
      value: s.singleMemberCommittees,
      tier: s.singleMemberCommittees >= 2 ? "warning" : "ready",
      hint: "Broj odbora s jednim članom (directory heuristika).",
    },
    {
      id: "exp-resilience",
      label: "Resilience / backlog pritisak",
      value: s.openGovernanceCases + s.competenceDue,
      tier: s.competenceDue >= 18 ? "warning" : "partial",
      hint: "Governance slučajevi i kompetencije u isteku.",
    },
  ];
}

export function buildComplianceTelemetry(s: ComplianceHeuristicSnapshot): ComplianceTelemetrySlice[] {
  return [
    {
      id: "tel-compliance",
      label: "Compliance pritisak (norm.)",
      value: Math.round(s.capaOverdue * 3 + s.openComplaints * 2 + s.riskOverdueReviews * 2),
      unit: "bod",
      hint: "Lagani indeks — ne KPI ugovora.",
    },
    {
      id: "tel-audit",
      label: "Audit telemetrija",
      value: s.auditEventsRecent,
      unit: "događaji",
      hint: "Iz sys_admin dashboard konteksta.",
    },
    {
      id: "tel-evidence",
      label: "Evidence pritisak (nalazi)",
      value: s.openAuditFindings,
      unit: "nalaz",
      hint: "Interni nalazi iz governance agregata.",
    },
    {
      id: "tel-governance",
      label: "Governance telemetrija",
      value: s.openGovernanceCases + s.managementReviewPendingApproval,
      unit: "stavka",
      hint: "Otvorenost MR odobrenja i slučajeva.",
    },
  ];
}
