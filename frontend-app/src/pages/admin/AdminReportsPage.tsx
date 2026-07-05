import { useQuery } from "@tanstack/react-query";
import { useState, type JSX } from "react";
import { Link } from "react-router";

import { AdminReportCharts } from "@/components/admin/AdminReportCharts";
import { Button } from "@/components/ui/button";
import {
  ADMIN_REPORT_EXPORT_KEYS,
  downloadAdminAuditEventsCsv,
  downloadAdminReportExport,
  fetchAdminAuditEvents,
  fetchAdminCertificationApplicationsReport,
  fetchAdminCertificationCertificatesReport,
  fetchAdminCertificationDecisionsReport,
  fetchAdminCertificationLifecycleReport,
  fetchAdminDashboardSummary,
  fetchAdminEvidenceOverview,
  fetchAdminExportCatalog,
  type AdminCertificationDecisionsReport,
  type AdminDashboardSummary,
} from "@/lib/admin-reports-api";
import { downloadAdminEducationCsv } from "@/lib/admin-education-api";
import type { ReportKey } from "@/lib/api/reports-types";

function StatusChip({ label, count }: { readonly label: string; readonly count: number }): JSX.Element {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/50 px-2 py-0.5 text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="font-semibold text-text-primary">{count}</span>
    </span>
  );
}

