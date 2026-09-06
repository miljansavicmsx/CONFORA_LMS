/**
 * EXPERIMENTAL KEEP14 corrections — disposable FIX_PROBE only.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { createConforaI18n, CERTIFICATION_STAFF_NS } from "@confora/i18n";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  formatAggregateCountLabel,
  isTotalOmitted,
  loadAdminCertificationApplicationsReport,
  T026_REPORT_CATALOG,
} from "@/lib/admin-reports-api";
import * as reportsClient from "@/lib/api/reports-client";
import AdminReportsPage from "@/pages/admin/AdminReportsPage";

import enCertificationStaff from "../../../../packages/i18n/locales/en/certificationStaff.json";

function renderPage(): void {
  const i18n = createConforaI18n({ lng: "en", fallbackLng: "en" });
  void i18n.addResourceBundle(CERTIFICATION_STAFF_NS, "translation", enCertificationStaff, true, true);
  // createConforaI18n may already register NS; also try direct ns add
  void i18n.addResourceBundle("en", CERTIFICATION_STAFF_NS, enCertificationStaff, true, true);
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { readonly children?: ReactNode }): ReactNode {
    return createElement(
      I18nextProvider,
      { i18n },
      createElement(QueryClientProvider, { client: qc }, children),
    );
  }
  render(createElement(AdminReportsPage), { wrapper: Wrapper });
}

describe("admin-reports-api (T026 BAR-P08 adapter)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("static catalog contains exactly two approved views", () => {
    expect(T026_REPORT_CATALOG).toHaveLength(2);
    expect(T026_REPORT_CATALOG.map((e) => e.id)).toEqual(["by-status", "by-scheme-ref"]);
  });

  it("loadAdminCertificationApplicationsReport calls only the selected P08 operation", async () => {
    const byStatus = vi.spyOn(reportsClient, "getCertificationApplicationsByStatus").mockResolvedValue({
      groups: [{ status: "SUBMITTED", suppressed: false, count: 0 }],
    });
    const byScheme = vi.spyOn(reportsClient, "getCertificationApplicationsBySchemeRef").mockResolvedValue({
      groups: [{ schemeRef: "S1", suppressed: false, count: 9 }],
    });

    const statusResult = await loadAdminCertificationApplicationsReport("by-status", {
      createdFrom: "2026-01-01T00:00:00.000Z",
      createdTo: "2026-01-31T23:59:59.999Z",
    });
    expect(byStatus).toHaveBeenCalledOnce();
    expect(byScheme).not.toHaveBeenCalled();
    expect(statusResult.view).toBe("by-status");

    const schemeResult = await loadAdminCertificationApplicationsReport("by-scheme-ref", {
      createdFrom: "2026-01-01T00:00:00.000Z",
      createdTo: "2026-01-31T23:59:59.999Z",
    });
    expect(byScheme).toHaveBeenCalledOnce();
    expect(schemeResult.view).toBe("by-scheme-ref");
  });

  it("PRIVACY_MATRIX_20: defensive small-cell threshold with SafeInteger fail-closed", () => {
    const label = "Suppressed";
    // PRIV-01
    expect(formatAggregateCountLabel({ status: "DRAFT", suppressed: false, count: 0 }, label)).toBe("0");
    // PRIV-02..05
    expect(formatAggregateCountLabel({ status: "DRAFT", suppressed: false, count: 1 }, label)).toBe(label);
    expect(formatAggregateCountLabel({ status: "DRAFT", suppressed: false, count: 2 }, label)).toBe(label);
    expect(formatAggregateCountLabel({ status: "DRAFT", suppressed: false, count: 3 }, label)).toBe(label);
    expect(formatAggregateCountLabel({ status: "DRAFT", suppressed: false, count: 4 }, label)).toBe(label);
    // PRIV-06..07 positive controls
    expect(formatAggregateCountLabel({ status: "DRAFT", suppressed: false, count: 5 }, label)).toBe("5");
    expect(formatAggregateCountLabel({ status: "DRAFT", suppressed: false, count: 6 }, label)).toBe("6");
    // PRIV-08..12 suppressed=true dominates (cast for adversarial metadata)
    expect(formatAggregateCountLabel({ status: "DRAFT", suppressed: true, count: 0 } as never, label)).toBe(label);
    expect(formatAggregateCountLabel({ status: "DRAFT", suppressed: true, count: 1 } as never, label)).toBe(label);
    expect(formatAggregateCountLabel({ status: "DRAFT", suppressed: true, count: 4 } as never, label)).toBe(label);
    expect(formatAggregateCountLabel({ status: "DRAFT", suppressed: true, count: 5 } as never, label)).toBe(label);
    expect(formatAggregateCountLabel({ status: "DRAFT", suppressed: true, count: 6 } as never, label)).toBe(label);
    // PRIV-13..19 malformed / unsafe fail-closed
    expect(formatAggregateCountLabel({ status: "DRAFT", suppressed: false, count: "2" } as never, label)).toBe(label);
    expect(formatAggregateCountLabel({ status: "DRAFT", suppressed: false, count: null } as never, label)).toBe(label);
    expect(formatAggregateCountLabel({ status: "DRAFT", suppressed: false } as never, label)).toBe(label);
    expect(formatAggregateCountLabel({ status: "DRAFT", suppressed: false, count: -1 } as never, label)).toBe(label);
    expect(formatAggregateCountLabel({ status: "DRAFT", suppressed: false, count: 2.5 } as never, label)).toBe(label);
    expect(formatAggregateCountLabel({ status: "DRAFT", suppressed: false, count: Number.NaN } as never, label)).toBe(label);
    expect(
      formatAggregateCountLabel(
        { status: "DRAFT", suppressed: false, count: Number.MAX_SAFE_INTEGER + 1 } as never,
        label,
      ),
    ).toBe(label);
    // PRIV-20 mixed groups + omitted total
    expect(isTotalOmitted({
      groups: [
        { status: "DRAFT", suppressed: false, count: 0 },
        { status: "SUBMITTED", suppressed: false, count: 2 },
        { status: "APPROVED", suppressed: true },
        { status: "REJECTED", suppressed: false, count: 8 },
      ],
    })).toBe(true);
    expect(isTotalOmitted({ groups: [], total: 20 })).toBe(false);
  });

  it("privacy DOM: unsafe false count1..4 never exact; zero preserved; no aria/data-count leak attrs", async () => {
    vi.spyOn(reportsClient, "getCertificationApplicationsByStatus").mockResolvedValue({
      groups: [
        { status: "SUBMITTED", suppressed: false, count: 1 },
        { status: "APPROVED", suppressed: false, count: 2 },
        { status: "REJECTED", suppressed: false, count: 3 },
        { status: "DRAFT", suppressed: false, count: 4 },
        { status: "UNDER_REVIEW", suppressed: false, count: 0 },
        { status: "WITHDRAWN" as never, suppressed: false, count: 5 },
      ],
    });
    renderPage();
    fireEvent.click(screen.getByTestId("admin-reports-run"));
    await waitFor(() => {
      expect(screen.getByTestId("admin-reports-results-table")).toBeTruthy();
    });
    expect(screen.getByTestId("admin-reports-count-status-SUBMITTED").textContent).toBe("Suppressed");
    expect(screen.getByTestId("admin-reports-count-status-APPROVED").textContent).toBe("Suppressed");
    expect(screen.getByTestId("admin-reports-count-status-REJECTED").textContent).toBe("Suppressed");
    expect(screen.getByTestId("admin-reports-count-status-DRAFT").textContent).toBe("Suppressed");
    expect(screen.getByTestId("admin-reports-count-status-UNDER_REVIEW").textContent).toBe("0");
    expect(screen.getByTestId("admin-reports-count-status-WITHDRAWN").textContent).toBe("5");
    expect(screen.getByTestId("admin-reports-total-omitted")).toBeTruthy();
    const countCells = screen.getByTestId("admin-reports-results-table").querySelectorAll("td");
    for (const td of Array.from(countCells)) {
      expect(td.getAttribute("aria-label")).toBeNull();
      expect(td.getAttribute("title")).toBeNull();
      expect(td.getAttribute("data-count")).toBeNull();
      expect(td.getAttribute("data-value")).toBeNull();
    }
  });

  it("privacy helper source enforces Number.isSafeInteger", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const apiSource = readFileSync(resolve(here, "../admin-reports-api.ts"), "utf8");
    expect(apiSource).toMatch(/Number\.isSafeInteger\(count\)/);
    expect(apiSource).toMatch(/count < T026_SMALL_CELL_THRESHOLD/);
  });

  it("source has no active export, polling, cache, or historical report APIs", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const apiSource = readFileSync(resolve(here, "../admin-reports-api.ts"), "utf8");
    const pageSource = readFileSync(resolve(here, "../../pages/admin/AdminReportsPage.tsx"), "utf8");

    // Active product API surface (not compatibility type baggage required by admin-gov-ux-labels).
    const activeApi = apiSource
      .replace(/export type AdminDashboardSummary[\s\S]*?};/m, "")
      .replace(/export type ChartDataRow[\s\S]*?;/m, "");

    for (const source of [activeApi, pageSource]) {
      expect(source).not.toMatch(/exportReport/);
      expect(source).not.toMatch(/downloadAdminReportExport/);
      expect(source).not.toMatch(/ADMIN_REPORT_EXPORT_KEYS/);
      expect(source).not.toMatch(/refetchInterval/);
      expect(source).not.toMatch(/setInterval/);
      expect(source).not.toMatch(/localStorage/);
      expect(source).not.toMatch(/IndexedDB/);
      expect(source).not.toMatch(/tenantId/);
      expect(source).not.toMatch(/organizationId/);
      expect(source).not.toMatch(/getReportsCatalog/);
      expect(source).not.toMatch(/fetchAdminDashboardSummary/);
      expect(source).not.toMatch(/admin-export-/);
      expect(source).not.toMatch(/completionRate/);
      expect(source).not.toMatch(/percentage/i);
    }
  });

  it("page exposes exactly two functional views and runs by-status", async () => {
    vi.spyOn(reportsClient, "getCertificationApplicationsByStatus").mockResolvedValue({
      groups: [
        { status: "SUBMITTED", suppressed: false, count: 0 },
        { status: "APPROVED", suppressed: true },
        { status: "REJECTED", suppressed: false, count: 8 },
      ],
    });

    renderPage();
    expect(screen.getByTestId("admin-reports-view-by-status")).toBeTruthy();
    expect(screen.getByTestId("admin-reports-view-by-scheme-ref")).toBeTruthy();
    expect(screen.queryByTestId("admin-export-dashboard-csv")).toBeNull();
    expect(screen.queryByTestId("admin-reports-dashboard-cards")).toBeNull();
    expect(screen.queryByTestId("admin-education-overview")).toBeNull();

    fireEvent.click(screen.getByTestId("admin-reports-run"));

    await waitFor(() => {
      expect(screen.getByTestId("admin-reports-results-table")).toBeTruthy();
    });
    expect(screen.getByTestId("admin-reports-count-status-SUBMITTED").textContent).toBe("0");
    expect(screen.getByTestId("admin-reports-count-status-APPROVED").textContent).toBe("Suppressed");
    expect(screen.getByTestId("admin-reports-count-status-REJECTED").textContent).toBe("8");
    expect(screen.getByTestId("admin-reports-total-omitted")).toBeTruthy();
    expect(reportsClient.getCertificationApplicationsByStatus).toHaveBeenCalled();
  });

  it("page runs by-scheme-ref view", async () => {
    vi.spyOn(reportsClient, "getCertificationApplicationsBySchemeRef").mockResolvedValue({
      groups: [{ schemeRef: "SCHEME-A", suppressed: false, count: 11 }],
      total: 11,
    });

    renderPage();
    fireEvent.click(screen.getByTestId("admin-reports-view-by-scheme-ref"));
    fireEvent.click(screen.getByTestId("admin-reports-run"));

    await waitFor(() => {
      expect(screen.getByTestId("admin-reports-total")).toBeTruthy();
    });
    expect(reportsClient.getCertificationApplicationsBySchemeRef).toHaveBeenCalled();
    expect(screen.getByTestId("admin-reports-count-scheme-SCHEME-A").textContent).toBe("11");
  });

  it("page handles 429 error state", async () => {
    vi.spyOn(reportsClient, "getCertificationApplicationsByStatus").mockRejectedValue({
      status: 429,
      code: "VALIDATION_ERROR",
      message: "THROTTLED",
    });

    renderPage();
    fireEvent.click(screen.getByTestId("admin-reports-run"));

    await waitFor(() => {
      expect(screen.getByTestId("admin-reports-error")).toBeTruthy();
    });
    expect(screen.getByTestId("admin-reports-error").textContent).toMatch(/Too many/i);
  });

  it("required i18n keys exist across exact5 locales", async () => {
    const locales = ["en", "hr", "bs", "sr", "sl"] as const;
    for (const locale of locales) {
      const mod = await import(`../../../../packages/i18n/locales/${locale}/certificationStaff.json`);
      const reports = (mod as { default?: { reports: Record<string, unknown> } }).default?.reports
        ?? (mod as { reports: Record<string, unknown> }).reports;
      expect(reports.title, locale).toBeTruthy();
      expect((reports.views as { byStatus: string }).byStatus, locale).toBeTruthy();
      expect((reports.views as { bySchemeRef: string }).bySchemeRef, locale).toBeTruthy();
      expect(reports.suppressed, locale).toBeTruthy();
      expect((reports.errors as { throttled: string }).throttled, locale).toBeTruthy();
    }
    expect(CERTIFICATION_STAFF_NS).toBe("certificationStaff");
  });
});
