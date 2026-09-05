/**
 * EXPERIMENTAL KEEP14 corrections — disposable FIX_PROBE only.
 * Not implementation authority.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AxiosInstance } from "axios";

import * as httpClient from "@/lib/api/http-client";
import {
  buildCertificationApplicationsReportParams,
  calendarDateToP08DayEndUtc,
  calendarDateToP08DayStartUtc,
  getCertificationApplicationsBySchemeRef,
  getCertificationApplicationsByStatus,
  isValidP08Rfc3339,
  P08_RFC3339_PATTERN,
  REPORTS_BY_SCHEME_REF_PATH,
  REPORTS_BY_STATUS_PATH,
  T026_NETWORK_QUERY_KEYS,
} from "@/lib/api/reports-client";

const getMock = vi.fn();

describe("reports-client (T026 BAR-P08)", () => {
  beforeEach(() => {
    getMock.mockReset();
    vi.spyOn(httpClient, "getHttpClient").mockReturnValue({
      get: getMock,
    } as unknown as AxiosInstance);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    httpClient.resetHttpClientForTests();
  });

  it("exposes exactly two public report network operations", () => {
    expect(typeof getCertificationApplicationsByStatus).toBe("function");
    expect(typeof getCertificationApplicationsBySchemeRef).toBe("function");
    expect(T026_NETWORK_QUERY_KEYS).toHaveLength(6);
  });

  it("by-status uses exact P08 GET route", async () => {
    getMock.mockResolvedValue({ data: { groups: [] } });
    await getCertificationApplicationsByStatus({
      createdFrom: "2026-01-01T00:00:00.000Z",
      createdTo: "2026-01-31T23:59:59.999Z",
    });
    expect(getMock).toHaveBeenCalledTimes(1);
    const [path, config] = getMock.mock.calls[0] as [string, { params: Record<string, string> }];
    expect(path).toBe(REPORTS_BY_STATUS_PATH);
    expect(path).toBe("/v1/staff/reports/certification-applications/by-status");
    expect(config).toEqual(
      expect.objectContaining({
        params: expect.any(Object),
      }),
    );
  });

  it("by-scheme-ref uses exact P08 GET route", async () => {
    getMock.mockResolvedValue({ data: { groups: [] } });
    await getCertificationApplicationsBySchemeRef({
      createdFrom: "2026-01-01T00:00:00.000Z",
      createdTo: "2026-01-31T23:59:59.999Z",
    });
    const [path] = getMock.mock.calls[0] as [string];
    expect(path).toBe(REPORTS_BY_SCHEME_REF_PATH);
    expect(path).toBe("/v1/staff/reports/certification-applications/by-scheme-ref");
  });

  it("uses GET only with exactly six supported query keys", async () => {
    getMock.mockResolvedValue({ data: { groups: [] } });
    await getCertificationApplicationsByStatus({
      status: "SUBMITTED",
      schemeRef: "SCHEME-1",
      createdFrom: "2026-01-01T00:00:00.000Z",
      createdTo: "2026-01-31T23:59:59.999Z",
      submittedFrom: "2026-01-01T00:00:00.000Z",
      submittedTo: "2026-01-31T23:59:59.999Z",
    });
    const [, config] = getMock.mock.calls[0] as [string, { params: Record<string, string> }];
    const keys = Object.keys(config.params).sort();
    expect(keys).toEqual([...T026_NETWORK_QUERY_KEYS].sort());
    expect(config.params.status).toBe("SUBMITTED");
    expect(config.params.schemeRef).toBe("SCHEME-1");
    expect(config.params).not.toHaveProperty("dateFrom");
    expect(config.params).not.toHaveProperty("dateTo");
    expect(config.params).not.toHaveProperty("limit");
    expect(config.params).not.toHaveProperty("offset");
    expect(config.params).not.toHaveProperty("tenantId");
    expect(config.params).not.toHaveProperty("organizationId");
    expect(config.params).not.toHaveProperty("groupBy");
  });

  it("transmits status and schemeRef exactly", () => {
    const params = buildCertificationApplicationsReportParams({
      status: "UNDER_REVIEW",
      schemeRef: "ISO-17024-A",
      createdFrom: "2026-02-01T00:00:00Z",
      createdTo: "2026-02-28T23:59:59Z",
    });
    expect(params.status).toBe("UNDER_REVIEW");
    expect(params.schemeRef).toBe("ISO-17024-A");
  });

  it("accepts OPTIONAL_1_TO_3_DIGITS RFC3339 and rejects invalid fractions", () => {
    expect(isValidP08Rfc3339("2026-01-01T00:00:00Z")).toBe(true);
    expect(isValidP08Rfc3339("2026-01-01T00:00:00.1Z")).toBe(true);
    expect(isValidP08Rfc3339("2026-01-01T00:00:00.12Z")).toBe(true);
    expect(isValidP08Rfc3339("2026-01-01T00:00:00.123Z")).toBe(true);
    expect(isValidP08Rfc3339("2026-01-01T00:00:00.1234Z")).toBe(false);
    expect(isValidP08Rfc3339("2026-01-01T00:00:00.Z")).toBe(false);
    expect(isValidP08Rfc3339("2026-01-01T00:00:00z")).toBe(false);
    expect(isValidP08Rfc3339("2026-01-01")).toBe(false);
    expect(isValidP08Rfc3339("2026-01-01T00:00:00")).toBe(false);
    expect(P08_RFC3339_PATTERN.test("2026-01-01T12:30:00+02:00")).toBe(true);
  });

  it("calendar date helpers emit valid RFC3339 with 1–3 fractional digits", () => {
    const start = calendarDateToP08DayStartUtc("2026-03-01");
    const end = calendarDateToP08DayEndUtc("2026-03-31");
    expect(isValidP08Rfc3339(start)).toBe(true);
    expect(isValidP08Rfc3339(end)).toBe(true);
    expect(start).toBe("2026-03-01T00:00:00.000Z");
    expect(end).toBe("2026-03-31T23:59:59.999Z");
  });

  it("preserves omitted total and does not invent rows", async () => {
    getMock.mockResolvedValue({
      data: {
        groups: [
          { status: "SUBMITTED", suppressed: false, count: 0 },
          { status: "APPROVED", suppressed: true },
          { status: "REJECTED", suppressed: false, count: 12 },
        ],
      },
    });
    const result = await getCertificationApplicationsByStatus({
      createdFrom: "2026-01-01T00:00:00.000Z",
      createdTo: "2026-01-31T23:59:59.999Z",
    });
    expect(result.total).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(result, "total")).toBe(false);
    expect(result.groups).toHaveLength(3);
  });

  it.each([400, 401, 403, 429, 500] as const)("safely surfaces HTTP %s", async (status) => {
    getMock.mockRejectedValue({
      isAxiosError: true,
      response: { status, data: { message: "fail" } },
      message: "fail",
    });
    await expect(
      getCertificationApplicationsByStatus({
        createdFrom: "2026-01-01T00:00:00.000Z",
        createdTo: "2026-01-31T23:59:59.999Z",
      }),
    ).rejects.toMatchObject({ status });
  });

  it("safely handles network failure", async () => {
    getMock.mockRejectedValue({
      isAxiosError: true,
      request: {},
      message: "Network Error",
    });
    await expect(
      getCertificationApplicationsByStatus({
        createdFrom: "2026-01-01T00:00:00.000Z",
        createdTo: "2026-01-31T23:59:59.999Z",
      }),
    ).rejects.toMatchObject({ status: 0, code: "NETWORK_ERROR" });
  });

  it("source does not expose export or generic report endpoints", async () => {
    const { readFileSync } = await import("node:fs");
    const { fileURLToPath } = await import("node:url");
    const { dirname, resolve } = await import("node:path");
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(resolve(here, "../reports-client.ts"), "utf8");
    expect(source).not.toMatch(/exportReport/);
    expect(source).not.toMatch(/getReportsCatalog/);
    expect(source).not.toMatch(/\/v1\/staff\/reports\/export/);
    expect(source).not.toMatch(/\/v1\/staff\/reports\/catalog/);
    // Forbid transmitting dateFrom as a network param — allow deny-list mentions only.
    expect(source).not.toMatch(/params\.dateFrom|createdFrom:\s*query\.dateFrom|["']dateFrom["']\s*:/);
    expect(source).not.toMatch(/refetchInterval/);
    expect(source).not.toMatch(/localStorage/);
    expect(source).not.toMatch(/X-Tenant-ID/);
    // Behavior: network builder never emits forbidden keys
    const params = buildCertificationApplicationsReportParams({
      createdFrom: "2026-01-01T00:00:00.000Z",
      createdTo: "2026-01-31T23:59:59.999Z",
    });
    expect(Object.keys(params).every((k) => (T026_NETWORK_QUERY_KEYS as readonly string[]).includes(k))).toBe(
      true,
    );
  });
});
