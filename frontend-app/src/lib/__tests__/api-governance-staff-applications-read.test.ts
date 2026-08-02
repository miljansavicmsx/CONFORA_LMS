import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ENDPOINT_DEFINITIONS } from "@/lib/api/endpoint-registry";

const apiGet = vi.fn();

vi.mock("@/lib/api", () => ({
  api: {
    get: (...args: unknown[]) => apiGet(...args),
  },
}));

const NEST_STAFF_QUEUE_ITEM = {
  applicationId: "a5100001-0000-4000-8000-000000000001",
  schemeId: "51000001-0000-4000-8000-000000000001",
  schemeTitle: "Certified Widget Professional",
  courseId: "c5100001-0000-4000-8000-000000000001",
  status: "SUBMITTED",
  submittedAt: "2026-03-01T10:00:00.000Z",
  updatedAt: "2026-03-01T10:00:00.000Z",
  candidateReference: "cand-b5100000",
  reviewSegment: "INBOX",
  scopeSummaryPreview: "Widget certification scope",
  evidenceSummary: {
    biographyProvided: true,
    diplomaProvided: true,
    publicWorksCount: 1,
  },
  eligibilitySummary: {
    desiredScopeProvided: true,
    overviewAcknowledged: true,
    verifiersRecorded: 1,
  },
} as const;

const NEST_STAFF_DETAIL_ITEM = {
  ...NEST_STAFF_QUEUE_ITEM,
  desiredScopeText: "Widget certification scope for industrial use",
  workExperience: "Ten years in widgets",
  bioUrl: "https://cdn.example/bio.pdf",
  diplomaUrl: "https://cdn.example/diploma.pdf",
  publicWorks: ["https://example.org/work1"],
  referencePerson1: {
    fullName: "Ref One",
    email: "ref1@example.org",
    relationship: "Peer",
  },
  referencePerson2: null,
  overviewAcknowledgedAt: "2026-03-01T09:00:00.000Z",
  decisionAt: null,
  decisionRationale: "Prior review note",
  accommodationRequested: true,
} as const;

