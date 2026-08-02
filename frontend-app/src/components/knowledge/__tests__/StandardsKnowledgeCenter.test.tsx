import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { StandardsKnowledgeCenter } from "@/components/knowledge/StandardsKnowledgeCenter";
import { buildKnowledgeWorkspaceBundle } from "@/lib/knowledge";
import { buildDefaultKnowledgeGraph } from "@/lib/knowledge-graph";
import { buildAuditReadinessBundle } from "@/lib/audit-readiness";
import type { DashboardContextPayload } from "@/lib/dashboard-context-api";
import { normalizeTwinInput } from "@/lib/digital-twin/twin-governance";
import { explainRecommendation } from "@/lib/knowledge/knowledge-explainability";

function ctx(): DashboardContextPayload {
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

describe("StandardsKnowledgeCenter", () => {
  it("renders registry section", () => {
    const c = ctx();
    const bundle = buildKnowledgeWorkspaceBundle(c, [], { governanceDocumentCount: 4, internalAuditRecords: 1, openAuditFindings: 0 });
    const snapshot = normalizeTwinInput(c, [], 4, 1, 0);
    const graph = buildDefaultKnowledgeGraph(snapshot);
    const readiness = buildAuditReadinessBundle(snapshot, 4);
    const ai = explainRecommendation("x", bundle.clauses[0], snapshot);
    render(
      <MemoryRouter>
        <StandardsKnowledgeCenter
          bundle={bundle}
          graph={graph}
          readiness={readiness}
          aiGuidance={ai}
          focusClauseId=""
          snapshot={snapshot}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Registry i explorer/i)).toBeTruthy();
  });
});
