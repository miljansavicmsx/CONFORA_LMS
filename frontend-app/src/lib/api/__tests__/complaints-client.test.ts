import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildConforaApiUrl, resolveApiTarget } from "@/lib/api/api-provider";
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
  const noncanonicalSiblingPaths = [
    "/v1/public/complaints-extra",
    "/v1/public/complaints.evil",
    "/v1/learner/complaints-old",
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
    expect(isNestOnlyComplaintPath(CANONICAL_PUBLIC_COMPLAINTS_PATH)).toBe(true);
    expect(isNestOnlyComplaintPath(CANONICAL_LEARNER_COMPLAINTS_PATH)).toBe(true);
    expect(isNestOnlyComplaintPath(`${CANONICAL_STAFF_COMPLAINTS_PATH}/uuid/acknowledge`)).toBe(true);
    expect(isNestOnlyComplaintPath(`${CANONICAL_LEARNER_COMPLAINTS_PATH}?status=SUBMITTED`)).toBe(true);
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
