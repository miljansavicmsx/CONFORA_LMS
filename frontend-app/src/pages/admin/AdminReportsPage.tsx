import { useQuery } from "@tanstack/react-query";
import { CERTIFICATION_STAFF_NS } from "@confora/i18n";
import { useMemo, useState, type FormEvent, type JSX } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  formatAggregateCountLabel,
  isTotalOmitted,
  loadAdminCertificationApplicationsReport,
  T026_REPORT_CATALOG,
  type T026ReportViewId,
} from "@/lib/admin-reports-api";
import { isNormalizedApiError, type NormalizedApiError } from "@/lib/api/api-error";
import {
  calendarDateToP08DayEndUtc,
  calendarDateToP08DayStartUtc,
  type CertificationApplicationStatus,
  type CertificationApplicationsReportQuery,
  type SchemeGroupCell,
  type StatusGroupCell,
} from "@/lib/api/reports-client";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const STATUS_OPTIONS: readonly CertificationApplicationStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
];

type AppliedQuery = {
  readonly view: T026ReportViewId;
  readonly filters: CertificationApplicationsReportQuery;
};

function defaultCreatedRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 86_400_000);
  const fmt = (d: Date): string => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

function mapErrorKey(err: NormalizedApiError): string {
  if (err.status === 401) return "reports.errors.unauthorized";
  if (err.status === 403) return "reports.errors.forbidden";
  if (err.status === 429) return "reports.errors.throttled";
  if (err.status === 400 || err.code === "VALIDATION_ERROR") return "reports.errors.validation";
  if (err.code === "NETWORK_ERROR" || err.status === 0) return "reports.errors.network";
  return "reports.errors.generic";
}

