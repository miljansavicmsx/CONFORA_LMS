/**
 * ISO organizacijski izvještaji — F4 canonical staff reports (read-only aggregates + controlled export).
 */

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Download, Loader2 } from "lucide-react";
import { useMemo, useState, type JSX, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isNormalizedApiError } from "@/lib/api/api-error";
import {
  exportReport,
  fetchReportsSummary,
  getReportExportPolicy,
  isLegacyReportBuilderBlocked,
  isReportExportEnabled,
  legacySectionToReportKey,
  requiresExportReason,
  type ReportsSummary,
} from "@/lib/api-reports";
import type { ExportFormat, ReportKey } from "@/lib/api/reports-types";

import { IsoPageShell } from "./IsoPageShell";

function MetricCard({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}): JSX.Element {
  return (
    <div className="rounded-xl border border-border/40 bg-surface-secondary/40 p-4 ring-1 ring-white/[0.04]">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h3>
      <div className="mt-3 text-sm text-text-primary">{children}</div>
    </div>
  );
}

function KeyCounts({ data }: { readonly data: Record<string, unknown> | undefined }): JSX.Element {
  if (!data || typeof data !== "object") {
    return <span className="text-text-muted">—</span>;
  }
  const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
  return (
    <ul className="space-y-1 font-mono text-xs">
      {entries.map(([k, v]) => (
        <li key={k} className="flex justify-between gap-4">
          <span className="text-text-muted">{k}</span>
          <span>{String(v)}</span>
        </li>
      ))}
    </ul>
  );
}

