import type { DashboardContextPayload } from "@/lib/dashboard-context-api";

import type { IntelligenceInput, WorkloadRoleSlice } from "./intelligence-types";

function saturate(queue: number, overdue: number, cap = 80): number {
  const raw = queue + overdue * 2;
  return Math.max(0, Math.min(1, raw / cap));
}

export function computeWorkloadHeatmap(
  ctx: DashboardContextPayload,
  input: IntelligenceInput,
): WorkloadRoleSlice[] {
  const cert = ctx.certificationCommittee;
  const train = ctx.trainingAdmin;
  const sys = ctx.sysAdmin;
  const iso = ctx.isoGovernance;

  const certQueue = (cert?.applicationsPendingQueue ?? 0) + (cert?.applicationsInReview ?? 0) + (cert?.decisionsOpen ?? 0);
  const certOverdueProxy = cert?.decisionsQuorumPending ?? 0;

  const qmQueue =
    (iso?.openGovernanceCases ?? 0) +
    (iso?.capaOpenNonconformities ?? 0) +
    (iso?.managementReviewOpenCycles ?? 0);
  const qmOverdue = (iso?.capaOverdue ?? 0) + (iso?.managementReviewOverdueActions ?? 0) + (iso?.riskOverdueReviews ?? 0);

  const auditorQueue = (iso?.impartialityOpenThreats ?? 0) + input.cbOpenFindings + (iso?.riskOpenHighCritical ?? 0);
  const auditorOverdue = iso?.impartialityOverdueReviews ?? 0;

  return [
    {
      roleId: "cert_committee",
      label: "Certifikacijski odbor",
      queueSize: certQueue,
      overdue: certOverdueProxy,
      saturation: saturate(certQueue, certOverdueProxy, 70),
      avgCompletionHint: cert?.coiReminder?.slice(0, 80) || "Procjena: quorum i COI provjere određuju stvarni ciklus.",
    },
    {
      roleId: "quality_manager",
      label: "Quality / ISO governance",
      queueSize: qmQueue,
      overdue: qmOverdue,
      saturation: saturate(qmQueue, qmOverdue, 60),
      avgCompletionHint: "Agregat CAPA, MR i rizika iz dashboard konteksta.",
    },
    {
      roleId: "auditor",
      label: "Interni audit / impartiality",
      queueSize: auditorQueue,
      overdue: auditorOverdue,
      saturation: saturate(auditorQueue, auditorOverdue, 40),
      avgCompletionHint: "Nalazi + impartiality signaliziraju audit backlog.",
    },
    {
      roleId: "training_admin",
      label: "Training admin",
      queueSize:
        (train?.coursesPendingContent ?? 0) +
        (train?.coursesPendingValidation ?? 0) +
        (train?.learnersReadyForExam ?? 0) +
        (train?.pendingSupportTickets ?? 0),
      overdue: train?.unpaidInvoices ?? 0,
      saturation: saturate(
        (train?.pendingPublishDrafts ?? 0) + (train?.pendingSupportTickets ?? 0),
        train?.unpaidInvoices ?? 0,
        50,
      ),
      avgCompletionHint: "Edukacija, kontrola sadržaja i podrška — općeniti backlog.",
    },
    {
      roleId: "sys_admin",
      label: "Sys admin / platforma",
      queueSize: (sys?.usersSampled ?? 0) + (sys?.tenantsActive ?? 0),
      overdue: sys?.auditSensitiveFlags ?? 0,
      saturation: saturate(sys?.auditEventsRecent ?? 0, sys?.auditSensitiveFlags ?? 0, 200),
      avgCompletionHint: "Observability: audit volumen i osjetljive zastavice.",
    },
  ];
}
