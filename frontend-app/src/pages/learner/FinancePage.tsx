/**
 * Financije — pregled stanja, ledger, AMF / članarina, preuzimanje računa (PDF URL).
 */

import { useQuery } from "@tanstack/react-query";
import { CreditCard, Download, Loader2, Receipt, ShieldAlert, TrendingUp } from "lucide-react";
import { useCallback, useMemo, useState, type JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  fetchFinanceLedger,
  fetchFinanceSummary,
  fetchAdminFinanceInvoiceOverview,
  fetchAdminFinanceOutstanding,
  fetchAdminFinanceRevenueByCourse,
  fetchAdminFinanceRevenueByPeriod,
  openInvoicePdfInNewTab,
  type FinanceLedgerLine,
} from "@/lib/finance-api";
import { fetchMySubscription } from "@/lib/api-billing";
import { formatApiErrorMessage } from "@/lib/format-api-error";
import { FINANCE_INTERNAL_ROLES, normalizePrimaryRoleForRbac } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

const Q_SUMMARY = ["financeSummary"] as const;
const Q_LEDGER = ["financeLedger"] as const;
const Q_SUBSCRIPTION = ["billing", "subscription"] as const;

function formatMoney(minor: number, currency: string): string {
  const cur = (currency || "EUR").toUpperCase();
  const amount = minor / 100;
  try {
    return new Intl.NumberFormat("bs-BA", { style: "currency", currency: cur }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${cur}`;
  }
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  try {
    return new Date(iso).toLocaleString("bs-BA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function ledgerTypeLabel(t: string): string {
  switch (t) {
    case "payment":
      return "Uplata";
    case "refund":
      return "Povrat";
    default:
      return t || "—";
  }
}

function membershipBadgeClass(status: string | null | undefined): string {
  const s = (status ?? "").trim().toUpperCase();
  if (s === "VALID" || s === "ACTIVE") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-100";
  }
  if (s === "SUSPENDED" || s === "SUSPENDED_AMF") {
    return "border-amber-500/40 bg-amber-500/12 text-amber-100";
  }
  if (!s) {
    return "border-border/50 bg-surface-secondary text-text-muted";
  }
  return "border-border/50 bg-surface-secondary text-text-secondary";
}

function amfBadgeClass(summary: { amfPaid: boolean | null; amfDueDate: string | null }): string {
  if (summary.amfPaid === true) {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-100";
  }
  if (!summary.amfDueDate) {
    return "border-border/50 bg-surface-secondary text-text-muted";
  }
  try {
    const due = new Date(summary.amfDueDate);
    if (Number.isNaN(due.getTime())) {
      return "border-border/50 bg-surface-secondary text-text-secondary";
    }
    if (Date.now() > due.getTime()) {
      return "border-rose-500/35 bg-rose-500/10 text-rose-100";
    }
    return "border-sky-500/35 bg-sky-500/10 text-sky-100";
  } catch {
    return "border-border/50 bg-surface-secondary text-text-secondary";
  }
}

function statusBadgeClass(status: string | null | undefined): string {
  const s = String(status ?? "").toUpperCase();
  if (s === "ACTIVE" || s === "VALID" || s === "PAID") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-100";
  }
  if (s === "SUSPENDED" || s === "PAST_DUE" || s === "PENDING") {
    return "border-amber-500/40 bg-amber-500/12 text-amber-100";
  }
  if (s === "CANCELED" || s === "REVOKED") {
    return "border-rose-500/40 bg-rose-500/10 text-rose-100";
  }
  return "border-border/50 bg-surface-secondary text-text-secondary";
}

export default function FinancePage(): JSX.Element {
  const [invoiceBusyId, setInvoiceBusyId] = useState<string | null>(null);
  const role = useAuthStore((s) => s.user?.role ?? "learner");
  const isFinanceOperator = FINANCE_INTERNAL_ROLES.has(normalizePrimaryRoleForRbac(role));

  const summaryQ = useQuery({ queryKey: Q_SUMMARY, queryFn: fetchFinanceSummary, retry: false });
  const ledgerQ = useQuery({ queryKey: Q_LEDGER, queryFn: fetchFinanceLedger, retry: false });
  const subscriptionQ = useQuery({ queryKey: Q_SUBSCRIPTION, queryFn: fetchMySubscription, retry: false });
  const adminRevenueQ = useQuery({
    queryKey: ["admin", "finance", "revenue-by-course"] as const,
    queryFn: fetchAdminFinanceRevenueByCourse,
    enabled: isFinanceOperator,
  });
  const adminPeriodQ = useQuery({
    queryKey: ["admin", "finance", "revenue-by-period"] as const,
    queryFn: fetchAdminFinanceRevenueByPeriod,
    enabled: isFinanceOperator,
  });
  const adminInvoiceQ = useQuery({
    queryKey: ["admin", "finance", "invoice-overview"] as const,
    queryFn: fetchAdminFinanceInvoiceOverview,
    enabled: isFinanceOperator,
  });
  const adminOutstandingQ = useQuery({
    queryKey: ["admin", "finance", "outstanding"] as const,
    queryFn: fetchAdminFinanceOutstanding,
    enabled: isFinanceOperator,
  });

  const onDownload = useCallback(async (line: FinanceLedgerLine) => {
    setInvoiceBusyId(line.recordId);
    try {
      await openInvoicePdfInNewTab(line.recordId);
    } finally {
      setInvoiceBusyId(null);
    }
  }, []);

  const summary = summaryQ.data;
  const subscription = subscriptionQ.data;
  const financeErr = summaryQ.error ?? ledgerQ.error;
  const subscriptionErr = subscriptionQ.error;
  const outstanding = adminOutstandingQ.data;
  const invoiceOverview = adminInvoiceQ.data;
  const topCourseRevenue = useMemo(() => (adminRevenueQ.data ?? []).slice(0, 5), [adminRevenueQ.data]);
  const monthlyTrend = useMemo(() => (adminPeriodQ.data ?? []).slice(0, 6), [adminPeriodQ.data]);

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
              <CreditCard className="h-6 w-6 text-brand" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Finance workspace</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">Finansije</h1>
              <p className="mt-1 max-w-3xl text-sm text-text-secondary">
                Pregled uplata, povrata, dugovanja, računa i AMF/godišnje naknade. Neplaćeni AMF može suspendovati
                članstvo, certifikat ili javni registar prema definisanoj politici.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {subscriptionQ.isPending ? (
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Pretplata…
              </div>
            ) : null}
            {subscriptionQ.isError ? (
              <p className="max-w-xs text-right text-xs text-rose-200">{formatApiErrorMessage(subscriptionErr)}</p>
            ) : null}
            {subscription && !subscriptionQ.isError ? (
              <Badge variant="outline" className={cn("w-fit font-medium", statusBadgeClass(subscription.status))}>
                Plan: {subscription.planId} · {subscription.status}
              </Badge>
            ) : null}
          </div>
        </header>

        {subscription?.providerStatus === "config_blocker" ? (
          <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            <p className="font-medium text-text-primary">Stripe nije konfigurisan u ovom okruženju.</p>
            {subscription.providerReason ? (
              <p className="mt-1 text-text-secondary">{subscription.providerReason}</p>
            ) : null}
          </div>
        ) : null}

        {subscription?.storageStatus === "unavailable" && subscription.storageMessage ? (
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
            <p className="font-medium text-text-primary">Pohrana pretplate</p>
            <p className="mt-1 text-text-secondary">{subscription.storageMessage}</p>
          </div>
        ) : null}

        {summary?.ledgerStorageStatus === "unavailable" && summary.ledgerStorageDetail ? (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-amber-50">
            <p className="font-medium text-text-primary">Knjiga transakcija</p>
            <p className="mt-1 text-text-secondary">{summary.ledgerStorageDetail}</p>
          </div>
        ) : null}

        {(summaryQ.isLoading || ledgerQ.isLoading) && (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Učitavanje…
          </div>
        )}

        {financeErr != null && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            <p>{formatApiErrorMessage(financeErr)}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-3 border-border/60"
              onClick={() => {
                void summaryQ.refetch();
                void ledgerQ.refetch();
              }}
            >
              Pokušaj ponovo
            </Button>
          </div>
        )}

        {summary && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Sažetak financija">
            <div className="rounded-2xl border border-border/50 bg-surface-secondary/35 p-4 ring-1 ring-white/[0.04]">
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Ukupno uplaćeno</p>
              <p className="mt-2 text-lg font-semibold tabular-nums text-text-primary">
                {formatMoney(summary.totalPaidMinor, summary.currency)}
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-surface-secondary/35 p-4 ring-1 ring-white/[0.04]">
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Povrati</p>
              <p className="mt-2 text-lg font-semibold tabular-nums text-text-primary">
                {formatMoney(summary.totalRefundedMinor, summary.currency)}
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-surface-secondary/35 p-4 ring-1 ring-white/[0.04]">
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Na čekanju (AMF)</p>
              <p className="mt-2 text-lg font-semibold tabular-nums text-text-primary">
                {formatMoney(summary.pendingMinor, summary.currency)}
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-surface-secondary/35 p-4 ring-1 ring-white/[0.04]">
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Članstvo</p>
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className={cn("font-medium", membershipBadgeClass(summary.membershipStatus))}
                >
                  {summary.membershipStatus?.trim() || "Nije postavljeno"}
                </Badge>
              </div>
            </div>
            <div className="rounded-2xl border border-border/50 bg-surface-secondary/35 p-4 ring-1 ring-white/[0.04]">
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Aktivni plan</p>
              <p className="mt-2 text-lg font-semibold text-text-primary">{subscription?.planId ?? "—"}</p>
              <p className="mt-1 text-xs text-text-secondary">{subscription?.billingCycle ?? "billing nije učitan"}</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-surface-secondary/35 p-4 ring-1 ring-white/[0.04]">
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Dugovanja</p>
              <p className="mt-2 text-lg font-semibold tabular-nums text-text-primary">
                {formatMoney(summary.pendingMinor, summary.currency)}
              </p>
              <p className="mt-1 text-xs text-text-secondary">Procjena na osnovu AMF/otvorenih stavki.</p>
            </div>
          </section>
        )}

        {summary && (
          <section
            className="rounded-2xl border border-border/50 bg-surface-secondary/25 p-5 ring-1 ring-white/[0.04]"
            aria-label="AMF / godišnja naknada"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-text-primary">AMF / godišnja naknada</h2>
                <p className="mt-1 text-sm text-text-secondary">{summary.amfStatusLabel}</p>
                {summary.amfDueDate ? (
                  <p className="mt-1 text-xs text-text-muted">Dospijeće: {formatDate(summary.amfDueDate)}</p>
                ) : null}
              </div>
              <Badge variant="outline" className={cn("shrink-0 font-medium", amfBadgeClass(summary))}>
                {summary.amfPaid === true
                  ? "Plaćeno"
                  : summary.amfPaid === false
                    ? "Neplaćeno"
                    : summary.amfDueDate
                      ? "Status nepoznat"
                      : "Nije konfigurirano"}
              </Badge>
            </div>
          </section>
        )}

        {isFinanceOperator ? (
          <section className="space-y-4 rounded-2xl border border-border/50 bg-surface-secondary/25 p-5 ring-1 ring-white/[0.04]">
            <div className="flex items-start gap-3">
              <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
              <div>
                <h2 className="text-sm font-semibold text-text-primary">Admin / training finance overview</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Backend endpointi su zaštićeni `require_finance_internal`; non-sys uloge dobijaju tenant-scope ledger redove
                  kada ledger nosi `tenantId`.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border/50 bg-surface-primary/35 p-4">
                <p className="text-xs uppercase tracking-wide text-text-muted">Prihodi</p>
                <p className="mt-2 text-lg font-semibold text-text-primary">
                  {outstanding ? formatMoney(outstanding.totalPaymentsMinor, outstanding.currency) : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-surface-primary/35 p-4">
                <p className="text-xs uppercase tracking-wide text-text-muted">Refundovi</p>
                <p className="mt-2 text-lg font-semibold text-text-primary">
                  {outstanding ? formatMoney(outstanding.totalRefundsMinor, outstanding.currency) : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-surface-primary/35 p-4">
                <p className="text-xs uppercase tracking-wide text-text-muted">Računi</p>
                <p className="mt-2 text-lg font-semibold text-text-primary">
                  {invoiceOverview ? invoiceOverview.paidWithPdf + invoiceOverview.paidWithoutPdf : "—"}
                </p>
                <p className="mt-1 text-xs text-text-secondary">PDF: {invoiceOverview?.paidWithPdf ?? "—"}</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-surface-primary/35 p-4">
                <p className="text-xs uppercase tracking-wide text-text-muted">Ledger rows</p>
                <p className="mt-2 text-lg font-semibold text-text-primary">{outstanding?.ledgerRowsScanned ?? "—"}</p>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Prihodi po kursevima</h3>
                {topCourseRevenue.length ? (
                  <ul className="mt-2 divide-y divide-border/30 rounded-xl border border-border/50">
                    {topCourseRevenue.map((row) => (
                      <li key={row.courseId} className="flex justify-between gap-3 px-3 py-2 text-sm">
                        <span className="truncate text-text-secondary">{row.courseId}</span>
                        <span className="shrink-0 font-medium text-text-primary">{formatMoney(row.totalMinor, row.currency)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 rounded-xl border border-dashed border-border/50 px-3 py-4 text-sm text-text-muted">
                    Nema prihoda po kursevima za prikaz.
                  </p>
                )}
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Mjesečni trend</h3>
                {monthlyTrend.length ? (
                  <ul className="mt-2 divide-y divide-border/30 rounded-xl border border-border/50">
                    {monthlyTrend.map((row) => (
                      <li key={row.period} className="flex justify-between gap-3 px-3 py-2 text-sm">
                        <span className="text-text-secondary">{row.period}</span>
                        <span className="font-medium text-text-primary">{formatMoney(row.totalMinor, row.currency)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 rounded-xl border border-dashed border-border/50 px-3 py-4 text-sm text-text-muted">
                    Još nema mjesečnih prihoda.
                  </p>
                )}
              </div>
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5">
          <div className="flex gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden />
            <div>
              <h2 className="text-sm font-semibold text-text-primary">AMF sync status</h2>
              <p className="mt-1 text-sm text-text-secondary">
                AMF politika se primjenjuje backend sinkronizacijom. Ako je godišnja naknada neplaćena nakon grace perioda,
                status može preći u <span className="font-medium text-amber-100">SUSPENDED</span> za članstvo, certifikat
                ili javni registar prema konfiguraciji.
              </p>
            </div>
          </div>
        </section>

        <section aria-label="Knjiga transakcija">
          <div className="mb-3 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-text-muted" aria-hidden />
            <h2 className="text-sm font-semibold text-text-primary">Uplate i stavke</h2>
          </div>

          {!ledgerQ.data?.length && !ledgerQ.isLoading ? (
            <div className="rounded-2xl border border-border/50 bg-surface-secondary/30 p-8 text-center text-sm text-text-secondary ring-1 ring-white/[0.04]">
              <p className="font-medium text-text-primary">Još nema finansijskih zapisa.</p>
              <p className="mt-2">
                Nakon prve uplate, povrata ili AMF stavke, ovdje će se prikazati ledger.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border/50 ring-1 ring-white/[0.04]">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-surface-secondary/40 text-xs uppercase tracking-wide text-text-muted">
                    <th className="px-4 py-3 font-medium">Datum</th>
                    <th className="px-4 py-3 font-medium">Tip</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Iznos</th>
                    <th className="px-4 py-3 font-medium">Kursevi</th>
                    <th className="px-4 py-3 font-medium text-right">Račun</th>
                  </tr>
                </thead>
                <tbody>
                  {(ledgerQ.data ?? []).map((row) => (
                    <tr
                      key={row.recordId}
                      className="border-b border-border/30 last:border-0 hover:bg-surface-secondary/25"
                    >
                      <td className="px-4 py-3 text-text-secondary">{formatDate(row.createdAt)}</td>
                      <td className="px-4 py-3 text-text-primary">{ledgerTypeLabel(row.type)}</td>
                      <td className="px-4 py-3 text-text-secondary">{row.status?.trim() || "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-text-primary">
                        {row.amountMinor != null
                          ? formatMoney(row.amountMinor, row.currency ?? summary?.currency ?? "EUR")
                          : "—"}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-text-muted" title={row.courseIds.join(", ")}>
                        {row.courseIds.length ? row.courseIds.join(", ") : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.type === "payment" && row.hasInvoicePdf ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1 border-border/60"
                            disabled={invoiceBusyId === row.recordId}
                            onClick={() => void onDownload(row)}
                          >
                            {invoiceBusyId === row.recordId ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                            ) : (
                              <Download className="h-3.5 w-3.5" aria-hidden />
                            )}
                            PDF
                          </Button>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
