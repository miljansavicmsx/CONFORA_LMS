import type { ExecutiveAlert, IntelligenceInput } from "./intelligence-types";

const ALERT_CAPA_CLUSTER = 4;
const ALERT_COMPLAINT_SPIKE = 12;
const ALERT_AUDIT_FLAGS = 8;

export function detectExecutiveAlerts(input: IntelligenceInput): ExecutiveAlert[] {
  const out: ExecutiveAlert[] = [];

  if (input.capaOverdue >= ALERT_CAPA_CLUSTER) {
    out.push({
      id: "capa-overdue-cluster",
      severity: input.capaOverdue >= 10 ? "critical" : "warning",
      title: "Klaster prekoračenih CAPA/NCR",
      detail:
        "Više otvorenih stavki preko roka obično znači nedostatak kapaciteta ili blokadu odluke. Predloži incident review.",
      metric: String(input.capaOverdue),
      route: "/dashboard/iso/capa",
    });
  }

  if (input.openComplaints >= ALERT_COMPLAINT_SPIKE) {
    out.push({
      id: "complaint-spike",
      severity: "warning",
      title: "Povećan volumen pritužbi",
      detail: "Skok pritužbi može prethoditi SLA probijanju ili reputacijskom valu — provjeri uzrok po kategorijama.",
      metric: String(input.openComplaints),
      route: "/dashboard/iso/complaints",
    });
  }

  if (input.riskOverdueReviews >= 5) {
    out.push({
      id: "risk-review-debt",
      severity: "warning",
      title: "Tehnički dug pregleda rizika",
      detail: "Pregledi preko roka smanjuju dokaz o kontroli — zakazati governance blok za risk register.",
      metric: String(input.riskOverdueReviews),
      route: "/dashboard/iso/risks",
    });
  }

  if (input.managementReviewOverdueActions >= 6) {
    out.push({
      id: "mr-action-gridlock",
      severity: "critical",
      title: "MR akcijski plan u zastoju",
      detail: "Prekoračene MR akcije blokiraju zatvaranje pregleda rukovodstva — realokacija vlasnika ili eskalacija.",
      metric: String(input.managementReviewOverdueActions),
      route: "/dashboard/iso/management-review",
    });
  }

  const committeeLoad = input.decisionsQuorumPending + input.applicationsPendingQueue;
  if (committeeLoad >= 18) {
    out.push({
      id: "committee-congestion",
      severity: "warning",
      title: "Kongestija certifikacijskog odbora",
      detail: "Kombinacija čekajućih odluka i reda prijava signalizira bottleneck u voting/quorum toku.",
      metric: String(committeeLoad),
      route: "/dashboard/committee/pilot-applications",
    });
  }

  if (input.auditSensitiveFlags >= ALERT_AUDIT_FLAGS) {
    out.push({
      id: "audit-anomaly-flags",
      severity: "critical",
      title: "Povećan broj osjetljivih audit oznaka",
      detail: "Platform signalizira više security/governance događaja — preporuka: pravovremeni triage sys_admin tima.",
      metric: String(input.auditSensitiveFlags),
      route: "/dashboard/admin/audit-logs",
    });
  }

  if (input.competenceProfilesDueValidity >= 15) {
    out.push({
      id: "competence-expiry-cluster",
      severity: "info",
      title: "Klaster isteka kompetencija",
      detail: "Planiraj valvaljanost / re-validaciju prije auditorskog uzorka.",
      metric: String(input.competenceProfilesDueValidity),
      route: "/dashboard/iso/competence",
    });
  }

  if (input.impartialityOpenThreats >= 4) {
    out.push({
      id: "impartiality-pressure",
      severity: "warning",
      title: "Povećan impartiality backlog",
      detail: "Otvorene prijetnje treba vrednovati prije odluka odbora.",
      metric: String(input.impartialityOpenThreats),
      route: "/dashboard/iso/impartiality",
    });
  }

  return out;
}