function MetricCard({
  label,
  value,
  testId,
}: {
  readonly label: string;
  readonly value: number | string;
  readonly testId?: string;
}): JSX.Element {
  return (
    <div className="rounded-lg border border-border/40 px-3 py-2" data-testid={testId}>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function StatusTable({
  title,
  rows,
  testId,
}: {
  readonly title: string;
  readonly rows: Readonly<Record<string, number>>;
  readonly testId: string;
}): JSX.Element {
  const entries = Object.entries(rows);
  return (
    <div data-testid={testId}>
      <h3 className="text-xs font-medium text-text-secondary">{title}</h3>
      {entries.length === 0 ? (
        <p className="mt-2 text-xs text-text-muted">No records in this category yet.</p>
      ) : (
        <table className="mt-2 w-full text-xs">
          <thead>
            <tr className="border-b border-border/40 text-left text-text-muted">
              <th className="py-1 pr-2">Status</th>
              <th className="py-1">Count</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([status, count]) => (
              <tr key={status} className="border-b border-border/20">
                <td className="py-1 pr-2 font-mono text-[11px]">{status}</td>
                <td className="py-1">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function AdminReportsPage(): JSX.Element {
  const [auditDomain, setAuditDomain] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);

  const summaryQ = useQuery({ queryKey: ["admin", "reports", "summary"], queryFn: fetchAdminDashboardSummary });
  const auditQ = useQuery({
    queryKey: ["admin", "reports", "audit", auditDomain],
    queryFn: () => fetchAdminAuditEvents({ domain: auditDomain || undefined, take: 40 }),
  });
  const certAppsQ = useQuery({
    queryKey: ["admin", "reports", "cert-applications"],
    queryFn: fetchAdminCertificationApplicationsReport,
  });
  const certDecisionsQ = useQuery({
    queryKey: ["admin", "reports", "cert-decisions"],
    queryFn: fetchAdminCertificationDecisionsReport,
  });
  const certCertsQ = useQuery({
    queryKey: ["admin", "reports", "cert-certificates"],
    queryFn: fetchAdminCertificationCertificatesReport,
  });
  const lifecycleQ = useQuery({
    queryKey: ["admin", "reports", "cert-lifecycle"],
    queryFn: fetchAdminCertificationLifecycleReport,
  });
  const evidenceQ = useQuery({ queryKey: ["admin", "reports", "evidence"], queryFn: fetchAdminEvidenceOverview });
  const exportCatalogQ = useQuery({ queryKey: ["admin", "reports", "export-catalog"], queryFn: fetchAdminExportCatalog });

  const s: AdminDashboardSummary | undefined = summaryQ.data;
  const decisions: AdminCertificationDecisionsReport | undefined = certDecisionsQ.data;

  const handleExport = (reportKey: ReportKey, filename: string) => {
    downloadAdminReportExport(reportKey, filename).catch((e: Error) => setMessage(e.message));
  };

  const handleEducationExport = (kind: "enrolments" | "completions") => {
    downloadAdminEducationCsv(kind).catch((e: Error) => setMessage(e.message));
  };

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8" data-testid="admin-reports-page">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-text-primary" data-testid="admin-reports-heading">
            Business reports dashboard
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Cross-domain read-only reporting — certification, education, identity review and audit evidence.
          </p>
        </header>

        <p
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-text-secondary"
          data-testid="admin-reports-readonly-badge"
        >
          Read-only report · synthetic local data · manual ID review (non-biometric) · education completion ≠
          ISO/IEC 17024 certification
        </p>

        {message ? <p className="text-sm text-destructive">{message}</p> : null}

        {summaryQ.isError ? (
          <p className="text-sm text-destructive" data-testid="admin-summary-error">
            Unable to load dashboard summary. Certification and export sections remain available read-only.
          </p>
        ) : null}

        {summaryQ.isPending ? <p className="text-xs text-text-muted" data-testid="admin-summary-loading">Loading dashboard summary…</p> : null}

        {s ? (
          <>
            <section className="rounded-xl border border-border/50 p-4" data-testid="admin-reports-dashboard-cards">
              <h2 className="text-sm font-semibold">Certification overview</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Decisions recorded" value={s.certification.decisionsRecorded} testId="admin-summary-decisions-recorded" />
                <MetricCard label="Decisions pending" value={s.certification.decisionsPending} testId="admin-summary-decisions-pending" />
                <MetricCard label="Certificates issued/active" value={s.certification.issuedCount} testId="admin-summary-cert-issued" />
                <MetricCard label="Public verifications" value={s.certification.publicVerificationCount} testId="admin-summary-public-verify" />
                <MetricCard
                  label="Quorum confirmed"
                  value={s.certification.quorumEvidence.decisionsWithQuorumConfirmed}
                  testId="admin-summary-quorum-confirmed"
                />
                <MetricCard
                  label="Reviews in progress"
                  value={s.certification.quorumEvidence.reviewsInProgress}
                  testId="admin-summary-reviews-in-progress"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(s.certification.applicationsByStatus).map(([status, count]) => (
                  <StatusChip key={status} label={status} count={count} />
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-border/50 p-4" data-testid="admin-education-overview">
              <h2 className="text-sm font-semibold">Education overview</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Courses" value={s.education.courseCount} testId="admin-summary-education-courses" />
                <MetricCard label="Enrolments" value={s.education.enrolmentCount} testId="admin-summary-education-enrolments" />
                <MetricCard label="Completions" value={s.education.completionCount} testId="admin-summary-education-completions" />
                <MetricCard label="Completion rate" value={`${s.education.completionRate}%`} testId="admin-summary-education-rate" />
                <MetricCard
                  label="Education completion certs"
                  value={s.evidence.educationCompletionCertificateCount}
                  testId="admin-summary-edu-completion-certs"
                />
              </div>
            </section>

            <section className="rounded-xl border border-border/50 p-4" data-testid="admin-identity-overview">
              <h2 className="text-sm font-semibold">Identity review overview</h2>
              <p className="mt-1 text-xs text-text-muted">Manual non-biometric document review — staff queue only.</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <MetricCard label="Pending" value={s.identity.reviewQueueCount} testId="admin-summary-identity-queue" />
                <MetricCard label="Verified" value={s.identity.verifiedCount} testId="admin-summary-identity-verified" />
                <MetricCard label="Rejected" value={s.identity.rejectedCount} testId="admin-summary-identity-rejected" />
              </div>
            </section>

            <section className="rounded-xl border border-border/50 p-4" data-testid="admin-audit-evidence-overview">
              <h2 className="text-sm font-semibold">Audit & evidence overview</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Audit events" value={s.audit.totalEventCount} testId="admin-summary-audit-total" />
                <MetricCard label="Report exports" value={s.audit.reportExportCount} testId="admin-summary-export-count" />
                <MetricCard label="Document previews" value={s.evidence.documentPreviewCount} testId="admin-summary-doc-previews" />
                <MetricCard label="Quorum evidence (confirmed)" value={s.certification.quorumEvidence.decisionsWithQuorumConfirmed} testId="admin-summary-quorum-evidence" />
              </div>
            </section>

            <section className="rounded-xl border border-border/50 p-4" data-testid="admin-system-readiness">
              <h2 className="text-sm font-semibold">System / readiness</h2>
              <p className="mt-1 text-xs text-text-muted">Active local demo surface — known non-blocking gaps:</p>
              <ul className="mt-2 list-inside list-disc text-xs text-text-secondary">
                {s.system.knownNonBlockingGaps.map((gap) => (
                  <li key={gap}>{gap}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-border/50 p-4">
              <h2 className="text-sm font-semibold">Charts</h2>
              <AdminReportCharts {...s.chartData} />
            </section>
          </>
        ) : null}

        <section className="rounded-xl border border-border/50 p-4" data-testid="admin-certification-reports">
          <h2 className="text-sm font-semibold">Certification reports</h2>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <StatusTable
              title="Applications by status"
              rows={
                certAppsQ.data?.applicationsByStatus ??
                s?.certification.applicationsByStatus ??
                {}
              }
              testId="admin-cert-applications-table"
            />
            <StatusTable
              title="Certificates by status"
              rows={
                (certCertsQ.data?.statusDistribution as Record<string, number> | undefined) ??
                s?.certification.certificatesByStatus ??
                {}
              }
              testId="admin-cert-certificates-table"
            />
          </div>
          {decisions?.items?.length ? (
            <div className="mt-4 overflow-x-auto" data-testid="admin-cert-decisions-table">
              <h3 className="text-xs font-medium text-text-secondary">Recent certification decisions (quorum metadata)</h3>
              <table className="mt-2 w-full text-xs">
                <thead>
                  <tr className="border-b border-border/40 text-left text-text-muted">
                    <th className="py-1 pr-2">Application</th>
                    <th className="py-1 pr-2">Status</th>
                    <th className="py-1 pr-2">Outcome</th>
                    <th className="py-1 pr-2">Quorum</th>
                  </tr>
                </thead>
                <tbody>
                  {decisions.items.slice(0, 10).map((row) => (
                    <tr key={row.reviewId} className="border-b border-border/20">
                      <td className="py-1 pr-2 font-mono text-[10px]">{row.applicationId.slice(0, 8)}…</td>
                      <td className="py-1 pr-2">{row.status}</td>
                      <td className="py-1 pr-2">{row.outcome ?? "—"}</td>
                      <td className="py-1 pr-2">
                        {row.quorumConfirmed ? `✓ ${row.quorumCount}/${row.requiredQuorum}` : `${row.quorumCount}/${row.requiredQuorum}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-3 text-xs text-text-muted" data-testid="admin-cert-decisions-empty">
              No certification decision reviews recorded yet.
            </p>
          )}
          {lifecycleQ.data ? (
            <p className="mt-2 text-xs text-text-secondary" data-testid="admin-cert-lifecycle-summary">
              Lifecycle events tracked · public verification activity:{" "}
              {lifecycleQ.data.publicVerificationActivityCount || s?.certification.publicVerificationCount || 0}
            </p>
          ) : null}
        </section>

        <section className="rounded-xl border border-border/50 p-4" data-testid="admin-evidence-overview">
          <h2 className="text-sm font-semibold">Evidence / document overview</h2>
          {evidenceQ.data ? (
            <dl className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-text-muted">Document previews</dt>
                <dd className="font-semibold">{evidenceQ.data.documentPreviewCount}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Certificate PDFs stored</dt>
                <dd className="font-semibold">{evidenceQ.data.certificatePdfCount}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Education completion certificates</dt>
                <dd className="font-semibold">{evidenceQ.data.educationCompletionCertificateCount}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Identity document access</dt>
                <dd>{evidenceQ.data.identityDocumentAccess}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-2 text-xs text-text-muted">Loading evidence overview…</p>
          )}
          <button
            type="button"
            className="mt-2 text-xs text-brand underline"
            onClick={() => setShowTechnical((v) => !v)}
          >
            {showTechnical ? "Hide" : "Show"} technical detail
          </button>
          {showTechnical && evidenceQ.data ? (
            <pre className="mt-2 max-h-32 overflow-auto rounded bg-surface-secondary p-2 text-[10px]">
              {JSON.stringify(evidenceQ.data, null, 2)}
            </pre>
          ) : null}
        </section>

        <section className="rounded-xl border border-border/50 p-4" data-testid="admin-export-governance">
          <h2 className="text-sm font-semibold">Read-only exports</h2>
          <p className="mt-1 text-xs text-text-muted">All exports are tenant-scoped, audited and redacted — no private identity documents.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" data-testid="admin-export-dashboard-csv" onClick={() => handleExport(ADMIN_REPORT_EXPORT_KEYS.dashboard, "admin-dashboard-summary.csv")}>
              Dashboard CSV
            </Button>
            <Button type="button" size="sm" variant="secondary" data-testid="admin-export-cert-apps-csv" onClick={() => handleExport(ADMIN_REPORT_EXPORT_KEYS.certificationApplications, "certification-applications.csv")}>
              Applications CSV
            </Button>
            <Button type="button" size="sm" variant="secondary" data-testid="admin-export-cert-decisions-csv" onClick={() => handleExport(ADMIN_REPORT_EXPORT_KEYS.certificationDecisions, "certification-decisions.csv")}>
              Decisions CSV
            </Button>
            <Button type="button" size="sm" variant="secondary" data-testid="admin-export-lifecycle-csv" onClick={() => handleExport(ADMIN_REPORT_EXPORT_KEYS.certificateLifecycle, "certificate-lifecycle.csv")}>
              Lifecycle CSV
            </Button>
            <Button type="button" size="sm" variant="secondary" data-testid="admin-export-evidence-csv" onClick={() => handleExport(ADMIN_REPORT_EXPORT_KEYS.evidenceOverview, "evidence-overview.csv")}>
              Evidence CSV
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              data-testid="admin-export-audit-csv"
              onClick={() => downloadAdminAuditEventsCsv(auditDomain || undefined).catch((e: Error) => setMessage(e.message))}
            >
              Audit events CSV
            </Button>
            <Button type="button" size="sm" variant="outline" data-testid="admin-export-edu-enrolments-csv" onClick={() => handleEducationExport("enrolments")}>
              Education enrolments CSV
            </Button>
            <Button type="button" size="sm" variant="outline" data-testid="admin-export-edu-completions-csv" onClick={() => handleEducationExport("completions")}>
              Education completions CSV
            </Button>
          </div>
          <ul className="mt-3 max-h-32 overflow-auto text-xs text-text-muted">
            {(exportCatalogQ.data?.exports ?? []).map((e) => (
              <li key={e.id} data-testid={`admin-export-catalog-${e.id}`}>
                {e.id} · {e.domain} · {e.format}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border/50 p-4" data-testid="admin-unified-audit-viewer">
          <h2 className="text-sm font-semibold">Unified audit viewer</h2>
          <label className="mt-2 block text-xs text-text-muted">
            Domain filter
            <select
              className="mt-1 rounded border border-border/60 bg-surface-primary px-2 py-1 text-sm"
              value={auditDomain}
              onChange={(e) => setAuditDomain(e.target.value)}
              data-testid="admin-audit-domain-filter"
            >
              <option value="">All</option>
              <option value="education">Education</option>
              <option value="certification">Certification</option>
              <option value="identity">Identity</option>
              <option value="governance">Governance</option>
            </select>
          </label>
          {auditQ.isPending ? <p className="mt-2 text-xs text-text-muted">Loading audit events…</p> : null}
          <ul className="mt-3 max-h-64 space-y-1 overflow-auto text-xs text-text-secondary">
            {(auditQ.data?.items ?? []).map((ev) => (
              <li key={ev.id} data-testid={`admin-audit-row-${ev.id}`}>
                {ev.occurredAt.slice(0, 19)} · [{ev.domain}] {ev.action} — {ev.summary}
              </li>
            ))}
            {!auditQ.isPending && !auditQ.data?.items?.length ? (
              <li data-testid="admin-audit-empty">No audit events match this filter.</li>
            ) : null}
          </ul>
          <p className="mt-2 text-xs text-text-muted">Read-only — no mutation controls</p>
        </section>

        <div className="flex flex-wrap gap-2 text-xs">
          <Link to="/dashboard/admin/education" className="text-brand underline-offset-4 hover:underline">
            Education detail →
          </Link>
          <Link to="/dashboard/admin/identity-review" className="text-brand underline-offset-4 hover:underline">
            Identity review →
          </Link>
          <Link to="/dashboard/iso/reports" className="text-brand underline-offset-4 hover:underline">
            ISO staff reports →
          </Link>
        </div>
      </div>
    </div>
  );
}
