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

const REVIEW_STATUS_RESPONSE = {
  contractVersion: "1.0.0",
  applicationId: APP_ID,
  applicationStatus: "SUBMITTED",
  reviewState: "NOT_STARTED",
  assignmentStatus: "ACCEPTED",
  assigneeReference: "rev-b5200000",
  reviewStartedAt: null,
} as const;

describe("api-staff-cert-begin-review (P1-B5-3b)", () => {
  beforeEach(() => {
    vi.resetModules();
    apiGet.mockReset();
    apiPost.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fetchApplicationReviewStatus uses Nest-only path", async () => {
    apiGet.mockResolvedValue({ data: REVIEW_STATUS_RESPONSE });

    const { fetchApplicationReviewStatus, assertReviewStatusResponseRedacted } = await import(
      "@/lib/api-staff-cert-begin-review"
    );
    const result = await fetchApplicationReviewStatus(APP_ID);

    expect(apiGet).toHaveBeenCalledWith(
      `/v1/staff/certification/applications/${APP_ID}/review/status`,
    );
    expect(result.reviewState).toBe("NOT_STARTED");
    assertReviewStatusResponseRedacted(result);
    expect(JSON.stringify(result)).not.toMatch(/tenantId|userId|complianceSignature/i);
  });

  it("startApplicationReview posts to Nest-only start path", async () => {
    apiPost.mockResolvedValue({
      data: {
        ...REVIEW_STATUS_RESPONSE,
        applicationStatus: "UNDER_REVIEW",
        reviewState: "IN_PROGRESS",
        assignmentStatus: "IN_REVIEW",
        reviewStartedAt: "2026-03-02T12:00:00.000Z",
      },
    });

    const { startApplicationReview } = await import("@/lib/api-staff-cert-begin-review");
    const result = await startApplicationReview(APP_ID);

    expect(apiPost).toHaveBeenCalledWith(
      `/v1/staff/certification/applications/${APP_ID}/review/start`,
      {},
    );
    expect(result.reviewState).toBe("IN_PROGRESS");
    expect(result.applicationStatus).toBe("UNDER_REVIEW");
  });

  it("startApplicationReview rejects non-Nest paths at runtime", async () => {
    const { startApplicationReview } = await import("@/lib/api-staff-cert-begin-review");
    await expect(startApplicationReview("")).rejects.toThrow(/missing_application_id/i);
  });

  it("mapStaffBeginReviewError maps 403 to forbidden key", async () => {
    const axios = await import("axios");
    const { mapStaffBeginReviewError } = await import("@/lib/api-staff-cert-begin-review");
    const err = new axios.default.AxiosError("Forbidden", undefined, undefined, undefined, {
      status: 403,
      data: { message: "Insufficient role" },
      statusText: "Forbidden",
      headers: {},
      config: {} as never,
    });
    const mapped = mapStaffBeginReviewError(err);
    expect(mapped.code).toBe("FORBIDDEN");
    expect(mapped.messageKey).toBe("review.errors.forbidden");
  });

  it("mapStaffBeginReviewError maps 409 to alreadyInReview key", async () => {
    const axios = await import("axios");
    const { mapStaffBeginReviewError } = await import("@/lib/api-staff-cert-begin-review");
    const err = new axios.default.AxiosError("Conflict", undefined, undefined, undefined, {
      status: 409,
      data: { message: "Review already started" },
      statusText: "Conflict",
      headers: {},
      config: {} as never,
    });
    const mapped = mapStaffBeginReviewError(err);
    expect(mapped.code).toBe("ALREADY_IN_REVIEW");
    expect(mapped.messageKey).toBe("review.errors.alreadyInReview");
  });

  it("mapStaffBeginReviewError maps 404 to notFound key", async () => {
    const axios = await import("axios");
    const { mapStaffBeginReviewError } = await import("@/lib/api-staff-cert-begin-review");
    const err = new axios.default.AxiosError("Not Found", undefined, undefined, undefined, {
      status: 404,
      data: { message: "Application not found" },
      statusText: "Not Found",
      headers: {},
      config: {} as never,
    });
    const mapped = mapStaffBeginReviewError(err);
    expect(mapped.code).toBe("NOT_FOUND");
    expect(mapped.messageKey).toBe("review.errors.notFound");
  });

  it("mapStaffBeginReviewError maps COI/SoD 403 to conflict key", async () => {
    const axios = await import("axios");
    const { mapStaffBeginReviewError } = await import("@/lib/api-staff-cert-begin-review");
    const err = new axios.default.AxiosError("Forbidden", undefined, undefined, undefined, {
      status: 403,
      data: { message: "Conflict of interest blocked" },
      statusText: "Forbidden",
      headers: {},
      config: {} as never,
    });
    const mapped = mapStaffBeginReviewError(err);
    expect(mapped.code).toBe("CONFLICT");
    expect(mapped.messageKey).toBe("review.errors.conflict");
  });

  it("mapStaffBeginReviewError maps 400 precondition to precondition key", async () => {
    const axios = await import("axios");
    const { mapStaffBeginReviewError } = await import("@/lib/api-staff-cert-begin-review");
    const err = new axios.default.AxiosError("Bad Request", undefined, undefined, undefined, {
      status: 400,
      data: { message: "Application must be SUBMITTED with ACCEPTED assignment" },
      statusText: "Bad Request",
      headers: {},
      config: {} as never,
    });
    const mapped = mapStaffBeginReviewError(err);
    expect(mapped.code).toBe("PRECONDITION");
    expect(mapped.messageKey).toBe("review.errors.precondition");
  });

  it("registers Nest-only begin-review endpoints without legacy fallback", () => {
    const status = ENDPOINT_DEFINITIONS.find(
      (e) => e.id === "certification.applications.staff.review.status",
    );
    const start = ENDPOINT_DEFINITIONS.find(
      (e) => e.id === "certification.applications.staff.review.start",
    );
    expect(status?.hybridOwner).toBe("nest");
    expect(start?.hybridOwner).toBe("nest");
    expect(status?.nestPath).toContain("/v1/staff/certification/applications");
  });
});
