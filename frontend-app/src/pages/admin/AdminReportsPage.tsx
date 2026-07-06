import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type JSX } from "react";
import { Link } from "react-router";

import { AdminReportCharts } from "@/components/admin/AdminReportCharts";
import { ReportDateFilterBar } from "@/components/admin/ReportDateFilterBar";
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
import {
  adminAuditDomainLabel,
  adminReportStatusLabel,
  ADMIN_PILOT_SYNTHETIC_NOTICE,
  ADMIN_PUBLIC_VERIFY_NOTICE,
  ADMIN_REPORTS_READONLY_NOTICE,
  createAdminPilotEmptyDashboardSummary,
  mapAdminChartRows,
} from "@/lib/admin-gov-ux-labels";
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
        <p className="mt-2 text-xs text-text-muted">Još nema zapisa u ovoj kategoriji.</p>
      ) : (
        <table className="mt-2 w-full text-xs">
          <thead>
            <tr className="border-b border-border/40 text-left text-text-muted">
              <th className="py-1 pr-2">Status</th>
              <th className="py-1">Broj</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([status, count]) => (
              <tr key={status} className="border-b border-border/20">
                <td className="py-1 pr-2">{adminReportStatusLabel(status)}</td>
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
  const qc = useQueryClient();
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

  const s: AdminDashboardSummary | undefined =
    summaryQ.data ??
    (summaryQ.isError && !summaryQ.isPending ? createAdminPilotEmptyDashboardSummary() : undefined);
  const decisions: AdminCertificationDecisionsReport | undefined = certDecisionsQ.data;

  const isRefreshing =
    summaryQ.isFetching ||
    certAppsQ.isFetching ||
    certDecisionsQ.isFetching ||
    certCertsQ.isFetching ||
    lifecycleQ.isFetching ||
    evidenceQ.isFetching;

  const refreshAll = (): void => {
    void qc.invalidateQueries({ queryKey: ["admin", "reports"] });
  };

  const handleExport = (reportKey: ReportKey, filename: string) => {
    downloadAdminReportExport(reportKey, filename).catch((e: Error) => setMessage(e.message));
  };

  const handleEducationExport = (kind: "enrolments" | "completions") => {
    downloadAdminEducationCsv(kind).catch((e: Error) => setMessage(e.message));
  };

  const chartData = summaryQ.data
    ? {
        certificationApplicationsByStatus: mapAdminChartRows(summaryQ.data.chartData.certificationApplicationsByStatus),
        certificationDecisionsByOutcome: mapAdminChartRows(summaryQ.data.chartData.certificationDecisionsByOutcome),
        certificateLifecycleByStatus: mapAdminChartRows(summaryQ.data.chartData.certificateLifecycleByStatus),
        educationEnrolmentByStatus: mapAdminChartRows(summaryQ.data.chartData.educationEnrolmentByStatus),
        learnerProgressDistribution: mapAdminChartRows(summaryQ.data.chartData.learnerProgressDistribution),
        auditActivityByDomain: mapAdminChartRows(summaryQ.data.chartData.auditActivityByDomain),
      }
    : null;

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8" data-testid="admin-reports-page">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-text-primary" data-testid="admin-reports-heading">
            Poslovni izvještaji
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Objedinjeni pregled samo za čitanje — certifikacija, edukacija, provjera identiteta i audit trag.
          </p>
        </header>

        <p
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-text-secondary"
          data-testid="admin-reports-readonly-badge"
        >
          {ADMIN_REPORTS_READONLY_NOTICE}
        </p>

        <p
          className="rounded-lg border border-sky-500/25 bg-sky-500/10 px-3 py-2 text-xs text-text-secondary"
          data-testid="admin-reports-synthetic-banner"
        >
          {ADMIN_PILOT_SYNTHETIC_NOTICE}
        </p>

        <ReportDateFilterBar onRefresh={refreshAll} isFetching={isRefreshing} />

        {message ? <p className="text-sm text-destructive">{message}</p> : null}

        {summaryQ.isError ? (
          <p className="text-sm text-destructive" data-testid="admin-summary-error">
            Nije moguće učitati sažetak nadzorne ploče. Ostali odjeljci ostaju dostupni samo za čitanje.
          </p>
        ) : null}

        {summaryQ.isPending ? (
          <p className="text-xs text-text-muted" data-testid="admin-summary-loading">
            Učitavanje sažetka…
          </p>
        ) : null}

        {s ? (
          <>
            <section className="rounded-xl border border-border/50 p-4" data-testid="admin-reports-dashboard-cards">
              <h2 className="text-sm font-semibold">Pregled certifikacije</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Evidentirane odluke" value={s.certification.decisionsRecorded} testId="admin-summary-decisions-recorded" />
                <MetricCard label="Odluke u pripremi" value={s.certification.decisionsPending} testId="admin-summary-decisions-pending" />
                <MetricCard label="Izdati/aktivni certifikati" value={s.certification.issuedCount} testId="admin-summary-cert-issued" />
                <MetricCard label="Javne provjere" value={s.certification.publicVerificationCount} testId="admin-summary-public-verify" />
                <MetricCard
                  label="Kvorum potvrđen"
                  value={s.certification.quorumEvidence.decisionsWithQuorumConfirmed}
                  testId="admin-summary-quorum-confirmed"
                />
                <MetricCard
                  label="Pregledi u toku"
                  value={s.certification.quorumEvidence.reviewsInProgress}
                  testId="admin-summary-reviews-in-progress"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(s.certification.applicationsByStatus).map(([status, count]) => (
                  <StatusChip key={status} label={adminReportStatusLabel(status)} count={count} />
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-border/50 p-4" data-testid="admin-education-overview">
              <h2 className="text-sm font-semibold">Pregled edukacija</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Edukacije" value={s.education.courseCount} testId="admin-summary-education-courses" />
                <MetricCard label="Upisi" value={s.education.enrolmentCount} testId="admin-summary-education-enrolments" />
                <MetricCard label="Završene edukacije" value={s.education.completionCount} testId="admin-summary-education-completions" />
                <MetricCard label="Stopa završetka" value={`${s.education.completionRate}%`} testId="admin-summary-education-rate" />
                <MetricCard
                  label="Potvrde o završenoj edukaciji"
                  value={s.evidence.educationCompletionCertificateCount}
                  testId="admin-summary-edu-completion-certs"
                />
              </div>
            </section>

            <section className="rounded-xl border border-border/50 p-4" data-testid="admin-identity-overview">
              <h2 className="text-sm font-semibold">Pregled provjere identiteta</h2>
              <p className="mt-1 text-xs text-text-muted">Ručna provjera dokumenata bez biometrije — samo staff red čekanja.</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <MetricCard label="Na čekanju" value={s.identity.reviewQueueCount} testId="admin-summary-identity-queue" />
                <MetricCard label="Verifikovano" value={s.identity.verifiedCount} testId="admin-summary-identity-verified" />
                <MetricCard label="Odbijeno" value={s.identity.rejectedCount} testId="admin-summary-identity-rejected" />
              </div>
            </section>

            <section className="rounded-xl border border-border/50 p-4" data-testid="admin-audit-evidence-overview">
              <h2 className="text-sm font-semibold">Audit i dokazi — pregled</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Audit događaji" value={s.audit.totalEventCount} testId="admin-summary-audit-total" />
                <MetricCard label="Izvozi izvještaja" value={s.audit.reportExportCount} testId="admin-summary-export-count" />
                <MetricCard label="Pregledi dokumenata" value={s.evidence.documentPreviewCount} testId="admin-summary-doc-previews" />
                <MetricCard label="Kvorum dokazi (potvrđeno)" value={s.certification.quorumEvidence.decisionsWithQuorumConfirmed} testId="admin-summary-quorum-evidence" />
              </div>
            </section>

            <section className="rounded-xl border border-border/50 p-4" data-testid="admin-system-readiness">
              <h2 className="text-sm font-semibold">Sustav / spremnost</h2>
              <p className="mt-1 text-xs text-text-muted">Aktivna lokalna demo površina — poznati neblokirajući nedostaci:</p>
              <ul className="mt-2 list-inside list-disc text-xs text-text-secondary">
                {s.system.knownNonBlockingGaps.map((gap) => (
                  <li key={gap}>{gap}</li>
                ))}
              </ul>
            </section>

            {chartData ? (
              <section className="rounded-xl border border-border/50 p-4">
                <h2 className="text-sm font-semibold">Grafikoni</h2>
                <AdminReportCharts {...chartData} />
              </section>
            ) : null}
          </>
        ) : null}

        <section className="rounded-xl border border-border/50 p-4" data-testid="admin-certification-reports">
          <h2 className="text-sm font-semibold">Izvještaji certifikacije</h2>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <StatusTable
              title="Prijave po statusu"
              rows={certAppsQ.data?.applicationsByStatus ?? s?.certification.applicationsByStatus ?? {}}
              testId="admin-cert-applications-table"
            />
            <StatusTable
              title="Certifikati po statusu"
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
              <h3 className="text-xs font-medium text-text-secondary">Nedavne odluke o certifikaciji (kvorum)</h3>
              <table className="mt-2 w-full text-xs">
                <thead>
                  <tr className="border-b border-border/40 text-left text-text-muted">
                    <th className="py-1 pr-2">Prijava</th>
                    <th className="py-1 pr-2">Status</th>
                    <th className="py-1 pr-2">Ishod</th>
                    <th className="py-1 pr-2">Kvorum</th>
                  </tr>
                </thead>
                <tbody>
                  {decisions.items.slice(0, 10).map((row) => (
                    <tr key={row.reviewId} className="border-b border-border/20">
                      <td className="py-1 pr-2 font-mono text-[10px]">{row.applicationId.slice(0, 8)}…</td>
                      <td className="py-1 pr-2">{adminReportStatusLabel(row.status)}</td>
                      <td className="py-1 pr-2">{adminReportStatusLabel(row.outcome ?? "")}</td>
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
              Još nema evidentiranih odluka o certifikaciji.
            </p>
          )}
          {lifecycleQ.data ? (
            <p className="mt-2 text-xs text-text-secondary" data-testid="admin-cert-lifecycle-summary">
              Praćeni događaji životnog ciklusa · javna verifikacija:{" "}
              {lifecycleQ.data.publicVerificationActivityCount || s?.certification.publicVerificationCount || 0}. {ADMIN_PUBLIC_VERIFY_NOTICE}
            </p>
          ) : null}
        </section>

        <section className="rounded-xl border border-border/50 p-4" data-testid="admin-evidence-overview">
          <h2 className="text-sm font-semibold">Pregled dokaza / dokumenata</h2>
          {evidenceQ.data ? (
            <dl className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-text-muted">Pregledi dokumenata</dt>
                <dd className="font-semibold">{evidenceQ.data.documentPreviewCount}</dd>
              </div>
              <div>
                <dt className="text-text-muted">PDF certifikata</dt>
                <dd className="font-semibold">{evidenceQ.data.certificatePdfCount}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Potvrde o završetku edukacije</dt>
                <dd className="font-semibold">{evidenceQ.data.educationCompletionCertificateCount}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Pristup identitetnim dokumentima</dt>
                <dd>{evidenceQ.data.identityDocumentAccess}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-2 text-xs text-text-muted">Učitavanje pregleda dokaza…</p>
          )}
          <button
            type="button"
            className="mt-2 text-xs text-brand underline"
            onClick={() => setShowTechnical((v) => !v)}
          >
            {showTechnical ? "Sakrij" : "Prikaži"} tehnički detalj
          </button>
          {showTechnical && evidenceQ.data ? (
            <pre className="mt-2 max-h-32 overflow-auto rounded bg-surface-secondary p-2 text-[10px]">
              {JSON.stringify(evidenceQ.data, null, 2)}
            </pre>
          ) : null}
        </section>

        <section className="rounded-xl border border-border/50 p-4" data-testid="admin-export-governance">
          <h2 className="text-sm font-semibold">Izvozi (samo čitanje)</h2>
          <p className="mt-1 text-xs text-text-muted">Svi izvozi su ograničeni na tenant, auditirani i redigovani — bez privatnih identitetnih dokumenata.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" data-testid="admin-export-dashboard-csv" onClick={() => handleExport(ADMIN_REPORT_EXPORT_KEYS.dashboard, "admin-dashboard-summary.csv")}>
              Sažetak CSV
            </Button>
            <Button type="button" size="sm" variant="secondary" data-testid="admin-export-cert-apps-csv" onClick={() => handleExport(ADMIN_REPORT_EXPORT_KEYS.certificationApplications, "certification-applications.csv")}>
              Prijave CSV
            </Button>
            <Button type="button" size="sm" variant="secondary" data-testid="admin-export-cert-decisions-csv" onClick={() => handleExport(ADMIN_REPORT_EXPORT_KEYS.certificationDecisions, "certification-decisions.csv")}>
              Odluke CSV
            </Button>
            <Button type="button" size="sm" variant="secondary" data-testid="admin-export-lifecycle-csv" onClick={() => handleExport(ADMIN_REPORT_EXPORT_KEYS.certificateLifecycle, "certificate-lifecycle.csv")}>
              Životni ciklus CSV
            </Button>
            <Button type="button" size="sm" variant="secondary" data-testid="admin-export-evidence-csv" onClick={() => handleExport(ADMIN_REPORT_EXPORT_KEYS.evidenceOverview, "evidence-overview.csv")}>
              Dokazi CSV
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              data-testid="admin-export-audit-csv"
              onClick={() => downloadAdminAuditEventsCsv(auditDomain || undefined).catch((e: Error) => setMessage(e.message))}
            >
              Audit događaji CSV
            </Button>
            <Button type="button" size="sm" variant="outline" data-testid="admin-export-edu-enrolments-csv" onClick={() => handleEducationExport("enrolments")}>
              Upisi edukacije CSV
            </Button>
            <Button type="button" size="sm" variant="outline" data-testid="admin-export-edu-completions-csv" onClick={() => handleEducationExport("completions")}>
              Završetci edukacije CSV
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-border/50 p-4" data-testid="admin-unified-audit-viewer">
          <h2 className="text-sm font-semibold">Objedinjeni audit pregled</h2>
          <label className="mt-2 block text-xs text-text-muted">
            Filter domene
            <select
              className="mt-1 rounded border border-border/60 bg-surface-primary px-2 py-1 text-sm"
              value={auditDomain}
              onChange={(e) => setAuditDomain(e.target.value)}
              data-testid="admin-audit-domain-filter"
            >
              <option value="">Sve domene</option>
              <option value="education">Edukacija</option>
              <option value="certification">Certifikacija</option>
              <option value="identity">Identitet</option>
              <option value="governance">Upravljanje</option>
            </select>
          </label>
          {auditQ.isPending ? <p className="mt-2 text-xs text-text-muted">Učitavanje audit događaja…</p> : null}
          <ul className="mt-3 max-h-64 space-y-1 overflow-auto text-xs text-text-secondary">
            {(auditQ.data?.items ?? []).map((ev) => (
              <li key={ev.id} data-testid={`admin-audit-row-${ev.id}`}>
                {ev.occurredAt.slice(0, 19)} · [{adminAuditDomainLabel(ev.domain)}] {ev.action} — {ev.summary}
              </li>
            ))}
            {!auditQ.isPending && !auditQ.data?.items?.length ? (
              <li data-testid="admin-audit-empty">Nema audit događaja za ovaj filter.</li>
            ) : null}
          </ul>
          <p className="mt-2 text-xs text-text-muted">Samo čitanje — bez kontrola za izmjenu podataka.</p>
        </section>

        <div className="flex flex-wrap gap-2 text-xs">
          <Link to="/dashboard/admin/education" className="text-brand underline-offset-4 hover:underline">
            Upravljanje edukacijama →
          </Link>
          <Link to="/dashboard/admin/identity-review" className="text-brand underline-offset-4 hover:underline">
            Provjera identiteta →
          </Link>
          <Link to="/dashboard/iso/reports" className="text-brand underline-offset-4 hover:underline">
            ISO izvještaji →
          </Link>
        </div>
      </div>
    </div>
  );
}
