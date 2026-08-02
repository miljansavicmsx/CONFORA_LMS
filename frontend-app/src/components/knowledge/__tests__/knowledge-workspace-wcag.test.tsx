import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { AuditGuidancePanel } from "@/components/knowledge/AuditGuidancePanel";
import { ClauseExplorer } from "@/components/knowledge/ClauseExplorer";
import { KnowledgeGraphTextualList } from "@/components/knowledge/KnowledgeRelationshipGraph";
import { RequirementCoverageMatrix } from "@/components/knowledge/RequirementCoverageMatrix";
import { StandardsKnowledgeCenter } from "@/components/knowledge/StandardsKnowledgeCenter";
import { buildAuditReadinessBundle } from "@/lib/audit-readiness";
import { buildKnowledgeWorkspaceBundle } from "@/lib/knowledge";
import { buildDefaultKnowledgeGraph } from "@/lib/knowledge-graph";
import type { DashboardContextPayload } from "@/lib/dashboard-context-api";
import { normalizeTwinInput } from "@/lib/digital-twin/twin-governance";
import { explainRecommendation } from "@/lib/knowledge/knowledge-explainability";

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

describe("Knowledge workspace WCAG / performance hardening", () => {
  it("ClauseExplorer sets aria-current on active clause link", () => {
    const ctx = minimalCtx();
    const snap = normalizeTwinInput(ctx, [], 4, 1, 0);
    const bundle = buildKnowledgeWorkspaceBundle(ctx, [], {
      governanceDocumentCount: 4,
      internalAuditRecords: 1,
      openAuditFindings: 0,
    });
    const first = bundle.clauses[0]!;
    render(
      <MemoryRouter>
        <ClauseExplorer
          clauses={bundle.clauses.slice(0, 5)}
          selectedId={first.id}
          snapshot={snap}
          insights={[]}
          readiness={buildAuditReadinessBundle(snap, 4)}
        />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: new RegExp(first.clauseRef) });
    expect(link.getAttribute("aria-current")).toBe("true");
  });

  it("RequirementCoverageMatrix moves row focus with ArrowDown", async () => {
    const ctx = minimalCtx();
    const snap = normalizeTwinInput(ctx, [], 4, 1, 0);
    const bundle = buildKnowledgeWorkspaceBundle(ctx, [], {
      governanceDocumentCount: 4,
      internalAuditRecords: 1,
      openAuditFindings: 0,
    });
    const reqs = bundle.requirements.slice(0, 8);
    render(<RequirementCoverageMatrix requirements={reqs} snapshot={snap} />);
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThanOrEqual(4);
    const bodyRows = rows.slice(1);
    bodyRows[0]!.focus();
    fireEvent.keyDown(bodyRows[0]!, { key: "ArrowDown" });
    await waitFor(() => {
      expect(document.activeElement).toBe(bodyRows[1]!);
    });
  });

  it("KnowledgeGraphTextualList exposes textual edges fallback", () => {
    const ctx = minimalCtx();
    const snap = normalizeTwinInput(ctx, [], 4, 1, 0);
    const graph = buildDefaultKnowledgeGraph(snap);
    const ids = new Set(graph.nodes.slice(0, 12).map((n) => n.id));
    render(<KnowledgeGraphTextualList graph={graph} visibleNodeIds={ids} edgeLimit={12} />);
    expect(screen.getByText(/Tekstualni prikaz grafa/i)).toBeTruthy();
    expect(screen.getByRole("list", { name: /Lista veza knowledge grafa/i })).toBeTruthy();
  });

  it("AuditGuidancePanel surfaces textual readiness score", () => {
    const ctx = minimalCtx();
    const snap = normalizeTwinInput(ctx, [], 4, 1, 0);
    const readiness = buildAuditReadinessBundle(snap, 4);
    const { container } = render(<AuditGuidancePanel readiness={readiness} />);
    const live = container.querySelector('[aria-live="polite"]');
    expect(live?.textContent ?? "").toMatch(new RegExp(`Audit readiness skor ${readiness.score}`));
    expect(screen.getByText(/Badge ima tekst/i)).toBeTruthy();
  });

  it("StandardsKnowledgeCenter smoke: registry heading and deferred large-graph gate", () => {
    const ctx = minimalCtx();
    const snap = normalizeTwinInput(ctx, [], 4, 1, 0);
    const bundle = buildKnowledgeWorkspaceBundle(ctx, [], {
      governanceDocumentCount: 4,
      internalAuditRecords: 1,
      openAuditFindings: 0,
    });
    const graph = buildDefaultKnowledgeGraph(snap);
    const readiness = buildAuditReadinessBundle(snap, 4);
    const ai = explainRecommendation("Navigacija", bundle.clauses[0], snap);
    render(
      <MemoryRouter>
        <StandardsKnowledgeCenter
          bundle={bundle}
          graph={graph}
          readiness={readiness}
          aiGuidance={ai}
          focusClauseId=""
          snapshot={snap}
        />
      </MemoryRouter>,
    );
    expect(document.getElementById("clause-explorer-heading")?.textContent).toMatch(/Registry klauzula/i);
    if (graph.nodes.length > 52) {
      expect(screen.getByRole("button", { name: /Učitaj vizualni graf/i })).toBeTruthy();
    }
  });
});
