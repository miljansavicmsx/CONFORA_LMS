import type { DashboardContextPayload } from "@/lib/dashboard-context-api";
import type { GovernanceCommitteeRow } from "@/lib/api-governance";

import type { TwinBuildInput, TwinNormalizedInput } from "./twin-types";

function n(x: number | null | undefined): number {
  return typeof x === "number" && Number.isFinite(x) ? x : 0;
}

export function normalizeTwinInput(
  ctx: DashboardContextPayload,
  committees: readonly GovernanceCommitteeRow[],
  governanceDocumentCount: number,
  internalAuditRecords: number,
  openAuditFindings: number,
): TwinNormalizedInput {
  const iso = ctx.isoGovernance;
  const cert = ctx.certificationCommittee;
  const appeals = ctx.appealsCommittee;
  const director = ctx.director;
  const train = ctx.trainingAdmin;
  const tech = ctx.technicalCommittee;
  const sys = ctx.sysAdmin;

  const certQueue = n(cert?.applicationsPendingQueue) + n(cert?.applicationsInReview) + n(cert?.decisionsOpen);
  const trainingBacklog =
    n(train?.coursesPendingContent) +
    n(train?.coursesPendingValidation) +
    n(train?.pendingSupportTickets) +
    n(train?.learnersReadyForExam);

  let singleMemberCommittees = 0;
  for (const c of committees) {
    if (c.members.length <= 1) singleMemberCommittees += 1;
  }

  return {
    capaOverdue: n(iso?.capaOverdue ?? director?.capaOverdue),
    capaOpen: n(iso?.capaOpenNonconformities ?? director?.capaOpenNonconformities),
    riskOverdueReviews: n(iso?.riskOverdueReviews),
    riskOpenHighCritical: n(iso?.riskOpenHighCritical),
    openComplaints: n(iso?.openComplaints ?? appeals?.openComplaints),
    openAppeals: n(iso?.openAppeals ?? appeals?.openAppeals),
    managementReviewOverdueActions: n(iso?.managementReviewOverdueActions),
    managementReviewPendingApproval: n(iso?.managementReviewPendingApproval),
    competenceDue: n(iso?.competenceProfilesDueValidity),
    impartialityThreats: n(iso?.impartialityOpenThreats),
    impartialityReviewsOverdue: n(iso?.impartialityOverdueReviews),
    certQueue,
    certInReview: n(cert?.applicationsInReview),
    decisionsOpen: n(cert?.decisionsOpen),
    quorumPending: n(cert?.decisionsQuorumPending),
    coiIncomplete: n(cert?.decisionsCoiIncomplete),
    openGovernanceCases: n(iso?.openGovernanceCases),
    trainingBacklog,
    auditEventsRecent: n(sys?.auditEventsRecent),
    auditSensitiveFlags: n(sys?.auditSensitiveFlags),
    documentCount: Math.max(0, governanceDocumentCount),
    internalAuditRecords: Math.max(0, internalAuditRecords),
    openAuditFindings: Math.max(0, openAuditFindings),
    committeeCount: committees.length,
    singleMemberCommittees,
    technicalValidationBacklog: n(tech?.coursesPendingValidation) + n(tech?.itemBankDraftAi),
  };
}

export function normalizeTwinInputFromBuild(input: TwinBuildInput): TwinNormalizedInput {
  return normalizeTwinInput(
    input.ctx,
    input.committees,
    input.governanceDocumentCount,
    input.internalAuditRecords,
    input.openAuditFindings,
  );
}