function triggerDownload(blob: Blob, filename: string): void {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportErrorMessage(err: unknown): string {
  if (isNormalizedApiError(err)) {
    if (err.status === 403) {
      return "Izvoz nije dopušten za ovu ulogu ili izvještaj.";
    }
    if (err.status === 400) {
      return "Neispravni filteri ili parametri izvoza.";
    }
    if (err.status === 410 || err.status === 501) {
      return "Izvoz ili alat za izvještaje više nije dostupan.";
    }
    return err.message || "Izvoz nije uspio.";
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "Izvoz nije uspio.";
}

type PendingExport = {
  readonly section: string;
  readonly reportKey: ReportKey;
  readonly format: ExportFormat;
};

function SectionExportButton({
  section,
  allowedFormats,
  allowedReportKeys,
  dateFrom,
  dateTo,
  onError,
}: {
  readonly section: string;
  readonly allowedFormats: readonly ExportFormat[];
  readonly allowedReportKeys: readonly string[];
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly onError: (message: string) => void;
}): JSX.Element | null {
  const reportKey = legacySectionToReportKey(section);
  const exportEnabled = isReportExportEnabled();
  const canCsv = exportEnabled && allowedFormats.includes("CSV") && reportKey && allowedReportKeys.includes(reportKey);

  const [busy, setBusy] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState<PendingExport | null>(null);

  if (!canCsv || !reportKey) {
    return null;
  }

  const runExport = async (opts: PendingExport, exportReason?: string) => {
    setBusy(true);
    onError("");
    try {
      const filters: Record<string, unknown> = {};
      if (dateFrom?.trim()) {
        filters.dateFrom = dateFrom.trim();
      }
      if (dateTo?.trim()) {
        filters.dateTo = dateTo.trim();
      }
      const request = {
        reportKey: opts.reportKey,
        format: opts.format,
        ...(Object.keys(filters).length > 0 ? { filters } : {}),
        ...(exportReason?.trim() ? { reason: exportReason.trim() } : {}),
      };
      const result = await exportReport(request);
      if (result.kind === "csv") {
        triggerDownload(result.blob, result.filename);
      } else {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json;charset=utf-8",
        });
        triggerDownload(blob, `confora-${opts.reportKey}.json`);
      }
    } catch (err) {
      onError(exportErrorMessage(err));
    } finally {
      setBusy(false);
      setReasonOpen(false);
      setPending(null);
      setReason("");
    }
  };

  const startExport = () => {
    const opts: PendingExport = { section, reportKey, format: "CSV" };
    if (requiresExportReason(reportKey)) {
      setPending(opts);
      setReasonOpen(true);
      return;
    }
    void runExport(opts);
  };

  const confirmReasonExport = () => {
    if (!pending || !reason.trim()) {
      onError("Obrazloženje je obavezno za ovaj izvještaj.");
      return;
    }
    void runExport(pending, reason);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-border/60"
        onClick={startExport}
        disabled={busy}
      >
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
        CSV
      </Button>
      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Obrazloženje izvoza</DialogTitle>
            <DialogDescription>
              Ovaj izvještaj sadrži osjetljive podatke. Unesite poslovni razlog za izvoz (audit trail).
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[96px] w-full rounded-md border border-border/60 bg-surface-primary px-3 py-2 text-sm"
            placeholder="Razlog izvoza…"
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setReasonOpen(false)}>
              Odustani
            </Button>
            <Button type="button" onClick={confirmReasonExport} disabled={busy || !reason.trim()}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Izvezi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function IsoReportsPage(): JSX.Element {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [exportError, setExportError] = useState("");

  const params = useMemo(() => {
    const p: { from?: string; to?: string } = {};
    if (from.trim()) {
      p.from = from.trim();
    }
    if (to.trim()) {
      p.to = to.trim();
    }
    return p;
  }, [from, to]);

  const q = useQuery({
    queryKey: ["reportsSummary", params] as const,
    queryFn: () => fetchReportsSummary(params),
  });

  const policyQ = useQuery({
    queryKey: ["reportsExportPolicy"] as const,
    queryFn: () => getReportExportPolicy(),
    enabled: isReportExportEnabled(),
  });

  const data: ReportsSummary = q.data ?? {};
  const denied = Boolean(data.denied);
  const roleSections = data.roleSections ?? [];
  const allowedFormats = policyQ.data?.formats ?? [];
  const allowedReportKeys = policyQ.data?.reportKeys ?? [];
  const builderBlocked = isLegacyReportBuilderBlocked();

  const exportProps = {
    allowedFormats,
    allowedReportKeys,
    onError: setExportError,
    ...(params.from ? { dateFrom: params.from } : {}),
    ...(params.to ? { dateTo: params.to } : {}),
  };

  return (
    <IsoPageShell
      icon={BarChart3}
      title="Izvještaji"
      description="Sažete metrike po ulozi. Širi vremenski raspon može duže učitavati podatke — koristite preciznije datume ako je moguće."
    >
      {builderBlocked ? (
        <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
          Legacy alat za sastavljanje izvještaja više nije dostupan. Koristite pregledne izvještaje i kontrolirani
          izvoz u skladu s F4 politikom.
        </p>
      ) : null}

      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border/50 bg-surface-secondary/35 p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <div>
            <label htmlFor="rep-from" className="text-xs text-text-muted">
              Od
            </label>
            <input
              id="rep-from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 block h-9 rounded-md border border-border/60 bg-surface-primary px-2 text-sm"
              placeholder="YYYY-MM-DD"
            />
          </div>
          <div>
            <label htmlFor="rep-to" className="text-xs text-text-muted">
              Do
            </label>
            <input
              id="rep-to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 block h-9 rounded-md border border-border/60 bg-surface-primary px-2 text-sm"
              placeholder="YYYY-MM-DD"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-5 border-border/60"
            onClick={() => void q.refetch()}
            disabled={q.isFetching}
            data-testid="iso-reports-refresh-btn"
          >
            {q.isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Osvježi izvještaj
          </Button>
        </div>
        <p className="max-w-md text-xs text-text-secondary">
          Filtri datuma sužavaju razdoblje za koje se prikazuju brojke. Za brže učitavanje birajte kraće raspone.
        </p>
      </div>

      {exportError ? <p className="mb-4 text-sm text-red-400">{exportError}</p> : null}

      {q.isLoading ? (
        <div className="flex items-center gap-2 text-text-secondary">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
          Učitavanje…
        </div>
      ) : null}

      {q.isError ? (
        <p className="text-sm text-red-400">
          {isNormalizedApiError(q.error)
            ? exportErrorMessage(q.error)
            : (q.error as Error)?.message ?? "API nedostupan ili nedovoljne ovlasti."}
        </p>
      ) : null}

      {!q.isLoading && !denied ? (
        <div className="mb-6 text-xs text-text-muted">
          Sekcije za vašu ulogu: {roleSections.length ? roleSections.join(", ") : "—"}
          {data.generatedAt ? (
            <span className="ml-2 text-text-secondary">· generirano {data.generatedAt}</span>
          ) : null}
        </div>
      ) : null}

      {denied ? <p className="text-sm text-amber-200">Nema dodijeljenih sekcija izvještaja za ovu ulogu.</p> : null}

      {!q.isLoading && !q.isError && !denied && data.slaSummary ? (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">SLA — sažetak</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(data.slaSummary).map(([domain, row]) => (
              <MetricCard key={domain} title={domain}>
                <p>Otvoreno: {row.open}</p>
                <p className="mt-1">Uskoro dospijeva: {row.dueSoon}</p>
                <p className="mt-1">Prekoračeno: {row.overdue}</p>
              </MetricCard>
            ))}
          </div>
        </section>
      ) : null}

      {!q.isLoading && !q.isError && !denied ? (
        <div className="space-y-10">
          {"education" in data && data.education ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-text-primary">Edukacija / tečajevi</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard title="Tečajevi u pregledu">
                  <p>
                    Ukupno: <strong>{String(data.education.totalCoursesSampled ?? "—")}</strong>
                  </p>
                  <p className="mt-2">
                    Objavljeno: <strong>{String(data.education.publishedCoursesSampled ?? "—")}</strong>
                  </p>
                </MetricCard>
              </div>
            </section>
          ) : null}

          {"learners" in data && data.learners ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-text-primary">Polaznici</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard title="Brojke">
                  <p>
                    Različiti korisnici: <strong>{String(data.learners.distinctLearnersSampled ?? "—")}</strong>
                  </p>
                  <p className="mt-2">
                    Aktivni upisi: <strong>{String(data.learners.activeEnrollmentsSampled ?? "—")}</strong>
                  </p>
                </MetricCard>
              </div>
            </section>
          ) : null}

          {"candidates" in data && data.candidates ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-text-primary">Kandidati za certifikaciju</h2>
              <MetricCard title="Prijava po statusu">
                <KeyCounts
                  data={data.candidates.certificationApplicationsByStatus as Record<string, unknown> | undefined}
                />
              </MetricCard>
            </section>
          ) : null}

          {"certificationFunnel" in data && data.certificationFunnel ? (
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-text-primary">Certifikacija — lijevak</h2>
                <SectionExportButton section="certificationFunnel" {...exportProps} />
              </div>
              <div className="overflow-x-auto rounded-xl border border-border/40">
                <table className="w-full min-w-[320px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-surface-secondary/80">
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Broj</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(data.certificationFunnel)
                      ? data.certificationFunnel.map((row) => (
                          <tr key={String(row.status)} className="border-b border-border/30">
                            <td className="px-3 py-2 font-mono text-xs">{row.status}</td>
                            <td className="px-3 py-2">{row.count}</td>
                          </tr>
                        ))
                      : null}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {"certificationDecisions" in data && data.certificationDecisions ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-text-primary">Odluke i opterećenje odbora</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                <MetricCard title="Odluke po statusu">
                  <KeyCounts data={data.certificationDecisions.byStatus as Record<string, unknown> | undefined} />
                </MetricCard>
                <MetricCard title="Broj odluka po committeeId">
                  <KeyCounts
                    data={data.certificationDecisions.committeeDecisionCounts as Record<string, unknown> | undefined}
                  />
                </MetricCard>
              </div>
            </section>
          ) : null}

          {"exams" in data && data.exams ? (
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-text-primary">Ispiti</h2>
                <SectionExportButton section="exams" {...exportProps} />
              </div>
              <MetricCard title="Prolaznost — završeni pokušaji">
                <KeyCounts data={data.exams} />
              </MetricCard>
            </section>
          ) : null}

          {"certificates" in data && data.certificates ? (
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-text-primary">Certifikati</h2>
                <SectionExportButton section="certificates" {...exportProps} />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <MetricCard title="Izdano u pregledu">
                  <p>
                    Ispitna potvrda: <strong>{String(data.certificates.examPassCertificatesSampled ?? "—")}</strong>
                  </p>
                  <p className="mt-2">
                    Osobna certifikacija:{" "}
                    <strong>{String(data.certificates.personCertificationCertificatesSampled ?? "—")}</strong>
                  </p>
                </MetricCard>
                <MetricCard title="Životni ciklus / sankcije">
                  <KeyCounts data={data.certificates.lifecycleStatusCounts as Record<string, unknown> | undefined} />
                  <p className="mt-3 text-xs text-text-muted">
                    Sankcije: {String(data.certificates.sanctionsCounts ?? "—")}
                  </p>
                </MetricCard>
              </div>
            </section>
          ) : null}

          {"finance" in data && data.finance ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-text-primary">Financije (pregled)</h2>
              <MetricCard title="Sažetak">
                <KeyCounts data={data.finance} />
              </MetricCard>
            </section>
          ) : null}

          {"appealsAndComplaints" in data && data.appealsAndComplaints ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-text-primary">Žalbe i pritužbe</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                <MetricCard title="Žalbe (cert) po statusu">
                  <KeyCounts
                    data={data.appealsAndComplaints.appealsByStatus as Record<string, unknown> | undefined}
                  />
                </MetricCard>
                <MetricCard title="Pritužbe po statusu / kategoriji">
                  <p className="text-xs text-text-muted">Status</p>
                  <KeyCounts
                    data={data.appealsAndComplaints.complaintsByStatus as Record<string, unknown> | undefined}
                  />
                  <p className="mt-3 text-xs text-text-muted">Kategorija</p>
                  <KeyCounts
                    data={data.appealsAndComplaints.complaintsByCategory as Record<string, unknown> | undefined}
                  />
                </MetricCard>
              </div>
            </section>
          ) : null}

          {"recertification" in data && data.recertification ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-text-primary">Recertifikacija</h2>
              <MetricCard title="Prijava po statusu">
                <KeyCounts data={data.recertification.byStatus as Record<string, unknown> | undefined} />
              </MetricCard>
            </section>
          ) : null}

          {"governance" in data && data.governance ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-text-primary">Upravljanje — pregled</h2>
              <MetricCard title="Zapisi">
                <KeyCounts data={data.governance} />
              </MetricCard>
            </section>
          ) : null}

          {"counts" in data && data.counts && Object.keys(data.counts).length > 0 ? (
            <section className="rounded-xl border border-border/30 bg-surface-primary/40 p-4">
              <h2 className="mb-3 text-sm font-semibold text-text-primary">Agregirani brojevi (F4 pregled)</h2>
              <KeyCounts data={data.counts} />
            </section>
          ) : null}

          {"sampleCaps" in data && data.sampleCaps ? (
            <section className="rounded-xl border border-border/30 bg-surface-primary/40 p-4 text-xs text-text-muted">
              <p className="font-semibold text-text-secondary">Ograničenje zapisa po tablici (sustav)</p>
              <pre className="mt-2 overflow-x-auto font-mono">{JSON.stringify(data.sampleCaps, null, 2)}</pre>
            </section>
          ) : null}
        </div>
      ) : null}
    </IsoPageShell>
  );
}
