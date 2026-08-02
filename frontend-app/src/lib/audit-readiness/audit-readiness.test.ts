import { describe, expect, it } from "vitest";

import { buildAuditReadinessBundle } from "@/lib/audit-readiness";
import { normalizeTwinInput } from "@/lib/digital-twin/twin-governance";
import type { DashboardContextPayload } from "@/lib/dashboard-context-api";

function stressedCtx(): DashboardContextPayload {
  return {
    persona: "iso_governance",
    role: "quality_manager",
    isoRole: "quality_manager",
    isoRoleLabel: "QM",
    isoGovernance: {
      activeCertificates: 1,
      openAppeals: 0,
      openComplaints: 2,
      openGovernanceCases: 3,
      capaOpenNonconformities: 4,
      capaOverdue: 8,
      riskOpenHighCritical: 2,
      riskOverdueReviews: 1,
      managementReviewOverdueActions: 6,
      managementReviewPendingApproval: 1,
      competenceProfilesDueValidity: 12,
      impartialityOpenThreats: 2,
      impartialityOverdueReviews: 0,
      note: "",
    },
    certificationCommittee: {
      applicationsPendingQueue: 4,
      applicationsInReview: 2,
      applicationsEligible: 1,
      decisionsOpen: 2,
      decisionsReviewStarted: 0,
      decisionsTodayTotal: 0,
      decisionsTodayApproved: 0,
      decisionsTodayRejected: 0,
      decisionsCoiIncomplete: 3,
      decisionsQuorumPending: 5,
      coiReminder: "",
    },
    sysAdmin: {
      usersSampled: 1,
      tenantsActive: 1,
      roleDistribution: {},
      auditEventsRecent: 10,
      auditSensitiveFlags: 0,
      verificationHits24h: 0,
      jobStatusLabel: "",
      integrationStatusLabel: "",
      apiStatus: "",
    },
  };
}

describe("audit readiness bundle", () => {
  it("downgrades band when pressure rises", () => {
    const snap = normalizeTwinInput(stressedCtx(), [], 2, 1, 5);
    const bundle = buildAuditReadinessBundle(snap, 2);
    expect(bundle.score).toBeLessThan(80);
    expect(["at_risk", "critical", "mostly_ready", "audit_ready"]).toContain(bundle.band);
    expect(bundle.topBlockers.length).toBeGreaterThan(0);
  });
});
