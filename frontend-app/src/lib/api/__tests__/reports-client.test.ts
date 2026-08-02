import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as httpClient from "@/lib/api/http-client";
import {
  CANONICAL_STAFF_REPORTS_EXPORT_PATH,
  CANONICAL_STAFF_REPORTS_PATH,
  exportReport,
  fetchReportsSummary,
  getOverviewReport,
  getReportExportPolicy,
  getReportsCatalog,
  reportsExportUrl,
} from "@/lib/api/reports-client";
import { requiresExportReason } from "@/lib/api/reports-export.util";

const getMock = vi.fn();
const postMock = vi.fn();

describe("reports-client (F4-8e)", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_CONFORA_API_URL", "http://nest.example.test");
    vi.stubEnv("VITE_REPORTS_CANONICAL_ENABLED", "true");
    vi.stubEnv("VITE_REPORT_EXPORT_ENABLED", "true");
    getMock.mockReset();
    postMock.mockReset();
    vi.spyOn(httpClient, "getHttpClient").mockReturnValue({
      get: getMock,
      post: postMock,
    } as unknown as ReturnType<typeof httpClient.getHttpClient>);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    httpClient.resetHttpClientForTests();
  });

  it("getOverviewReport uses canonical staff path", async () => {
    getMock.mockResolvedValue({
      data: { counts: { appeals: { open: 1 } }, generatedAt: "2026-06-14T00:00:00.000Z" },
    });

    const result = await getOverviewReport({ dateFrom: "2026-01-01" });
    expect(getMock).toHaveBeenCalledWith(`${CANONICAL_STAFF_REPORTS_PATH}/overview`, {
      params: { dateFrom: "2026-01-01" },
    });
    expect(result).toMatchObject({ counts: { appeals: { open: 1 } } });
  });

  it("getReportsCatalog uses staff path when canonical enabled", async () => {
    getMock.mockResolvedValue({ data: { reports: [{ key: "overview", title: "Overview", description: "", readOnly: true }] } });

    await getReportsCatalog();
    expect(getMock).toHaveBeenCalledWith(`${CANONICAL_STAFF_REPORTS_PATH}/catalog`);
  });

  it("getReportsCatalog uses legacy admin alias when flag is false", async () => {
    vi.stubEnv("VITE_REPORTS_CANONICAL_ENABLED", "false");
    getMock.mockResolvedValue({ data: { reports: [] } });

    await getReportsCatalog();
    expect(getMock).toHaveBeenCalledWith("/v1/admin/reports/catalog");
  });

  it("fetchReportsSummary maps overview to legacy-compatible sections", async () => {
    getMock
      .mockResolvedValueOnce({
        data: {
          counts: {
            certificationApplications: { submitted: 2, underReview: 1 },
            certificates: { examPassCertificatesSampled: 5 },
            appeals: { OPEN: 1 },
            complaints: { SUBMITTED: 3 },
          },
          generatedAt: "2026-06-14T12:00:00.000Z",
        },
      })
      .mockResolvedValueOnce({ data: { available: ["overview", "certificates"] } });

    const summary = await fetchReportsSummary({ from: "2026-06-01", to: "2026-06-14" });
    expect(summary.denied).toBe(false);
    expect(summary.roleSections).toEqual(["overview", "certificates"]);
    expect(summary.certificationFunnel).toHaveLength(2);
    expect(summary.appealsAndComplaints?.appealsByStatus).toEqual({ OPEN: 1 });
    expect(getMock).toHaveBeenCalledWith(`${CANONICAL_STAFF_REPORTS_PATH}/overview`, {
      params: { dateFrom: "2026-06-01", dateTo: "2026-06-14" },
    });
  });

  it("getReportExportPolicy returns empty policy when export disabled", async () => {
    vi.stubEnv("VITE_REPORT_EXPORT_ENABLED", "false");
    const policy = await getReportExportPolicy();
    expect(policy.formats).toEqual([]);
    expect(getMock).not.toHaveBeenCalled();
  });

  it("exportReport posts CSV and returns blob result", async () => {
    postMock.mockResolvedValue({
      data: "status,count\nsubmitted,2\n",
      headers: { "content-disposition": 'attachment; filename="confora-certificates-2026-06-14.csv"' },
    });

    const result = await exportReport({ reportKey: "certificates", format: "CSV" });
    expect(postMock).toHaveBeenCalledWith(
      CANONICAL_STAFF_REPORTS_EXPORT_PATH,
      { reportKey: "certificates", format: "CSV" },
      expect.objectContaining({ responseType: "text" }),
    );
    expect(result.kind).toBe("csv");
    if (result.kind === "csv") {
      expect(result.filename).toBe("confora-certificates-2026-06-14.csv");
    }
  });

  it("exportReport posts JSON envelope", async () => {
    postMock.mockResolvedValue({
      data: { reportKey: "overview", format: "JSON", rowCount: 0, data: [] },
    });

    const result = await exportReport({ reportKey: "overview", format: "JSON" });
    expect(result.kind).toBe("json");
    if (result.kind === "json") {
      expect(result.data.reportKey).toBe("overview");
    }
  });

  it("exportReport rejects when export flag disabled", async () => {
    vi.stubEnv("VITE_REPORT_EXPORT_ENABLED", "false");
    await expect(exportReport({ reportKey: "overview", format: "JSON" })).rejects.toMatchObject({
      status: 403,
      message: "EXPORT_DISABLED",
    });
  });

  it("reportsExportUrl is removed", () => {
    expect(() => reportsExportUrl("certificates")).toThrow("LEGACY_GET_EXPORT_REMOVED");
  });

  it("requiresExportReason for sensitive keys", () => {
    expect(requiresExportReason("audit")).toBe(true);
    expect(requiresExportReason("certificates")).toBe(false);
    expect(requiresExportReason("contact-requests", false)).toBe(false);
    expect(requiresExportReason("contact-requests", true)).toBe(true);
  });
});