describe("staff certification application hybrid routing (P1-B5-1b)", () => {
  beforeEach(() => {
    vi.resetModules();
    apiGet.mockReset();
    vi.stubEnv("VITE_API_PROVIDER", "hybrid");
    vi.stubEnv("VITE_CONFORA_API_URL", "http://nest.example.test");
    vi.stubEnv("VITE_LEGACY_API_URL", "http://legacy.example.test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fetchStaffCertificationApplications uses Nest staff list path in hybrid mode", async () => {
    apiGet.mockResolvedValue({
      data: {
        contractVersion: "1.0.0",
        items: [NEST_STAFF_QUEUE_ITEM],
      },
    });

    const { fetchStaffCertificationApplications } = await import("@/lib/api-governance");
    const rows = await fetchStaffCertificationApplications();

    expect(apiGet).toHaveBeenCalledWith("/v1/staff/certification/applications", { params: undefined });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.applicationId).toBe("a5100001-0000-4000-8000-000000000001");
    expect(rows[0]?.candidateReference).toBe("cand-b5100000");
    expect(rows[0]?.userId).toBe("");
    expect(rows[0]?.schemeTitle).toBe("Certified Widget Professional");
    expect(JSON.stringify(rows[0])).not.toMatch(/complianceSignature|tenantId/i);
  });

  it("fetchStaffCertificationApplications forwards list filters as query params", async () => {
    apiGet.mockResolvedValue({ data: { contractVersion: "1.0.0", items: [] } });

    const { fetchStaffCertificationApplications } = await import("@/lib/api-governance");
    await fetchStaffCertificationApplications({
      status: "SUBMITTED",
      scheme: "51000001-0000-4000-8000-000000000001",
      submitted_after: "2026-01-01T00:00:00.000Z",
      submitted_before: "2026-12-31T23:59:59.999Z",
    });

    expect(apiGet).toHaveBeenCalledWith("/v1/staff/certification/applications", {
      params: {
        status: "SUBMITTED",
        scheme: "51000001-0000-4000-8000-000000000001",
        submitted_after: "2026-01-01T00:00:00.000Z",
        submitted_before: "2026-12-31T23:59:59.999Z",
      },
    });
  });

  it("fetchStaffCertificationApplicationDetail maps Nest staff detail contract", async () => {
    apiGet.mockResolvedValue({
      data: {
        contractVersion: "1.0.0",
        item: NEST_STAFF_DETAIL_ITEM,
      },
    });

    const { fetchStaffCertificationApplicationDetail } = await import("@/lib/api-governance");
    const detail = await fetchStaffCertificationApplicationDetail(
      "a5100001-0000-4000-8000-000000000001",
    );

    expect(apiGet).toHaveBeenCalledWith(
      "/v1/staff/certification/applications/a5100001-0000-4000-8000-000000000001",
    );
    expect(detail.workExperience).toBe("Ten years in widgets");
    expect(detail.accommodationRequested).toBe(true);
    expect(detail.additionalNotes).toBe("Prior review note");
    expect(detail.userId).toBe("");
    expect(JSON.stringify(detail)).not.toMatch(/complianceSignature|"tenantId"/i);
    expect(Object.keys(detail)).not.toContain("accommodationReq");
  });

  it("fetchApplications delegates to staff queue fetch", async () => {
    apiGet.mockResolvedValue({ data: { contractVersion: "1.0.0", items: [] } });

    const { fetchApplications } = await import("@/lib/api-governance");
    await fetchApplications();

    expect(apiGet).toHaveBeenCalledWith("/v1/staff/certification/applications", { params: undefined });
  });

  it("staff queue rollback uses legacy path when provider is legacy", async () => {
    vi.stubEnv("VITE_API_PROVIDER", "legacy");
    apiGet.mockResolvedValue({
      data: [
        {
          applicationId: "legacy-app",
          userId: "user-1",
          courseId: "course-1",
          status: "PENDING_REVIEW",
          workExperience: "Legacy experience",
        },
      ],
    });

    const { fetchStaffCertificationApplications } = await import("@/lib/api-governance");
    const rows = await fetchStaffCertificationApplications();

    expect(apiGet).toHaveBeenCalledWith("/api/certification/applications", { params: undefined });
    expect(rows[0]?.userId).toBe("user-1");
  });

  it("staff detail rollback uses legacy detail path when provider is legacy", async () => {
    vi.stubEnv("VITE_API_PROVIDER", "legacy");
    apiGet.mockResolvedValue({
      data: {
        applicationId: "legacy-app",
        userId: "user-1",
        courseId: "course-1",
        status: "PENDING_REVIEW",
        workExperience: "Legacy detail",
      },
    });

    const { fetchStaffCertificationApplicationDetail } = await import("@/lib/api-governance");
    const detail = await fetchStaffCertificationApplicationDetail("legacy-app");

    expect(apiGet).toHaveBeenCalledWith("/api/certification/applications/legacy-app");
    expect(detail.workExperience).toBe("Legacy detail");
  });

  it("endpoint registry marks staff queue reads as Nest in hybrid", () => {
    const staffList = ENDPOINT_DEFINITIONS.find(
      (entry) => entry.id === "certification.applications.staff.read.list",
    );
    const staffDetail = ENDPOINT_DEFINITIONS.find(
      (entry) => entry.id === "certification.applications.staff.read.detail",
    );

    expect(staffList?.hybridOwner).toBe("nest");
    expect(staffList?.nestPath).toBe("/v1/staff/certification/applications");
    expect(staffList?.legacyPath).toBe("/api/certification/applications");
    expect(staffDetail?.hybridOwner).toBe("nest");
  });

  it("mapNestStaffDetailToLegacy exposes boolean accommodation indicator only", async () => {
    const { mapNestStaffDetailToLegacy } = await import("@/lib/api-governance");
    const mapped = mapNestStaffDetailToLegacy(NEST_STAFF_DETAIL_ITEM);

    expect(mapped.accommodationRequested).toBe(true);
    expect(Object.keys(mapped)).not.toContain("accommodationReq");
  });
});

describe("learner submit regression guard (P1-B5-1b must not change B4-b)", () => {
  beforeEach(() => {
    vi.resetModules();
    apiGet.mockReset();
    vi.stubEnv("VITE_API_PROVIDER", "hybrid");
    vi.stubEnv("VITE_CONFORA_API_URL", "http://nest.example.test");
    vi.stubEnv("VITE_LEGACY_API_URL", "http://legacy.example.test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fetchMyCertificationApplications still uses learner Nest path, not staff path", async () => {
    apiGet.mockResolvedValue({ data: { contractVersion: "1.0.0", items: [] } });

    const { fetchMyCertificationApplications } = await import("@/lib/api-governance");
    await fetchMyCertificationApplications();

    expect(apiGet).toHaveBeenCalledWith("/v1/me/certification/applications");
    expect(apiGet).not.toHaveBeenCalledWith(
      "/v1/staff/certification/applications",
      expect.anything(),
    );
  });
});
