import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ADMIN_REPORT_EXPORT_KEYS,
  downloadAdminAuditEventsCsv,
  downloadAdminReportCsv,
  downloadAdminReportExport,
  fetchAdminCertificationApplicationsReport,
  fetchAdminExportCatalog,
} from "@/lib/admin-reports-api";
import * as reportsClient from "@/lib/api/reports-client";

const getMock = vi.fn();
const postMock = vi.fn();

describe("admin-reports-api (CA-H01 F4 cutover)", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_REPORTS_CANONICAL_ENABLED", "true");
    vi.stubEnv("VITE_REPORT_EXPORT_ENABLED", "true");
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock"),
      revokeObjectURL: vi.fn(),
    });
    vi.stubGlobal("document", {
      createElement: vi.fn(() => ({
        click: vi.fn(),
        href: "",
        download: "",
      })),
    });
    getMock.mockReset();
    postMock.mockReset();
    vi.spyOn(reportsClient, "getCertificationPipelineReport").mockResolvedValue({
      applicationsByStatus: { SUBMITTED: 2 },
    } as never);
    vi.spyOn(reportsClient, "getReportsCatalog").mockResolvedValue({
      reports: [{ key: "overview", title: "Overview", description: "", readOnly: true }],
    });
    vi.spyOn(reportsClient, "exportReport").mockResolvedValue({
      kind: "csv",
      blob: new Blob(["status,count\nSUBMITTED,2\n"]),
      filename: "confora-certification-pipeline-2026-07-05.csv",
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("uses canonical staff certification-pipeline for applications report", async () => {
    const report = await fetchAdminCertificationApplicationsReport();
    expect(reportsClient.getCertificationPipelineReport).toHaveBeenCalled();
    expect(report.applicationsByStatus).toEqual({ SUBMITTED: 2 });
  });

  it("uses canonical staff catalog for export catalog", async () => {
    const catalog = await fetchAdminExportCatalog();
    expect(reportsClient.getReportsCatalog).toHaveBeenCalled();
    expect(catalog.exports[0]?.path).toBe("/v1/staff/reports/overview");
  });

  it("export uses POST staff reports export", async () => {
    await downloadAdminReportExport("certification-pipeline", "certification-applications.csv");
    expect(reportsClient.exportReport).toHaveBeenCalledWith(
      expect.objectContaining({
        reportKey: "certification-pipeline",
        format: "CSV",
        includeAggregates: true,
      }),
    );
  });

  it("audit CSV export uses POST with reason", async () => {
    await downloadAdminAuditEventsCsv("certification");
    expect(reportsClient.exportReport).toHaveBeenCalledWith(
      expect.objectContaining({
        reportKey: "audit",
        format: "CSV",
        includeDetails: true,
        reason: expect.stringContaining("certification"),
      }),
    );
  });

  it("maps admin export buttons to canonical report keys", () => {
    expect(ADMIN_REPORT_EXPORT_KEYS.dashboard).toBe("overview");
    expect(ADMIN_REPORT_EXPORT_KEYS.certificationApplications).toBe("certification-pipeline");
    expect(ADMIN_REPORT_EXPORT_KEYS.auditEvents).toBe("audit");
  });

  it("rejects legacy GET export helper", async () => {
    await expect(downloadAdminReportCsv("/v1/admin/reports/exports/x.csv", "x.csv")).rejects.toThrow(
      "LEGACY_GET_EXPORT_REMOVED",
    );
  });
});

describe("admin-reports-api source scan", () => {
  it("does not embed forbidden legacy admin report GET paths", async () => {
    const source = await import("@/lib/admin-reports-api?raw").then((m) => m.default as string);
    expect(source).not.toMatch(/\/v1\/admin\/reports\/certification\//);
    expect(source).not.toMatch(/\/v1\/admin\/reports\/exports\//);
    expect(source).not.toMatch(/\/v1\/admin\/reports\/evidence\//);
  });
});
