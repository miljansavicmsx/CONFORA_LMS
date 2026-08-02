import { describe, expect, it } from "vitest";

import type { DashboardContextPayload } from "@/lib/dashboard-context-api";
import type { GovernanceCommitteeRow } from "@/lib/api-governance";

import {
  buildComplianceOperatingBundle,
  buildComplianceRequirements,
  buildAllTraceability,
  computeAllDomainReadiness,
  computeAllRequirementCoverage,
  computeComplianceMaturity,
  detectComplianceGaps,
} from "./index";

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

describe("compliance operating bundle", () => {
  it("builds a consistent orchestration payload", () => {
    const committees = [sampleCommittee(1), sampleCommittee(2)];
    const reqs = buildComplianceRequirements();
    const bundle = buildComplianceOperatingBundle(ctx(), committees, {
      governanceDocumentCount: 8,
      internalAuditRecords: 2,
      openAuditFindings: 1,
    });

    expect(bundle.coverageRows.length).toBe(reqs.length);
    expect(bundle.domainReadiness.length).toBe(11);
    expect(bundle.accreditationExposure.length).toBeGreaterThan(5);
    expect(bundle.telemetry.length).toBe(4);
    expect(bundle.controls.length).toBeGreaterThan(0);
    expect(bundle.evidenceMappings.length).toBeGreaterThan(0);
    expect(bundle.ariaSummary.length).toBeGreaterThan(20);
    expect(bundle.maturity.level).toMatch(/ad_hoc|managed|controlled|optimized/);
  });

  it("assigns coverage tiers from heuristics", () => {
    const requirements = buildComplianceRequirements();
    const snapshot = buildComplianceOperatingBundle(ctx(), [], {
      governanceDocumentCount: 8,
      internalAuditRecords: 2,
      openAuditFindings: 1,
    }).snapshot;
    const rows = computeAllRequirementCoverage(requirements, snapshot, 8);
    expect(rows.every((r) => ["covered", "partial", "missing", "needs_review"].includes(r.tier))).toBe(true);
    const stressed = { ...snapshot, capaOverdue: 50, openComplaints: 40, quorumPending: 20, coiIncomplete: 15 };
    const stressedRows = computeAllRequirementCoverage(requirements, stressed, 8);
    expect(stressedRows.some((r) => r.tier === "missing" || r.tier === "needs_review")).toBe(true);
  });

  it("detects governance and corrective gaps", () => {
    const snapshot = buildComplianceOperatingBundle(ctx(), [], {
      governanceDocumentCount: 8,
      internalAuditRecords: 2,
      openAuditFindings: 1,
    }).snapshot;
    const lowDocs = detectComplianceGaps(snapshot, 2);
    expect(lowDocs.some((g) => g.id === "gap-docs")).toBe(true);

    const capaStress = { ...snapshot, capaOverdue: 12 };
    const capaGaps = detectComplianceGaps(capaStress, 8);
    expect(capaGaps.some((g) => g.id === "gap-capa")).toBe(true);
  });

  it("computes domain readiness tiers", () => {
    const snapshot = buildComplianceOperatingBundle(ctx(), [], {
      governanceDocumentCount: 8,
      internalAuditRecords: 2,
      openAuditFindings: 1,
    }).snapshot;
    const readiness = computeAllDomainReadiness(snapshot, 8);
    const domains = new Set(readiness.map((r) => r.domain));
    expect(domains.has("competence")).toBe(true);
    expect(readiness.every((r) => ["ready", "partial", "warning", "critical"].includes(r.tier))).toBe(true);
  });

  it("emits traceability links for the active requirement slice", () => {
    const requirements = buildComplianceRequirements();
    const snapshot = buildComplianceOperatingBundle(ctx(), [], {
      governanceDocumentCount: 8,
      internalAuditRecords: 2,
      openAuditFindings: 1,
    }).snapshot;
    const links = buildAllTraceability(requirements, snapshot);
    expect(links.length).toBeGreaterThan(0);
    expect(links.every((l) => l.requirementId && l.targetKind)).toBe(true);
  });

  it("scores maturity from cadence, evidence, and corrective signals", () => {
    const calm = buildComplianceOperatingBundle(ctx(), [], {
      governanceDocumentCount: 12,
      internalAuditRecords: 4,
      openAuditFindings: 0,
    }).snapshot;
    const chaos = { ...calm, capaOverdue: 40, managementReviewOverdueActions: 20, coiIncomplete: 20 };
    const calmM = computeComplianceMaturity(calm, 12);
    const chaosM = computeComplianceMaturity(chaos, 2);
    expect(calmM.score).toBeGreaterThan(chaosM.score);
  });
});
