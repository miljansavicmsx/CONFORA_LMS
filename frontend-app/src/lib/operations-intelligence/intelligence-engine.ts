import type { DashboardContextPayload } from "@/lib/dashboard-context-api";

import { detectExecutiveAlerts } from "./intelligence-anomalies";
import { computeGovernanceHealth } from "./intelligence-health";
import {
  buildCrossModuleInsights,
  buildGovernanceTimelineEvents,
  buildWorkflowInsights,
} from "./intelligence-insights";
import { buildIntelligenceRecommendations } from "./intelligence-recommendations";
import { computeOperationalRiskProfile } from "./intelligence-risk";
import { inferTrendsFromSnapshot } from "./intelligence-trends";
import type { IntelligenceInput, OperationsIntelligenceBundle } from "./intelligence-types";
import { computeWorkloadHeatmap } from "./intelligence-workload";

function n(x: number | null | undefined): number {
  return typeof x === "number" && Number.isFinite(x) ? x : 0;
}

export type IntelligenceSupplement = {
  readonly cbCapaRecords?: number;
  readonly cbOpenFindings?: number;
  readonly cbOpenImpartiality?: number;
};

export function dashboardContextToIntelligenceInput(
  ctx: DashboardContextPayload,
  supplement?: IntelligenceSupplement,
): IntelligenceInput {
  const iso = ctx.isoGovernance;
  const cert = ctx.certificationCommittee;
  const appeals = ctx.appealsCommittee;
  const train = ctx.trainingAdmin;
  const sys = ctx.sysAdmin;
  const director = ctx.director;

  return {
    capaOverdue: n(iso?.capaOverdue ?? director?.capaOverdue),
    capaOpen: n(iso?.capaOpenNonconformities ?? director?.capaOpenNonconformities),
    capaCriticalOpen: n(iso?.capaCriticalOpen),
    riskOverdueReviews: n(iso?.riskOverdueReviews),
    riskOpenHighCritical: n(iso?.riskOpenHighCritical),
    openComplaints: n(iso?.openComplaints ?? appeals?.openComplaints),
    openAppeals: n(iso?.openAppeals ?? appeals?.openAppeals),
    managementReviewOverdueActions: n(iso?.managementReviewOverdueActions),
    managementReviewPendingApproval: n(iso?.managementReviewPendingApproval),
    managementReviewOpenCycles: n(iso?.managementReviewOpenCycles),
    competenceProfilesDueValidity: n(iso?.competenceProfilesDueValidity),
    impartialityOpenThreats: n(iso?.impartialityOpenThreats),
    impartialityOverdueReviews: n(iso?.impartialityOverdueReviews),
    applicationsPendingQueue: n(cert?.applicationsPendingQueue),
    applicationsInReview: n(cert?.applicationsInReview),
    decisionsQuorumPending: n(cert?.decisionsQuorumPending),
    decisionsOpen: n(cert?.decisionsOpen),
    pendingSupportTickets: n(train?.pendingSupportTickets),
    learnersReadyForExam: n(train?.learnersReadyForExam),
    auditEventsRecent: n(sys?.auditEventsRecent),
    auditSensitiveFlags: n(sys?.auditSensitiveFlags),
    cbCapaRecords: n(supplement?.cbCapaRecords),
    cbOpenFindings: n(supplement?.cbOpenFindings),
    cbOpenImpartiality: n(supplement?.cbOpenImpartiality),
  };
}

export function summarizeInputForAria(input: IntelligenceInput): string {
  const parts = [
    `CAPA kasne ${input.capaOverdue}, otvorenih ${input.capaOpen}.`,
    `Rizici (HIGH/CRITICAL otvoreni) ${input.riskOpenHighCritical}, pregledi preko roka ${input.riskOverdueReviews}.`,
    `Pritužbe ${input.openComplaints}, žalbe ${input.openAppeals}.`,
    `Management review prekoračenja akcija ${input.managementReviewOverdueActions}.`,
  ];
  return parts.join(" ");
}

export function buildOperationsIntelligenceBundle(
  ctx: DashboardContextPayload,
  supplement?: IntelligenceSupplement,
): OperationsIntelligenceBundle {
  const input = dashboardContextToIntelligenceInput(ctx, supplement);
  const health = computeGovernanceHealth(input);
  const alerts = detectExecutiveAlerts(input);
  const trends = inferTrendsFromSnapshot(input);
  const workload = computeWorkloadHeatmap(ctx, input);
  const workflowInsights = buildWorkflowInsights(input);
  const crossModule = buildCrossModuleInsights(input);
  const recommendations = buildIntelligenceRecommendations(health, alerts);
  const risk = computeOperationalRiskProfile(input);
  const now = new Date().toISOString();
  const timeline = buildGovernanceTimelineEvents(input, now);

  return {
    input,
    health,
    alerts,
    trends,
    workload,
    workflowInsights,
    crossModule,
    recommendations,
    timeline,
    risk,
  };
}
