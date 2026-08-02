import type { ComplianceGap, ComplianceHeuristicSnapshot } from "./compliance-types";

export function detectComplianceGaps(
  s: ComplianceHeuristicSnapshot,
  docCount: number,
): ComplianceGap[] {
  const gaps: ComplianceGap[] = [];

  if (docCount < 4) {
    gaps.push({
      id: "gap-docs",
      title: "Slab governance evidence uzorak",
      detail: "Broj registriranih dokumenata ispod praga za MS/CB orchestraciju.",
      severity: "warning",
      domain: "governance",
      actionRoute: "/dashboard/iso/governance",
    });
  }

  if (s.capaOverdue >= 4) {
    gaps.push({
      id: "gap-capa",
      title: "Neriješene CAPA preko roka",
      detail: "Korektivne mjere kaskadno utječu na audit i akreditacijsku argumentaciju.",
      severity: s.capaOverdue >= 10 ? "critical" : "warning",
      domain: "quality_ms",
      actionRoute: "/dashboard/iso/capa",
    });
  }

  if (s.riskOverdueReviews >= 4 || s.riskOpenHighCritical >= 5) {
    gaps.push({
      id: "gap-risk",
      title: "Rizici bez pravovremenog pregleda / koncentracija teških rizika",
      detail: "Smanjuje dokaz o kontrolama u MS i certifikacijskom lancu.",
      severity: "warning",
      domain: "governance",
      actionRoute: "/dashboard/iso/risks",
    });
  }

  if (s.openComplaints >= 12) {
    gaps.push({
      id: "gap-complaints",
      title: "Povećan inventar pritužbi",
      detail: "Povezuje se s reputacijskim i accreditation exposure signalom.",
      severity: "warning",
      domain: "complaints",
      actionRoute: "/dashboard/iso/complaints",
    });
  }

  if (s.quorumPending + s.coiIncomplete >= 12) {
    gaps.push({
      id: "gap-trace",
      title: "Nepotpuna traceability odbora (kvorum/COI)",
      detail: "Workflow tragovi certifikacije nisu zatvoreni.",
      severity: "critical",
      domain: "traceability",
      actionRoute: "/dashboard/iso/decisions",
    });
  }

  if (s.competenceDue >= 15) {
    gaps.push({
      id: "gap-comp",
      title: "Kompetencije u zoni isteka",
      detail: "Audit uzorak kompetencije može biti nepotpun.",
      severity: "warning",
      domain: "competence",
      actionRoute: "/dashboard/iso/competence",
    });
  }

  if (s.impartialityThreats >= 4) {
    gaps.push({
      id: "gap-imp",
      title: "Impartiality backlog",
      detail: "Prijetnje zahtijevaju brzu obradu prije odluka odbora.",
      severity: "warning",
      domain: "impartiality",
      actionRoute: "/dashboard/iso/impartiality",
    });
  }

  if (s.internalAuditRecords < 2 && s.openAuditFindings >= 4) {
    gaps.push({
      id: "gap-audit-ev",
      title: "Audit evidence jaz",
      detail: "Nalazi rastu bez proporcionalnog internog audit uzorka u modelu.",
      severity: "warning",
      domain: "auditability",
      actionRoute: "/dashboard/iso/audit",
    });
  }

  if (s.managementReviewOverdueActions >= 6) {
    gaps.push({
      id: "gap-mr-cadence",
      title: "MR akcijski plan — probijanje kadence",
      detail: "Pregled rukovodstva ne zatvara petlju poboljšanja.",
      severity: "critical",
      domain: "governance",
      actionRoute: "/dashboard/iso/management-review",
    });
  }

  if (s.singleMemberCommittees >= 1) {
    gaps.push({
      id: "gap-committee-dep",
      title: "Komitetska ovisnost (single point)",
      detail: "Odbori s jednim članom povećavaju accreditation exposure.",
      severity: "info",
      domain: "workflows",
      actionRoute: "/dashboard/iso/governance",
    });
  }

  return gaps;
}
