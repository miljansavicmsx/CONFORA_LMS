import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { InternalAxiosRequestConfig } from "axios";

import { buildConforaApiUrl, resolveApiTarget } from "@/lib/api/api-provider";
import { PERSISTED_AUTH_STORAGE_KEY } from "@/lib/api/auth-token-provider";
import * as httpClient from "@/lib/api/http-client";
import {
  acknowledgeComplaint,
  CANONICAL_LEARNER_COMPLAINTS_PATH,
  CANONICAL_PUBLIC_COMPLAINTS_PATH,
  CANONICAL_STAFF_COMPLAINTS_PATH,
  getPublicComplaintStatus,
  listLearnerComplaints,
  submitLearnerComplaint,
  submitPublicComplaint,
} from "@/lib/api/complaints-client";
import { caseCategoryToComplaintType } from "@/lib/api/complaints-category.util";
import { isNestOnlyComplaintPath, resolveOwnerForPath } from "@/lib/api/endpoint-registry";

const getMock = vi.fn();
const postMock = vi.fn();

describe("complaints-client (F4-8c)", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_CONFORA_API_URL", "http://nest.example.test");
    vi.stubEnv("VITE_LEGACY_API_URL", "http://127.0.0.1:8000");
    // Clean-tree default is legacy; Nest complaint paths must still hit Nest.
    vi.stubEnv("VITE_API_PROVIDER", "legacy");
    vi.stubEnv("VITE_COMPLAINTS_CANONICAL_ENABLED", "true");
    getMock.mockReset();
    postMock.mockReset();
    vi.spyOn(httpClient, "getHttpClient").mockReturnValue({
      get: getMock,
      post: postMock,
    } as ReturnType<typeof httpClient.getHttpClient>);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    httpClient.resetHttpClientForTests();
  });

  it("maps legacy categories to B15 complaint types", () => {
    expect(caseCategoryToComplaintType("complaint")).toBe("PROCESS_COMPLAINT");
    expect(caseCategoryToComplaintType("technical_support")).toBe("TECHNICAL_SERVICE_COMPLAINT");
  });

  it("submitPublicComplaint posts JSON to canonical path", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ publicReference: "CMP-2026-abc", status: "SUBMITTED" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await submitPublicComplaint({
      category: "complaint",
      subject: "Subject",
      description: "Body",
      submitterName: "Ana",
      submitterEmail: "ana@example.com",
    });

    expect(result.publicReference).toBe("CMP-2026-abc");
    expect(result.status).toBe("SUBMITTED");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`http://nest.example.test${CANONICAL_PUBLIC_COMPLAINTS_PATH}`);
    expect(url).not.toContain("127.0.0.1:8000");
    expect(init.method).toBe("POST");
    const payload = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(payload.complaintType).toBe("PROCESS_COMPLAINT");
    expect(payload).not.toHaveProperty("tenantId");
    expect(payload).not.toHaveProperty("id");
  });

  it("submitPublicComplaint routes to Nest even when VITE_API_PROVIDER=legacy", async () => {
    vi.stubEnv("VITE_API_PROVIDER", "legacy");
    vi.stubEnv("VITE_CONFORA_API_URL", "http://nest.example.test");
    vi.stubEnv("VITE_LEGACY_API_URL", "http://legacy.example.test");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ publicReference: "CMP-ROUTE-1", status: "SUBMITTED" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await submitPublicComplaint({
      category: "complaint",
      subject: "Route",
      description: "Must hit Nest",
      submitterName: "Ana",
      submitterEmail: "ana@example.com",
    });

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`http://nest.example.test${CANONICAL_PUBLIC_COMPLAINTS_PATH}`);
    expect(url).not.toContain("legacy.example.test");
  });

  it("getPublicComplaintStatus returns safe fields only", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          publicReference: "CMP-2026-xyz",
          status: "ACKNOWLEDGED",
          submittedAt: "2026-06-14T10:00:00.000Z",
          nextStep: "Your complaint has been acknowledged.",
          tenantId: "secret",
          id: "uuid",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await getPublicComplaintStatus("CMP-2026-xyz");
    expect(result.publicReference).toBe("CMP-2026-xyz");
    expect(result.status).toBe("ACKNOWLEDGED");
    expect(result.submittedAt).toBe("2026-06-14T10:00:00.000Z");
    expect(result.nextStep).toContain("acknowledged");
    expect(result).not.toHaveProperty("tenantId");
    expect(result).not.toHaveProperty("id");
  });

  it("submitLearnerComplaint posts canonical B15 payload", async () => {
    postMock.mockResolvedValue({
      data: {
        complaint: {
          id: "uuid-submit-1",
          publicReference: "CMP-SUB-1",
          complaintType: "PROCESS_COMPLAINT",
          complaintTargetType: "CERTIFICATION_BODY",
          status: "SUBMITTED",
          submittedAt: "2026-08-02T12:00:00.000Z",
          complaintSummary: "Platform delay\n\nExam room wait exceeded SLA.",
        },
      },
    });

    const row = await submitLearnerComplaint({
      category: "complaint",
      subject: "Platform delay",
      description: "Exam room wait exceeded SLA.",
    });

    expect(postMock).toHaveBeenCalledWith(CANONICAL_LEARNER_COMPLAINTS_PATH, {
      complaintType: "PROCESS_COMPLAINT",
      complaintTargetType: "CERTIFICATION_BODY",
      complaintSummary: "Platform delay\n\nExam room wait exceeded SLA.",
    });
    expect(row.publicReference).toBe("CMP-SUB-1");
    expect(row.complaintId).toBe("uuid-submit-1");
    expect(row.subject).toBe("Platform delay");
  });

  it("listLearnerComplaints uses canonical learner path", async () => {
    getMock.mockResolvedValue({
      data: {
        items: [
          {
            id: "uuid-1",
            publicReference: "CMP-1",
            complaintType: "PROCESS_COMPLAINT",
            complaintTargetType: "CERTIFICATION_BODY",
            status: "SUBMITTED",
            submittedAt: "2026-06-14T10:00:00.000Z",
            complaintSummary: "Line one\n\nDetails",
          },
        ],
      },
    });

    const rows = await listLearnerComplaints();
    expect(getMock).toHaveBeenCalledWith(CANONICAL_LEARNER_COMPLAINTS_PATH);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.complaintId).toBe("uuid-1");
    expect(rows[0]?.publicReference).toBe("CMP-1");
    expect(rows[0]?.subject).toBe("Line one");
  });

  it("listLearnerComplaints never uses raw complaintType as subject", async () => {
    getMock.mockResolvedValue({
      data: {
        contractVersion: "1.5.0",
        items: [
          {
            id: "uuid-3",
            publicReference: "CMP-3",
            complaintType: "PROCESS_COMPLAINT",
            complaintTargetType: "CERTIFICATION_BODY",
            status: "SUBMITTED",
            submittedAt: "2026-06-14T10:00:00.000Z",
          },
        ],
      },
    });

    const rows = await listLearnerComplaints();
    expect(rows[0]?.subject).toBe("Prigovor CMP-3");
    expect(rows[0]?.subject).not.toContain("PROCESS_COMPLAINT");
  });

  it("listLearnerComplaints ignores enum-like requestedAction and prefers summary", async () => {
    getMock.mockResolvedValue({
      data: {
        items: [
          {
            id: "uuid-4",
            publicReference: "CMP-4",
            complaintType: "PROCESS_COMPLAINT",
            complaintTargetType: "CERTIFICATION_BODY",
            status: "SUBMITTED",
            submittedAt: "2026-06-14T10:00:00.000Z",
            requestedAction: "PROCESS_COMPLAINT",
            complaintSummary: "1R browser prigovor\n\nDetalji",
          },
        ],
      },
    });

    const rows = await listLearnerComplaints();
    expect(rows[0]?.subject).toBe("1R browser prigovor");
    expect(rows[0]?.subject).not.toContain("PROCESS_COMPLAINT");
  });

  it("listLearnerComplaints uses legacy alias when flag is false", async () => {
    vi.stubEnv("VITE_COMPLAINTS_CANONICAL_ENABLED", "false");
    getMock.mockResolvedValue({ data: { items: [] } });

    await listLearnerComplaints();
    expect(getMock).toHaveBeenCalledWith("/v1/me/complaints");
  });

  it("staff acknowledge path is canonical when enabled", async () => {
    postMock.mockResolvedValue({
      data: {
        complaint: {
          id: "uuid-2",
          publicReference: "CMP-2",
          complaintType: "PROCESS_COMPLAINT",
          complaintTargetType: "CERTIFICATION_BODY",
          status: "ACKNOWLEDGED",
          submittedAt: "2026-06-14T10:00:00.000Z",
        },
      },
    });

    const detail = await acknowledgeComplaint("uuid-2");
    expect(postMock).toHaveBeenCalledWith(`${CANONICAL_STAFF_COMPLAINTS_PATH}/uuid-2/acknowledge`, {});
    expect(detail.status).toBe("ACKNOWLEDGED");
  });
});

