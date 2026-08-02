import { describe, expect, it } from "vitest";

import type { DashboardContextPayload } from "@/lib/dashboard-context-api";

import { buildOperationsIntelligenceBundle, dashboardContextToIntelligenceInput } from "./intelligence-engine";
import { detectExecutiveAlerts } from "./intelligence-anomalies";
import { computeGovernanceHealth } from "./intelligence-health";
import { inferTrendsFromSnapshot, textualTrendSummary } from "./intelligence-trends";
import type { IntelligenceInput } from "./intelligence-types";
import { computeWorkloadHeatmap } from "./intelligence-workload";

function isoBlock(): NonNullable<DashboardContextPayload["isoGovernance"]> {
  return {
    activeCertificates: 12,
    openAppeals: 1,
    openComplaints: 3,
    openGovernanceCases: 4,
    capaOpenNonconformities: 6,
    capaOverdue: 5,
    capaCriticalOpen: 1,
    riskOpenHighCritical: 4,
    riskOverdueReviews: 6,
    impartialityOpenThreats: 2,
    impartialityOverdueReviews: 1,
    managementReviewOpenCycles: 2,
    managementReviewPendingApproval: 3,
    managementReviewOverdueActions: 7,
    competenceProfilesDueValidity: 20,
    note: "",
  };
}

function ctx(overrides: Partial<DashboardContextPayload> = {}): DashboardContextPayload {
  return {
    persona: "iso_governance",
    role: "gov",
    isoRole: "quality_manager",
    isoRoleLabel: "QM",
    isoGovernance: isoBlock(),
    certificationCommittee: {
      applicationsPendingQueue: 12,
      applicationsInReview: 8,
      applicationsEligible: 3,
      decisionsOpen: 4,
      decisionsReviewStarted: 2,
      decisionsTodayTotal: 1,
      decisionsTodayApproved: 0,
      decisionsTodayRejected: 0,
      decisionsCoiIncomplete: 1,
      decisionsQuorumPending: 8,
      coiReminder: "COI provjera za odbor.",
    },
    appealsCommittee: {
      openAppeals: 1,
      openComplaints: 2,
      oldestOpenAppealDays: 10,
      oldestOpenComplaintDays: 5,
      agingSamples: [],
    },
    trainingAdmin: {
      coursesTotal: 40,
      coursesPublished: 30,
      pendingPublishDrafts: 2,
      coursesPendingContent: 4,
      coursesPendingValidation: 3,
      activeLearners: 120,
      enrollmentsCompleted: 80,
      enrollmentsActive: 60,
      learnersReadyForExam: 15,
      pendingSupportTickets: 6,
      revenuePaidTotalEur: 0,
      unpaidInvoices: 2,
    },
    sysAdmin: {
      usersSampled: 900,
      tenantsActive: 4,
      roleDistribution: {},
      auditEventsRecent: 150,
      auditSensitiveFlags: 12,
      verificationHits24h: 0,
      jobStatusLabel: "",
      integrationStatusLabel: "",
      apiStatus: "",
    },
    ...overrides,
  };
}

function minimalInput(overrides: Partial<IntelligenceInput> = {}): IntelligenceInput {
  return {
    capaOverdue: 0,
    capaOpen: 0,
    capaCriticalOpen: 0,
    riskOverdueReviews: 0,
    riskOpenHighCritical: 0,
    openComplaints: 0,
    openAppeals: 0,
    managementReviewOverdueActions: 0,
    managementReviewPendingApproval: 0,
    managementReviewOpenCycles: 0,
    competenceProfilesDueValidity: 0,
    impartialityOpenThreats: 0,
    impartialityOverdueReviews: 0,
    applicationsPendingQueue: 0,
    applicationsInReview: 0,
    decisionsQuorumPending: 0,
    decisionsOpen: 0,
    pendingSupportTickets: 0,
    learnersReadyForExam: 0,
    auditEventsRecent: 0,
    auditSensitiveFlags: 0,
    cbCapaRecords: 0,
    cbOpenFindings: 0,
    cbOpenImpartiality: 0,
    ...overrides,
  };
}

