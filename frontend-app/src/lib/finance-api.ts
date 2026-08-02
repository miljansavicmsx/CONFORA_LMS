/**
 * Learner finance API (`/api/me/finance/*`).
 */

import { api } from "@/lib/api";

export type FinanceLedgerLine = {
  recordId: string;
  type: string;
  status: string | null;
  amountMinor: number | null;
  currency: string | null;
  courseIds: string[];
  createdAt: string | null;
  hasInvoicePdf: boolean;
};

export type FinanceSummary = {
  currency: string;
  totalPaidMinor: number;
  totalRefundedMinor: number;
  pendingMinor: number;
  amfDueDate: string | null;
  amfPaid: boolean | null;
  amfStatusLabel: string;
  membershipStatus: string | null;
  ledgerStorageStatus?: "ok" | "unavailable" | string;
  ledgerStorageDetail?: string | null;
};

export type RevenueByCourse = {
  readonly courseId: string;
  readonly totalMinor: number;
  readonly currency: string;
};

export type RevenueByPeriod = {
  readonly period: string;
  readonly totalMinor: number;
  readonly currency: string;
};

export type InvoiceStatusOverview = {
  readonly paidWithPdf: number;
  readonly paidWithoutPdf: number;
  readonly refunds: number;
};

export type FinanceOverview = {
  readonly ledgerRowsScanned: number;
  readonly totalPaymentsMinor: number;
  readonly totalRefundsMinor: number;
  readonly currency: string;
  readonly outstandingEstimateMinor: number;
};

export async function fetchFinanceSummary(): Promise<FinanceSummary> {
  const { data } = await api.get<FinanceSummary>("/api/me/finance/summary");
  return data;
}

export async function fetchFinanceLedger(): Promise<FinanceLedgerLine[]> {
  const { data } = await api.get<FinanceLedgerLine[]>("/api/me/finance/ledger");
  return data;
}

/** Otvara PDF u novom tabu (JSON URL nakon JWT provjere). */
export async function openInvoicePdfInNewTab(recordId: string): Promise<void> {
  const { data } = await api.get<{ invoicePdfUrl: string }>(
    `/api/me/finance/invoices/${encodeURIComponent(recordId)}/url`,
  );
  const url = String(data.invoicePdfUrl ?? "").trim();
  if (!url) {
    throw new Error("Nedostaje invoicePdfUrl.");
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function fetchAdminFinanceRevenueByCourse(): Promise<RevenueByCourse[]> {
  const { data } = await api.get<RevenueByCourse[]>("/api/admin/finance/revenue/by-course");
  return data;
}

export async function fetchAdminFinanceRevenueByPeriod(): Promise<RevenueByPeriod[]> {
  const { data } = await api.get<RevenueByPeriod[]>("/api/admin/finance/revenue/by-period");
  return data;
}

export async function fetchAdminFinanceInvoiceOverview(): Promise<InvoiceStatusOverview> {
  const { data } = await api.get<InvoiceStatusOverview>("/api/admin/finance/overview/invoices");
  return data;
}

export async function fetchAdminFinanceOutstanding(): Promise<FinanceOverview> {
  const { data } = await api.get<FinanceOverview>("/api/admin/finance/overview/outstanding");
  return data;
}