function AggregateTable({
  groups,
  groupHeader,
  countHeader,
  suppressedLabel,
  emptyLabel,
}: {
  readonly groups: readonly (StatusGroupCell | SchemeGroupCell)[];
  readonly groupHeader: string;
  readonly countHeader: string;
  readonly suppressedLabel: string;
  readonly emptyLabel: string;
}): JSX.Element {
  if (groups.length === 0) {
    return (
      <p className="mt-2 text-sm text-text-muted" data-testid="admin-reports-empty">
        {emptyLabel}
      </p>
    );
  }

  return (
    <table className="mt-3 w-full text-sm" data-testid="admin-reports-results-table">
      <thead>
        <tr className="border-b border-border/40 text-left text-text-muted">
          <th scope="col" className="py-2 pr-3">
            {groupHeader}
          </th>
          <th scope="col" className="py-2">
            {countHeader}
          </th>
        </tr>
      </thead>
      <tbody>
        {groups.map((cell) => {
          const key =
            "status" in cell ? `status-${cell.status}` : `scheme-${cell.schemeRef}`;
          const label = "status" in cell ? cell.status : cell.schemeRef;
          return (
            <tr key={key} className="border-b border-border/20" data-testid={`admin-reports-row-${key}`}>
              <td className="py-2 pr-3">{label}</td>
              <td className="py-2" data-testid={`admin-reports-count-${key}`}>
                {formatAggregateCountLabel(cell, suppressedLabel)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function AdminReportsPage(): JSX.Element {
  const { t } = useTranslation(CERTIFICATION_STAFF_NS);
  const defaults = useMemo(() => defaultCreatedRange(), []);
  const [view, setView] = useState<T026ReportViewId>("by-status");
  const [createdFromDate, setCreatedFromDate] = useState(defaults.from);
  const [createdToDate, setCreatedToDate] = useState(defaults.to);
  const [submittedFromDate, setSubmittedFromDate] = useState("");
  const [submittedToDate, setSubmittedToDate] = useState("");
  const [status, setStatus] = useState<"" | CertificationApplicationStatus>("");
  const [schemeRef, setSchemeRef] = useState("");
  const [filterError, setFilterError] = useState<string | null>(null);
  const [applied, setApplied] = useState<AppliedQuery | null>(null);

  const reportQ = useQuery({
    queryKey: ["admin", "reports", "p08", applied],
    queryFn: () => {
      if (!applied) {
        throw new Error("NO_APPLIED_QUERY");
      }
      return loadAdminCertificationApplicationsReport(applied.view, applied.filters);
    },
    enabled: applied !== null,
    retry: false,
  });

  const onSubmit = (event: FormEvent): void => {
    event.preventDefault();
    setFilterError(null);

    const hasCreated = Boolean(createdFromDate.trim() || createdToDate.trim());
    const hasSubmitted = Boolean(submittedFromDate.trim() || submittedToDate.trim());

    if (!hasCreated && !hasSubmitted) {
      setFilterError(t("reports.errors.dateRangeRequired"));
      return;
    }

    if (hasCreated) {
      if (!DATE_RE.test(createdFromDate.trim()) || !DATE_RE.test(createdToDate.trim())) {
        setFilterError(t("reports.errors.dateFormat"));
        return;
      }
    }
    if (hasSubmitted) {
      if (!DATE_RE.test(submittedFromDate.trim()) || !DATE_RE.test(submittedToDate.trim())) {
        setFilterError(t("reports.errors.dateFormat"));
        return;
      }
    }

    const filters: CertificationApplicationsReportQuery = {
      ...(status ? { status } : {}),
      ...(schemeRef.trim() ? { schemeRef: schemeRef.trim() } : {}),
      ...(hasCreated
        ? {
            createdFrom: calendarDateToP08DayStartUtc(createdFromDate.trim()),
            createdTo: calendarDateToP08DayEndUtc(createdToDate.trim()),
          }
        : {}),
      ...(hasSubmitted
        ? {
            submittedFrom: calendarDateToP08DayStartUtc(submittedFromDate.trim()),
            submittedTo: calendarDateToP08DayEndUtc(submittedToDate.trim()),
          }
        : {}),
    };

    setApplied({ view, filters });
  };

  const errorMessage = useMemo(() => {
    if (!reportQ.isError) return null;
    const err = reportQ.error;
    if (isNormalizedApiError(err)) {
      return t(mapErrorKey(err));
    }
    return t("reports.errors.generic");
  }, [reportQ.error, reportQ.isError, t]);

  const result = reportQ.data;
  const groups = result?.data.groups ?? [];
  const showTotal =
    result &&
    !isTotalOmitted(result.data) &&
    typeof result.data.total === "number";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" data-testid="admin-reports-page">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">{t("reports.title")}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t("reports.subtitle")}</p>
      </header>

      <form
        className="space-y-4 rounded-2xl border border-border/50 bg-surface-secondary/30 p-4"
        onSubmit={onSubmit}
        data-testid="admin-reports-filters"
      >
        <fieldset>
          <legend className="text-sm font-medium text-text-primary">{t("reports.viewLabel")}</legend>
          <div className="mt-2 flex flex-wrap gap-4" role="radiogroup" aria-label={t("reports.viewLabel")}>
            {T026_REPORT_CATALOG.map((entry) => (
              <label key={entry.id} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="admin-report-view"
                  value={entry.id}
                  checked={view === entry.id}
                  onChange={() => setView(entry.id)}
                  data-testid={`admin-reports-view-${entry.id}`}
                />
                {entry.id === "by-status"
                  ? t("reports.views.byStatus")
                  : t("reports.views.bySchemeRef")}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="admin-rep-created-from" className="text-xs text-text-muted">
              {t("reports.filters.createdFrom")}
            </label>
            <input
              id="admin-rep-created-from"
              type="text"
              inputMode="numeric"
              className="mt-1 block h-9 w-full rounded-md border border-border/60 bg-surface-primary px-2 text-sm"
              placeholder="YYYY-MM-DD"
              value={createdFromDate}
              onChange={(e) => setCreatedFromDate(e.target.value)}
              data-testid="admin-reports-created-from"
            />
          </div>
          <div>
            <label htmlFor="admin-rep-created-to" className="text-xs text-text-muted">
              {t("reports.filters.createdTo")}
            </label>
            <input
              id="admin-rep-created-to"
              type="text"
              inputMode="numeric"
              className="mt-1 block h-9 w-full rounded-md border border-border/60 bg-surface-primary px-2 text-sm"
              placeholder="YYYY-MM-DD"
              value={createdToDate}
              onChange={(e) => setCreatedToDate(e.target.value)}
              data-testid="admin-reports-created-to"
            />
          </div>
          <div>
            <label htmlFor="admin-rep-submitted-from" className="text-xs text-text-muted">
              {t("reports.filters.submittedFrom")}
            </label>
            <input
              id="admin-rep-submitted-from"
              type="text"
              inputMode="numeric"
              className="mt-1 block h-9 w-full rounded-md border border-border/60 bg-surface-primary px-2 text-sm"
              placeholder="YYYY-MM-DD"
              value={submittedFromDate}
              onChange={(e) => setSubmittedFromDate(e.target.value)}
              data-testid="admin-reports-submitted-from"
            />
          </div>
          <div>
            <label htmlFor="admin-rep-submitted-to" className="text-xs text-text-muted">
              {t("reports.filters.submittedTo")}
            </label>
            <input
              id="admin-rep-submitted-to"
              type="text"
              inputMode="numeric"
              className="mt-1 block h-9 w-full rounded-md border border-border/60 bg-surface-primary px-2 text-sm"
              placeholder="YYYY-MM-DD"
              value={submittedToDate}
              onChange={(e) => setSubmittedToDate(e.target.value)}
              data-testid="admin-reports-submitted-to"
            />
          </div>
          <div>
            <label htmlFor="admin-rep-status" className="text-xs text-text-muted">
              {t("reports.filters.status")}
            </label>
            <select
              id="admin-rep-status"
              className="mt-1 block h-9 w-full rounded-md border border-border/60 bg-surface-primary px-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as "" | CertificationApplicationStatus)}
              data-testid="admin-reports-status"
            >
              <option value="">{t("reports.filters.anyStatus")}</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="admin-rep-scheme" className="text-xs text-text-muted">
              {t("reports.filters.schemeRef")}
            </label>
            <input
              id="admin-rep-scheme"
              type="text"
              className="mt-1 block h-9 w-full rounded-md border border-border/60 bg-surface-primary px-2 text-sm"
              value={schemeRef}
              onChange={(e) => setSchemeRef(e.target.value)}
              data-testid="admin-reports-scheme-ref"
            />
          </div>
        </div>

        {filterError ? (
          <p className="text-sm text-red-600" role="alert" data-testid="admin-reports-filter-error">
            {filterError}
          </p>
        ) : null}

        <Button type="submit" data-testid="admin-reports-run">
          {t("reports.actions.run")}
        </Button>
      </form>

      <section className="mt-6 rounded-2xl border border-border/50 p-4" aria-live="polite">
        <h2 className="text-sm font-semibold text-text-primary">{t("reports.resultsHeading")}</h2>

        {reportQ.isFetching ? (
          <p className="mt-2 text-sm text-text-muted" data-testid="admin-reports-loading">
            {t("reports.loading")}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="mt-2 text-sm text-red-600" role="alert" data-testid="admin-reports-error">
            {errorMessage}
          </p>
        ) : null}

        {!reportQ.isFetching && !reportQ.isError && result ? (
          <>
            <AggregateTable
              groups={groups}
              groupHeader={
                result.view === "by-status"
                  ? t("reports.columns.status")
                  : t("reports.columns.schemeRef")
              }
              countHeader={t("reports.columns.count")}
              suppressedLabel={t("reports.suppressed")}
              emptyLabel={t("reports.empty")}
            />
            {showTotal ? (
              <p className="mt-3 text-sm text-text-secondary" data-testid="admin-reports-total">
                {t("reports.total", { count: result.data.total })}
              </p>
            ) : (
              <p className="sr-only" data-testid="admin-reports-total-omitted">
                {t("reports.totalOmitted")}
              </p>
            )}
          </>
        ) : null}

        {!applied && !reportQ.isFetching ? (
          <p className="mt-2 text-sm text-text-muted" data-testid="admin-reports-idle">
            {t("reports.idle")}
          </p>
        ) : null}
      </section>
    </div>
  );
}
