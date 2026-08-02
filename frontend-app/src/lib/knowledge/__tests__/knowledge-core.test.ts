import { describe, expect, it } from "vitest";

import {
  buildKnowledgeWorkspaceBundle,
  expandKnowledgeQueryTokens,
  explainGap,
  searchRegistryClauses,
} from "@/lib/knowledge";
import type { DashboardContextPayload } from "@/lib/dashboard-context-api";
import { normalizeTwinInput } from "@/lib/digital-twin/twin-governance";

function minimalCtx(): DashboardContextPayload {
  return {
    persona: "iso_governance",
    role: "quality_manager",
    isoRole: "quality_manager",
    isoRoleLabel: "QM",
    isoGovernance: {
      activeCertificates: 1,
      openAppeals: 0,
      openComplaints: 1,
      openGovernanceCases: 1,
      capaOpenNonconformities: 2,
      capaOverdue: 1,
      riskOpenHighCritical: 0,
      riskOverdueReviews: 0,
      managementReviewOverdueActions: 0,
      managementReviewPendingApproval: 0,
      competenceProfilesDueValidity: 1,
      impartialityOpenThreats: 0,
      impartialityOverdueReviews: 0,
      note: "",
    },
    certificationCommittee: {
      applicationsPendingQueue: 1,
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
      auditEventsRecent: 2,
      auditSensitiveFlags: 0,
      verificationHits24h: 0,
      jobStatusLabel: "",
      integrationStatusLabel: "",
      apiStatus: "",
    },
  };
}

describe("knowledge orchestration", () => {
  it("builds workspace bundle with clauses and graph telemetry", () => {
    const b = buildKnowledgeWorkspaceBundle(minimalCtx(), [], {
      governanceDocumentCount: 4,
      internalAuditRecords: 1,
      openAuditFindings: 0,
    });
    expect(b.clauses.length).toBeGreaterThan(10);
    expect(b.requirements.length).toBeGreaterThan(20);
    expect(b.relationships.length).toBeGreaterThan(5);
    expect(b.graphTelemetry).toBeDefined();
    expect(b.insights).toBeDefined();
  });

  it("expands semantic aliases", () => {
    const t = expandKnowledgeQueryTokens("surveillance and recertification");
    expect(t.some((x) => x.includes("17024") || x.includes("surveillance"))).toBe(true);
  });

  it("finds registry clauses for search", () => {
    const hits = searchRegistryClauses("impartiality coi", 5);
    expect(hits.length).toBeGreaterThan(0);
  });

  it("explains gaps with human review flag", () => {
    const b = buildKnowledgeWorkspaceBundle(minimalCtx(), [], {
      governanceDocumentCount: 4,
      internalAuditRecords: 1,
      openAuditFindings: 0,
    });
    const n = normalizeTwinInput(minimalCtx(), [], 4, 1, 0);
    const clause = b.clauses[0];
    expect(clause).toBeDefined();
    const g = explainGap("t", "Test gap", clause, n);
    expect(g.humanReviewRequired).toBe(true);
    expect(g.evidenceBasis.length).toBeGreaterThan(0);
  });
});