describe("nest-only complaint routing (028D-2aS5)", () => {
  const canonicalComplaintPaths = [
    "/v1/public/complaints",
    "/v1/public/complaints/",
    "/v1/public/complaints/123",
    "/v1/public/complaints?status=open",
    "/v1/public/complaints#history",
    "/v1/learner/complaints",
    "/v1/learner/complaints/",
    "/v1/learner/complaints/123",
    "/v1/learner/complaints?page=1",
    "/v1/staff/complaints",
    "/v1/staff/complaints/",
    "/v1/staff/complaints/123",
  ] as const;

  const noncanonicalSiblingPaths = [
    "/v1/public/complaints-extra",
    "/v1/public/complaintsextra",
    "/v1/public/complaints.evil",
    "/v1/public/complaintsBackup",
    "/v1/learner/complaints-old",
    "/v1/learner/complaintsBackup",
    "/v1/staff/complaints-old",
    "/v1/staff/complaintsBackup",
  ] as const;

  beforeEach(() => {
    vi.stubEnv("VITE_CONFORA_API_URL", "http://nest.example.test");
    vi.stubEnv("VITE_LEGACY_API_URL", "http://127.0.0.1:8000");
    vi.stubEnv("VITE_API_PROVIDER", "legacy");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("marks canonical complaint prefixes as Nest-only", () => {
    for (const path of canonicalComplaintPaths) {
      expect(isNestOnlyComplaintPath(path)).toBe(true);
      expect(resolveOwnerForPath(path, "legacy")).toBe("nest");
    }
    expect(isNestOnlyComplaintPath("/v1/me/complaints")).toBe(false);
    expect(isNestOnlyComplaintPath("/v1/admin/complaints")).toBe(false);
  });

  it("rejects noncanonical complaint siblings from the forced Nest override", () => {
    for (const path of noncanonicalSiblingPaths) {
      expect(isNestOnlyComplaintPath(path)).toBe(false);
      expect(resolveOwnerForPath(path, "legacy")).toBe("legacy");
    }
  });

  it("forces Nest owner under VITE_API_PROVIDER=legacy", () => {
    expect(resolveOwnerForPath(CANONICAL_PUBLIC_COMPLAINTS_PATH, "legacy")).toBe("nest");
    expect(resolveOwnerForPath(CANONICAL_LEARNER_COMPLAINTS_PATH, "legacy")).toBe("nest");
    expect(resolveOwnerForPath(`${CANONICAL_STAFF_COMPLAINTS_PATH}/uuid/acknowledge`, "legacy")).toBe(
      "nest",
    );
    expect(resolveOwnerForPath("/v1/me/complaints", "legacy")).toBe("legacy");
    expect(resolveOwnerForPath("/v1/admin/complaints", "legacy")).toBe("legacy");
  });

  it("preserves legacy complaint aliases across provider modes", () => {
    const aliases = ["/v1/me/complaints", "/v1/admin/complaints"] as const;
    const expectedOwners = {
      legacy: "legacy",
      nest: "nest",
      hybrid: "nest",
    } as const;

    for (const path of aliases) {
      for (const [provider, expectedOwner] of Object.entries(expectedOwners)) {
        expect(resolveOwnerForPath(path, provider as keyof typeof expectedOwners)).toBe(expectedOwner);
      }
    }

    vi.stubEnv("VITE_API_PROVIDER", "");
    for (const path of aliases) {
      expect(resolveApiTarget(path)).toMatchObject({
        baseUrl: "http://127.0.0.1:8000",
        owner: "legacy",
        provider: "legacy",
      });
    }
  });

  it("preserves unrelated endpoint ownership", () => {
    const routes = [
      { path: "/auth/login", legacy: "legacy", nest: "nest", hybrid: "legacy" },
      { path: "/v1/courses", legacy: "legacy", nest: "nest", hybrid: "nest" },
      { path: "/api/public/verify/certificate-1", legacy: "legacy", nest: "nest", hybrid: "nest" },
    ] as const;

    for (const route of routes) {
      expect(resolveOwnerForPath(route.path, "legacy")).toBe(route.legacy);
      expect(resolveOwnerForPath(route.path, "nest")).toBe(route.nest);
      expect(resolveOwnerForPath(route.path, "hybrid")).toBe(route.hybrid);
    }
  });

  it("buildConforaApiUrl uses Nest base for learner complaints under legacy provider", () => {
    expect(buildConforaApiUrl(CANONICAL_LEARNER_COMPLAINTS_PATH)).toBe(
      `http://nest.example.test${CANONICAL_LEARNER_COMPLAINTS_PATH}`,
    );
    expect(buildConforaApiUrl("/v1/me/complaints")).toBe("http://127.0.0.1:8000/v1/me/complaints");
    for (const path of noncanonicalSiblingPaths) {
      expect(buildConforaApiUrl(path)).toBe(`http://127.0.0.1:8000${path}`);
    }
  });
});

describe("authenticated complaint request boundary (028D-2aS5E)", () => {
  const syntheticAccessToken = "synthetic-complaint-access-token";
  const browserIdentityFields = [
    "userId",
    "candidateId",
    "actorId",
    "role",
    "permission",
    "permissionCode",
    "tenantId",
    "tenant_id",
  ] as const;

  function installRecordingAdapter(responseData: unknown): InternalAxiosRequestConfig[] {
    const requests: InternalAxiosRequestConfig[] = [];
    const client = httpClient.getHttpClient();
    client.defaults.adapter = async (config) => {
      requests.push(config);
      return {
        data: responseData,
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };
    return requests;
  }

  beforeEach(() => {
    vi.stubEnv("VITE_CONFORA_API_URL", "http://nest.example.test");
    vi.stubEnv("VITE_LEGACY_API_URL", "http://127.0.0.1:8000");
    vi.stubEnv("VITE_API_PROVIDER", "legacy");
    vi.stubEnv("VITE_COMPLAINTS_CANONICAL_ENABLED", "true");
    localStorage.setItem(
      PERSISTED_AUTH_STORAGE_KEY,
      JSON.stringify({
        state: {
          accessToken: syntheticAccessToken,
          refreshToken: "synthetic-complaint-refresh-token",
          isAuthenticated: true,
        },
        version: 0,
      }),
    );
    httpClient.resetHttpClientForTests();
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
    httpClient.resetHttpClientForTests();
  });

  it("sends Bearer Authorization on authenticated complaint submission", async () => {
    const requests = installRecordingAdapter({
      complaint: {
        id: "uuid-auth-submit",
        publicReference: "CMP-AUTH-SUBMIT",
        complaintType: "PROCESS_COMPLAINT",
        complaintTargetType: "CERTIFICATION_BODY",
        status: "SUBMITTED",
        submittedAt: "2026-08-04T08:00:00.000Z",
        complaintSummary: "Authorization boundary\n\nSynthetic request only.",
      },
    });

    await submitLearnerComplaint({
      category: "complaint",
      subject: "Authorization boundary",
      description: "Synthetic request only.",
    });

    expect(requests).toHaveLength(1);
    const request = requests[0]!;
    expect(request.url).toBe(CANONICAL_LEARNER_COMPLAINTS_PATH);
    expect(request.baseURL).toBe("http://nest.example.test");
    expect(request.headers.get("Authorization")).toBe(`Bearer ${syntheticAccessToken}`);
    const payload = JSON.parse(String(request.data)) as Record<string, unknown>;
    for (const field of browserIdentityFields) {
      expect(payload).not.toHaveProperty(field);
    }
  });

  it("sends Bearer Authorization on authenticated learner complaint listing", async () => {
    const requests = installRecordingAdapter({ items: [] });

    await listLearnerComplaints();

    expect(requests).toHaveLength(1);
    const request = requests[0]!;
    expect(request.method).toBe("get");
    expect(request.url).toBe(CANONICAL_LEARNER_COMPLAINTS_PATH);
    expect(request.baseURL).toBe("http://nest.example.test");
    expect(request.headers.get("Authorization")).toBe(`Bearer ${syntheticAccessToken}`);
    expect(request.data).toBeUndefined();
  });
});
