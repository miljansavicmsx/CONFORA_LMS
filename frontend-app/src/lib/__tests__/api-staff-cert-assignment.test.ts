import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ENDPOINT_DEFINITIONS } from "@/lib/api/endpoint-registry";

const apiGet = vi.fn();
const apiPost = vi.fn();

vi.mock("@/lib/api", () => ({
  api: {
    get: (...args: unknown[]) => apiGet(...args),
    post: (...args: unknown[]) => apiPost(...args),
  },
}));

const APP_ID = "a5100001-0000-4000-8000-000000000001";
const REVIEWER_ID = "b5200000-0000-4000-8000-000000000020";

const ASSIGNMENT_RESPONSE = {
  contractVersion: "1.0.0",
  applicationId: APP_ID,
  applicationStatus: "SUBMITTED",
  current: {
    assignmentId: "assign-1",
    applicationId: APP_ID,
    status: "ASSIGNED",
    assigneeReference: "rev-b5200000",
    assignmentType: "MANUAL",
    rationale: null,
    declineReason: null,
    assignedAt: "2026-03-02T10:00:00.000Z",
    updatedAt: "2026-03-02T10:00:00.000Z",
  },
  history: [],
} as const;

describe("api-staff-cert-assignment (P1-B5-2b)", () => {
  beforeEach(() => {
    vi.resetModules();
    apiGet.mockReset();
    apiPost.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fetchApplicationAssignment uses Nest-only path", async () => {
    apiGet.mockResolvedValue({ data: ASSIGNMENT_RESPONSE });

    const { fetchApplicationAssignment, assertAssignmentResponseRedacted } = await import(
      "@/lib/api-staff-cert-assignment"
    );
    const result = await fetchApplicationAssignment(APP_ID);

    expect(apiGet).toHaveBeenCalledWith(
      `/v1/staff/certification/applications/${APP_ID}/assignment`,
    );
    expect(result.applicationStatus).toBe("SUBMITTED");
    assertAssignmentResponseRedacted(result);
    expect(JSON.stringify(result)).not.toMatch(/tenantId|userId|complianceSignature/i);
  });

  it("assignApplicationReviewer posts assigneeId to Nest assign path", async () => {
    apiPost.mockResolvedValue({ data: ASSIGNMENT_RESPONSE });

    const { assignApplicationReviewer } = await import("@/lib/api-staff-cert-assignment");
    await assignApplicationReviewer(APP_ID, REVIEWER_ID, "Workload balance");

    expect(apiPost).toHaveBeenCalledWith(
      `/v1/staff/certification/applications/${APP_ID}/assign`,
      { assigneeId: REVIEWER_ID, rationale: "Workload balance" },
    );
  });

  it("acceptApplicationAssignment sends coiDeclarationAccepted", async () => {
    apiPost.mockResolvedValue({
      data: {
        ...ASSIGNMENT_RESPONSE,
        current: { ...ASSIGNMENT_RESPONSE.current, status: "ACCEPTED" },
      },
    });

    const { acceptApplicationAssignment } = await import("@/lib/api-staff-cert-assignment");
    await acceptApplicationAssignment(APP_ID);

    expect(apiPost).toHaveBeenCalledWith(
      `/v1/staff/certification/applications/${APP_ID}/assignment/accept`,
      { coiDeclarationAccepted: true },
    );
  });

  it("declineApplicationAssignment requires minimum reason length client-side", async () => {
    const { declineApplicationAssignment } = await import("@/lib/api-staff-cert-assignment");
    await expect(declineApplicationAssignment(APP_ID, "no")).rejects.toMatchObject({
      messageKey: "assignment.errors.declineReasonRequired",
    });
    expect(apiPost).not.toHaveBeenCalled();
  });

  it("declineApplicationAssignment posts declineReason", async () => {
    apiPost.mockResolvedValue({ data: ASSIGNMENT_RESPONSE });

    const { declineApplicationAssignment } = await import("@/lib/api-staff-cert-assignment");
    await declineApplicationAssignment(APP_ID, "Workload conflict this quarter");

    expect(apiPost).toHaveBeenCalledWith(
      `/v1/staff/certification/applications/${APP_ID}/assignment/decline`,
      { declineReason: "Workload conflict this quarter" },
    );
  });

  it("mapStaffAssignmentError maps 403 to forbidden key", async () => {
    const axios = await import("axios");
    const { mapStaffAssignmentError } = await import("@/lib/api-staff-cert-assignment");
    const err = new axios.default.AxiosError("Forbidden", undefined, undefined, undefined, {
      status: 403,
      data: { message: "Insufficient role" },
      statusText: "Forbidden",
      headers: {},
      config: {} as never,
    });
    const mapped = mapStaffAssignmentError(err);
    expect(mapped.code).toBe("FORBIDDEN");
    expect(mapped.messageKey).toBe("assignment.errors.forbidden");
  });

  it("mapStaffAssignmentError maps COI message to conflict key", async () => {
    const axios = await import("axios");
    const { mapStaffAssignmentError } = await import("@/lib/api-staff-cert-assignment");
    const err = new axios.default.AxiosError("Conflict", undefined, undefined, undefined, {
      status: 403,
      data: { message: "COI: actor trained this candidate" },
      statusText: "Forbidden",
      headers: {},
      config: {} as never,
    });
    const mapped = mapStaffAssignmentError(err);
    expect(mapped.code).toBe("CONFLICT");
    expect(mapped.messageKey).toBe("assignment.errors.conflict");
  });

  it("assignment endpoints registered as Nest hybrid owner", () => {
    const ids = [
      "certification.applications.staff.assignment.read",
      "certification.applications.staff.assignment.assign",
      "certification.applications.staff.assignment.accept",
      "certification.applications.staff.assignment.decline",
    ];
    for (const id of ids) {
      const entry = ENDPOINT_DEFINITIONS.find((e) => e.id === id);
      expect(entry?.hybridOwner).toBe("nest");
      expect(entry?.nestPath).toBe("/v1/staff/certification/applications");
    }
  });
});

describe("staff queue regression (P1-B5-2b must not change B5-1 read paths)", () => {
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

  it("fetchStaffCertificationApplications still uses staff list path", async () => {
    apiGet.mockResolvedValue({ data: { contractVersion: "1.0.0", items: [] } });
    const { fetchStaffCertificationApplications } = await import("@/lib/api-governance");
    await fetchStaffCertificationApplications();
    expect(apiGet).toHaveBeenCalledWith("/v1/staff/certification/applications", { params: undefined });
  });
});