describe("operations intelligence engine", () => {
  it("builds bundle with aligned health, alerts, trends, workload", () => {
    const payload = ctx();
    const bundle = buildOperationsIntelligenceBundle(payload, {
      cbCapaRecords: 4,
      cbOpenFindings: 3,
      cbOpenImpartiality: 1,
    });

    expect(bundle.health.band).toMatch(/warning|critical/);
    expect(bundle.input.cbOpenFindings).toBe(3);
    expect(bundle.workflowInsights.length).toBeGreaterThan(0);
    expect(bundle.crossModule.length).toBeGreaterThan(0);
    expect(bundle.timeline.length).toBeGreaterThan(0);
    expect(bundle.alerts.some((a) => a.id === "capa-overdue-cluster")).toBe(true);
    expect(bundle.recommendations.length).toBeGreaterThan(0);
  });

  it("prefers ISO dashboard counts over director duplicates when both exist", () => {
    const payload = ctx({
      director: {
        governanceOverdue: 1,
        governanceOpenEthics: 0,
        examPassCertificatesIssued: 0,
        personCertificationsIssued: 0,
        certificatesTotalSampled: 0,
        suspensionsRevocations: 0,
        revenuePaidTotalEur: 0,
        certificatesTrendLabel: "",
        strategicRisksPlaceholder: "",
        governanceAlerts: [],
        capaOpenNonconformities: 99,
        capaOverdue: 7,
      },
      isoGovernance: {
        ...isoBlock(),
        capaOpenNonconformities: 1,
        capaOverdue: 1,
      },
    });
    const input = dashboardContextToIntelligenceInput(payload);
    expect(input.capaOpen).toBe(1);
    expect(input.capaOverdue).toBe(1);
  });
});

describe("governance health scoring", () => {
  it("returns excellent when there is no operational debt signal", () => {
    const h = computeGovernanceHealth(minimalInput());
    expect(h.band).toBe("excellent");
    expect(h.score).toBeGreaterThanOrEqual(88);
  });

  it("drops to critical under concentrated penalties", () => {
    const h = computeGovernanceHealth(
      minimalInput({
        capaOverdue: 25,
        riskOverdueReviews: 12,
        managementReviewOverdueActions: 15,
        openComplaints: 20,
      }),
    );
    expect(h.band).toBe("critical");
    expect(h.factors.length).toBeGreaterThan(3);
  });
});

describe("executive alert engine", () => {
  it("emits severity ladder for CAPA cluster", () => {
    const warn = detectExecutiveAlerts(minimalInput({ capaOverdue: 5 }));
    expect(warn.some((a) => a.severity === "warning" && a.id === "capa-overdue-cluster")).toBe(true);

    const crit = detectExecutiveAlerts(minimalInput({ capaOverdue: 11 }));
    expect(crit.some((a) => a.severity === "critical" && a.id === "capa-overdue-cluster")).toBe(true);
  });

  it("detects audit flag anomaly", () => {
    const a = detectExecutiveAlerts(minimalInput({ auditSensitiveFlags: 10 }));
    expect(a.some((x) => x.id === "audit-anomaly-flags")).toBe(true);
  });
});

describe("workload heatmap", () => {
  it("returns five role slices with saturation bounds", () => {
    const payload = ctx();
    const input = dashboardContextToIntelligenceInput(payload);
    const heat = computeWorkloadHeatmap(payload, input);
    expect(heat).toHaveLength(5);
    for (const row of heat) {
      expect(row.saturation).toBeGreaterThanOrEqual(0);
      expect(row.saturation).toBeLessThanOrEqual(1);
    }
    const cert = heat.find((r) => r.roleId === "cert_committee");
    expect(cert?.queueSize).toBeGreaterThan(0);
  });
});

describe("trend aggregation (snapshot inference)", () => {
  it("produces series and non-empty textual summary", () => {
    const trends = inferTrendsFromSnapshot(
      minimalInput({
        applicationsPendingQueue: 10,
        decisionsOpen: 3,
        capaOpen: 8,
        capaOverdue: 4,
        openComplaints: 10,
        auditEventsRecent: 200,
      }),
    );
    expect(trends.length).toBeGreaterThanOrEqual(6);
    const txt = textualTrendSummary(trends);
    expect(txt.length).toBeGreaterThan(20);
  });
});
