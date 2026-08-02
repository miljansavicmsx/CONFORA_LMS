import { describe, expect, it } from "vitest";

import type { DashboardContextPayload } from "@/lib/dashboard-context-api";
import type { GovernanceCommitteeRow } from "@/lib/api-governance";

import { buildAccreditationPillars } from "./twin-accreditation";
import { buildOrganizationalTopology, buildTopologyEdges } from "./twin-topology";
import { computeCommitteeCapacity } from "./twin-capacity";
import { computeDigitalTwinHealth } from "./twin-health";
import { buildDigitalTwinInsights } from "./twin-insights";
import { computeGovernanceMaturity } from "./twin-maturity";
import { detectResilienceSignals } from "./twin-resilience";
import { normalizeTwinInput } from "./twin-governance";
import { buildDigitalTwinBundle } from "./index";

function ctx(): DashboardContextPayload {
  return {
    persona: "iso_governance",
    role: "x",
    isoRole: "quality_manager",
    isoRoleLabel: "QM",
    isoGovernance: {
      activeCertificates: 1,
      openAppeals: 0,
      openComplaints: 2,
      openGovernanceCases: 3,
      capaOpenNonconformities: 4,
      capaOverdue: 2,
      riskOpenHighCritical: 2,
      riskOverdueReviews: 1,
      managementReviewOverdueActions: 2,
      managementReviewPendingApproval: 1,
      competenceProfilesDueValidity: 5,
      impartialityOpenThreats: 1,
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
      decisionsCoiIncomplete: 1,
      decisionsQuorumPending: 3,
      coiReminder: "",
    },
    trainingAdmin: {
      coursesTotal: 1,
      coursesPublished: 1,
      pendingPublishDrafts: 0,
      coursesPendingContent: 0,
      coursesPendingValidation: 0,
      activeLearners: 1,
      enrollmentsCompleted: 0,
      enrollmentsActive: 0,
      learnersReadyForExam: 1,
      pendingSupportTickets: 1,
      revenuePaidTotalEur: 0,
      unpaidInvoices: 0,
    },
    technicalCommittee: {
      coursesPendingValidation: 0,
      itemBankDraftAi: 0,
      itemBankTotalSampled: 0,
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

const sampleCommittee = (i: number): GovernanceCommitteeRow => ({
  committeeId: `c-${i}`,
  committeeType: "CERTIFICATION",
  name: `Odbor ${i}`,
  status: "ACTIVE",
  members: [{ userId: "u1", roleInCommittee: "CHAIR" }],
});

describe("digital twin bundle", () => {
  it("orchestrates topology, accreditation, maturity, resilience", () => {
    const committees = [sampleCommittee(1), sampleCommittee(2)];
    const bundle = buildDigitalTwinBundle({
      ctx: ctx(),
      committees,
      governanceDocumentCount: 8,
      internalAuditRecords: 2,
      openAuditFindings: 1,
    });
    expect(bundle.topology.nodes.length).toBeGreaterThan(6);
    expect(bundle.topology.edges.length).toBe(buildTopologyEdges().length);
    expect(bundle.accreditation.pillars.length).toBeGreaterThan(5);
    expect(bundle.maturity.level).toMatch(/managed|controlled|optimized|reactive/);
    expect(bundle.resilience.signals.length).toBeGreaterThan(0);
    expect(bundle.capacity.length).toBe(2);
    expect(bundle.insights.length).toBeGreaterThan(0);
    expect(bundle.health.score).toBeGreaterThan(0);
  });
});

describe("accreditation readiness", () => {
  it("marks critical when CAPA and complaints pressure dominate", () => {
    const input = normalizeTwinInput(ctx(), [], 0, 0, 0);
    const stressed = { ...input, capaOverdue: 30, openComplaints: 30, capaOpen: 40 };
    const { aggregateStatus, pillars } = buildAccreditationPillars(stressed);
    expect(["warning", "critical"]).toContain(aggregateStatus);
    expect(pillars.some((p) => p.status === "critical")).toBe(true);
  });
});

describe("governance maturity", () => {
  it("returns a finite maturity level for clean snapshot", () => {
    const clean = normalizeTwinInput(ctx(), [], 0, 0, 0);
    const m = computeGovernanceMaturity({
      ...clean,
      capaOverdue: 0,
      capaOpen: 0,
      riskOverdueReviews: 0,
      managementReviewOverdueActions: 0,
      competenceDue: 0,
    });
    expect(m.score).toBeGreaterThan(0);
    expect(m.score).toBeLessThanOrEqual(100);
    expect(["reactive", "managed", "controlled", "optimized"]).toContain(m.level);
  });
});

describe("resilience", () => {
  it("flags committee overload", () => {
    const input = normalizeTwinInput(ctx(), [], 0, 0, 0);
    const heavy = { ...input, certInReview: 20, decisionsOpen: 20, quorumPending: 14 };
    const { signals } = detectResilienceSignals(heavy, 20);
    expect(signals.some((s) => s.id === "committee-overload")).toBe(true);
  });
});

describe("topology", () => {
  it("limits satellite committees", () => {
    const many = Array.from({ length: 20 }, (_, i) => sampleCommittee(i));
    const top = buildOrganizationalTopology(many, 8);
    expect(top.nodes.length).toBeLessThanOrEqual(7 + 8);
  });
});

describe("committee capacity", () => {
  it("returns saturation within unit interval", () => {
    const rows = computeCommitteeCapacity([sampleCommittee(1)], normalizeTwinInput(ctx(), [], 0, 0, 0));
    expect(rows[0]?.saturation).toBeGreaterThanOrEqual(0);
    expect(rows[0]?.saturation).toBeLessThanOrEqual(1);
  });
});

describe("twin health and insights", () => {
  it("computes health from readiness and resilience", () => {
    const h = computeDigitalTwinHealth("ready", "info", 80);
    expect(h.band).toMatch(/excellent|healthy/);
  });

  it("builds insight list", () => {
    const bundle = buildDigitalTwinBundle({
      ctx: ctx(),
      committees: [sampleCommittee(1)],
      governanceDocumentCount: 4,
      internalAuditRecords: 1,
      openAuditFindings: 0,
    });
    const extra = buildDigitalTwinInsights(
      bundle.input,
      bundle.resilience.signals,
      bundle.maturity,
      bundle.accreditation,
      bundle.capacity,
    );
    expect(extra.length).toBeGreaterThan(0);
  });
});
