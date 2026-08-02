import { describe, expect, it } from "vitest";

import { buildDefaultKnowledgeGraph } from "@/lib/knowledge-graph";
import { normalizeTwinInput } from "@/lib/digital-twin/twin-governance";
import type { DashboardContextPayload } from "@/lib/dashboard-context-api";

function minimalCtx(): DashboardContextPayload {
  return {
    persona: "iso_governance",
    role: "quality_manager",
    isoRole: "quality_manager",
    isoRoleLabel: "QM",
    isoGovernance: {
      activeCertificates: 1,
      openAppeals: 0,
      openComplaints: 0,
      openGovernanceCases: 0,
      capaOpenNonconformities: 0,
      capaOverdue: 0,
      riskOpenHighCritical: 0,
      riskOverdueReviews: 0,
      managementReviewOverdueActions: 0,
      managementReviewPendingApproval: 0,
      competenceProfilesDueValidity: 0,
      impartialityOpenThreats: 0,
      impartialityOverdueReviews: 0,
      note: "",
    },
    certificationCommittee: {
      applicationsPendingQueue: 0,
      applicationsInReview: 0,
      applicationsEligible: 0,
      decisionsOpen: 0,
      decisionsReviewStarted: 0,
      decisionsTodayTotal: 0,
      decisionsTodayApproved: 0,
      decisionsTodayRejected: 0,
      decisionsCoiIncomplete: 0,
      decisionsQuorumPending: 0,
      coiReminder: "",
    },
    sysAdmin: {
      usersSampled: 1,
      tenantsActive: 1,
      roleDistribution: {},
      auditEventsRecent: 1,
      auditSensitiveFlags: 0,
      verificationHits24h: 0,
      jobStatusLabel: "",
      integrationStatusLabel: "",
      apiStatus: "",
    },
  };
}

describe("knowledge graph", () => {
  it("builds nodes and telemetry", () => {
    const snap = normalizeTwinInput(minimalCtx(), [], 4, 1, 0);
    const g = buildDefaultKnowledgeGraph(snap);
    expect(g.nodes.length).toBeGreaterThan(20);
    expect(g.edges.length).toBeGreaterThan(20);
    expect(g.telemetry.coverageDensity).toBeGreaterThanOrEqual(0);
  });
});
