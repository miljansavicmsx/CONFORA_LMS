/**
 * Moji dokumenti — credential wallet: potvrde o ispitu vs. certifikati osobe (ISO/IEC 17024).
 */

import { useQuery } from "@tanstack/react-query";
import { Award, Download, ExternalLink, GraduationCap, Loader2, ShieldCheck } from "lucide-react";
import { useCallback, useMemo, useState, type JSX } from "react";
import { Link } from "react-router";

import { CertificationLexiconBanner } from "@/components/learner/CertificationLexiconBanner";
import { ContextRibbon } from "@/components/information-disclosure";
import { Button } from "@/components/ui/button";
import {
  CertificationBadge,
  CertificateCard,
  CertificateHashBlock,
  CredentialLifecycleBadge,
  MetricCard,
  TrustBadge,
  TrustHero,
  ds,
} from "@/design-system";
import {
  fetchMyCertificatePdfUrl,
  type MyCertificateItem,
  fetchMyCertificates,
} from "@/lib/api-certificates";
import {
  canDownloadPdf,
  issuedIsDistinctFromActive,
  shouldShowPublicVerificationForCertificate,
} from "@/lib/use-documents-certificates-labels";
import { useDocumentsCertificatesLabels } from "@/lib/use-documents-certificates-labels";
import { IA_RIBBON_LEARNER_TRUST } from "@/lib/workspace-continuity";
import { cn } from "@/lib/utils";

const QUERY_KEY = ["myCertificates"] as const;

type WalletFilter =
  | "all"
  | "exam_pass"
  | "certification"
  | "active"
  | "expired"
  | "suspended"
  | "revoked";


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

function isActiveCertificateStatus(status: string): boolean {
  const s = status.toUpperCase();
  return (
    s === "ACTIVE" ||
    s === "VALID" ||
    s === "VALIDAN" ||
    s === "RECERTIFICATION_DUE" ||
    s === "UNDER_RECERTIFICATION_REVIEW"
  );
}

function splitWallet(rows: MyCertificateItem[]): { examPass: MyCertificateItem[]; certification: MyCertificateItem[] } {
  const examPass: MyCertificateItem[] = [];
  const certification: MyCertificateItem[] = [];
  for (const row of rows) {
    if (row.credentialWalletCategory === "exam_pass") {
      examPass.push(row);
    } else if (row.credentialWalletCategory === "certification") {
      certification.push(row);
    } else {
      examPass.push(row);
    }
  }
  return { examPass, certification };
}

export function certificateMatchesWalletFilter(row: MyCertificateItem, filter: WalletFilter): boolean {
  const status = row.lifecycleStatus.trim().toUpperCase();
  if (filter === "all") {
    return true;
  }
  if (filter === "exam_pass") {
    return row.credentialWalletCategory === "exam_pass";
  }
  if (filter === "certification") {
    return row.credentialWalletCategory === "certification";
  }
  if (filter === "active") {
    return ["ACTIVE", "VALID", "VALIDAN", "RECERTIFICATION_DUE", "UNDER_RECERTIFICATION_REVIEW"].includes(status);
  }
  if (filter === "expired") {
    return ["EXPIRED", "ISTEKAO"].includes(status);
  }
  if (filter === "suspended") {
    return ["SUSPENDED", "SUSPENDIRAN"].includes(status);
  }
  if (filter === "revoked") {
    return ["REVOKED", "OPOZVAN", "WITHDRAWN", "REPLACED"].includes(status);
  }
  return true;
}

export default function MyCertificates(): JSX.Element {
  const labels = useDocumentsCertificatesLabels();
  const {
    learnerDocumentTypeLabel,
    learnerCertificateStatusLabel,
    confirmationSectionNotice,
    professionalCertSectionNotice,
    confirmationEmptyCopy,
    professionalCertEmptyCopy,
    pdfPendingCopy,
    digitalSignatureLocalMvpCopy,
    walletFilters,
    heroEyebrow,
    heroTitle,
    heroDescription,
    loading: loadingLabel,
    refresh: refreshLabel,
    publicVerify,
    downloadPdf,
  } = labels;

  const [toast, setToast] = useState<string | null>(null);
  const [pdfBusyId, setPdfBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<WalletFilter>("all");

  const { data = [], isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchMyCertificates,
  });

  const filteredRows = useMemo(
    () => data.filter((row) => certificateMatchesWalletFilter(row, filter)),
    [data, filter],
  );
  const { examPass, certification } = useMemo(() => splitWallet(filteredRows), [filteredRows]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const onDownloadPdf = useCallback(
    async (c: MyCertificateItem) => {
      if (!canDownloadPdf(c)) {
        showToast(pdfPendingCopy);
        return;
      }
      setPdfBusyId(c.certificateId);
      try {
        const url = c.pdfUrl?.trim() ? c.pdfUrl : await fetchMyCertificatePdfUrl(c.certificateId);
        window.open(url, "_blank", "noopener,noreferrer");
      } catch {
        showToast("Preuzimanje PDF-a nije uspjelo — provjerite je li dokument generiran.");
      } finally {
        setPdfBusyId(null);
      }
    },
    [showToast, pdfPendingCopy],
  );

  const renderCard = (c: MyCertificateItem, variant: "exam" | "person"): JSX.Element => {
    const wallet = variant === "person" && isActiveCertificateStatus(c.lifecycleStatus);
    const showPublicVerify = shouldShowPublicVerificationForCertificate(c);
    const pubUrl = showPublicVerify ? c.publicVerificationUrl?.trim() || null : null;
    const typeLabel = learnerDocumentTypeLabel(c.certificateKind);
    const statusLabel = learnerCertificateStatusLabel(c.lifecycleStatus);
    const downloadReady = canDownloadPdf(c);

    return (
      <li key={c.certificateId} className="list-none">
        <CertificateCard
          ariaLabel={`Dokument: ${c.title}`}
          className={cn(wallet && cn("border-t-4 border-t-emerald-400/85", ds.elevation.spotlight))}
          headingLevel="h2"
          heading={c.title}
          icon={
            variant === "exam" ? (
              <GraduationCap className="text-sky-300" aria-hidden />
            ) : (
              <Award className="text-emerald-200" aria-hidden />
            )
          }
          badge={
            <>
              <CertificationBadge scope={variant === "exam" ? "exam_pass" : "credential"}>
                {typeLabel}
              </CertificationBadge>
              <CredentialLifecycleBadge lifecycleStatus={c.lifecycleStatus} />
            </>
          }
          footer={
            <div className="flex w-full max-w-none flex-[1_1_100%] flex-col gap-2">
              {showPublicVerify ? (
                pubUrl ? (
                  <Button type="button" variant="outline" size="sm" className="w-full border-border/60" asChild>
                    <a
                      href={pubUrl}
                      target="_blank"
                      rel="noreferrer"
                      data-testid={`learner-public-verify-link-${c.certificateId}`}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {publicVerify}
                    </a>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full border-border/60"
                    asChild
                  >
                    <Link
                      to={c.learnerVerifyPath}
                      target="_blank"
                      rel="noreferrer"
                      data-testid={`learner-public-verify-link-${c.certificateId}`}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {publicVerify}
                    </Link>
                  </Button>
                )
              ) : null}

              {downloadReady ? (
                <Button
                  type="button"
                  size="sm"
                  className="w-full bg-brand-solid text-white hover:bg-brand-hover"
                  disabled={pdfBusyId === c.certificateId}
                  onClick={() => void onDownloadPdf(c)}
                  data-testid={`learner-download-pdf-${c.certificateId}`}
                >
                  {pdfBusyId === c.certificateId ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {downloadPdf}
                </Button>
              ) : (
                <p
                  className="rounded-lg border border-border/40 bg-surface-secondary/40 px-3 py-2 text-xs text-text-secondary"
                  data-testid={`learner-pdf-pending-${c.certificateId}`}
                >
                  {pdfPendingCopy}
                </p>
              )}
            </div>
          }
        >
          <p className={ds.typography.body}>{typeLabel}</p>
          {c.schemeTitle && variant === "person" ? (
            <p className={cn(ds.typography.caption, "mt-1 text-text-secondary")}>
              Shema: {c.schemeTitle}
            </p>
          ) : null}
          {c.courseName && variant === "exam" ? (
            <p className={cn(ds.typography.caption, "mt-1 text-text-secondary")}>
              Program: {c.courseName}
            </p>
          ) : null}
          {c.credentialScopeNote ? (
            <p className={cn(ds.typography.body, ds.semantics.warning.accentBorder, "mt-2 rounded-lg px-2 py-1.5")}>
              {c.credentialScopeNote}
            </p>
          ) : null}

          {variant === "exam" ? (
            <p className={cn(ds.typography.caption, ds.semantics.learning.accentBorder, "mt-2 inline-block rounded-full px-2 py-0.5")}>
              {confirmationSectionNotice}
            </p>
          ) : null}

          <p className="mt-3 text-[11px] text-text-muted">
            <span className="font-medium text-text-secondary">Broj dokumenta:</span>{" "}
            <span className="font-mono text-text-primary">{c.certificateNumber}</span>
          </p>

          {variant === "person" && c.qrHash ? (
            <div className="mt-3">
              <CertificateHashBlock label="Hash za javnu provjeru" value={c.qrHash} />
            </div>
          ) : null}

          {variant === "person" && showPublicVerify ? (
            <div className="mt-3 rounded-xl border border-border/40 bg-surface-secondary/30 px-3 py-2 text-xs text-text-secondary">
              <p className="font-medium text-text-primary">Detalji povjerenja</p>
              <p className="mt-1">
                Broj certifikata:{" "}
                <span className="font-mono text-text-primary">{c.certificateNumber}</span>
              </p>
              {pubUrl ? (
                <p className="mt-1 break-all">
                  {publicVerify}:{" "}
                  <a href={pubUrl} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                    {pubUrl}
                  </a>
                </p>
              ) : null}
              <p className="mt-2 text-[11px] text-text-muted">{digitalSignatureLocalMvpCopy}</p>
            </div>
          ) : null}

          <dl className="mt-4 space-y-2 border-t border-border/35 pt-4 text-sm text-text-secondary">
            <div className="flex justify-between gap-2 border-b border-border/30 pb-2">
              <dt className="text-text-muted">Datum izdavanja</dt>
              <dd className="text-right text-text-primary">{formatDate(c.issueDate)}</dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-border/30 pb-2">
              <dt className="text-text-muted">Datum isteka</dt>
              <dd className="text-right text-text-primary">{formatDate(c.expiryDate)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-text-muted">Status u registru</dt>
              <dd
                className="text-right font-medium text-text-primary"
                data-testid="learner-cert-lifecycle-label"
              >
                {statusLabel}
              </dd>
            </div>
          </dl>

          {variant === "person" && issuedIsDistinctFromActive(c.lifecycleStatus) ? (
            <p className="mt-2 text-[11px] text-text-muted" data-testid="learner-issued-active-boundary">
              Status „Izdat“ nije isto što i „Aktivan“ — aktivna valjanost slijedi nakon završetka izdavanja.
            </p>
          ) : null}

          {variant === "person" &&
          ["RECERTIFICATION_DUE", "UNDER_RECERTIFICATION_REVIEW"].includes(c.lifecycleStatus.toUpperCase()) ? (
            <p className={cn(ds.typography.body, ds.semantics.warning.accentBorder, "mt-3 rounded-xl px-3 py-2")}>
              {c.lifecycleStatus.toUpperCase() === "RECERTIFICATION_DUE"
                ? "Recertifikacija potrebna prije isteka — otvorite stranicu Recertifikacija u izborniku."
                : "Recertifikacijska prijava je na pregledu u tijelu za certifikaciju."}
            </p>
          ) : null}
          {variant === "person" && c.lifecycleStatus.toUpperCase() === "RENEWED" ? (
            <p className={cn(ds.typography.body, "mt-3 rounded-xl border-violet-500/25 bg-violet-500/10 px-3 py-2 text-violet-100")}>
              Certifikat je obnovljen; aktivna valjanost slijedi na novom dokumentu u novčaniku.
            </p>
          ) : null}

          {c.supersededByCertificateId ? (
            <p className={cn(ds.typography.body, "mt-3 rounded-xl border-violet-500/25 bg-violet-500/10 px-3 py-2 text-violet-100")}>
              Zamjena: novi certifikat{" "}
              <span className="font-mono">{c.supersededByCertificateId}</span>
            </p>
          ) : null}
        </CertificateCard>
      </li>
    );
  };

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8" data-testid="learner-certificates-page">
      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-xl border border-emerald-500/40 bg-emerald-950/90 px-4 py-3 text-sm text-emerald-100 shadow-lg backdrop-blur"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <TrustHero
            id="learner-wallet-hero"
            eyebrow={heroEyebrow}
            title={heroTitle}
            description={heroDescription}
            trustBadge={
              !isLoading && !isError && data.some((x) => Boolean(x.publicVerificationUrl)) ? (
                <TrustBadge verified>Dio dokumenata s javnim verify URL-om</TrustBadge>
              ) : undefined
            }
            statusStrip={
              !isLoading && !isError && data.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/55 bg-black/25 px-2.5 py-1 text-[11px] text-text-secondary">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
                  <span>Ukupno {data.length} dokumenata u novčaniku</span>
                </span>
              ) : null
            }
            secondaryAction={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn("border-border/60 bg-surface-secondary/80", ds.focusRingTrust)}
                onClick={() => {
                  void refetch();
                }}
                disabled={isFetching}
              >
                {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {refreshLabel}
              </Button>
            }
          />
          <div className="mt-4">
            <ContextRibbon title="IA kontinuitet — povjerenje" items={IA_RIBBON_LEARNER_TRUST} />
          </div>
        </div>
        <div className="mb-8">
          <CertificationLexiconBanner variant="compact" />
        </div>

        {!isLoading && !isError && data.length > 0 ? (
          <div className="mb-8 space-y-3">
            <div className={cn(ds.gridOps)}>
              <MetricCard
                className={ds.semantics.learning.accentBorder}
                ariaLabel="Broj potvrda o položenom ispitu"
                icon={<GraduationCap className="text-sky-300" aria-hidden />}
              >
                <p className={ds.typography.caption}>Potvrde o ispitu</p>
                <p className="mt-2 text-2xl font-bold text-text-primary">
                  {data.filter((x) => x.credentialWalletCategory === "exam_pass").length}
                </p>
                <p className={cn(ds.typography.body, "mt-1")}>Potvrde o položenom ispitu.</p>
              </MetricCard>
              <MetricCard
                className={ds.semantics.governance.accentBorder}
                ariaLabel="Broj certifikata osobe"
                icon={<Award className="text-brand" aria-hidden />}
              >
                <p className={ds.typography.caption}>Profesionalni certifikati</p>
                <p className="mt-2 text-2xl font-bold text-text-primary">
                  {data.filter((x) => x.credentialWalletCategory === "certification").length}
                </p>
                <p className={cn(ds.typography.body, "mt-1")}>Certifikati nakon odluke komiteta.</p>
              </MetricCard>
              <MetricCard
                className={ds.semantics.trust.accentBorder}
                ariaLabel="Broj dokumenata s javnom provjerom"
                icon={<ShieldCheck className="text-emerald-300" aria-hidden />}
              >
                <p className={ds.typography.caption}>{publicVerify}</p>
                <p className="mt-2 text-2xl font-bold text-text-primary">
                  {data.filter((x) => Boolean(x.publicVerificationUrl)).length}
                </p>
                <p className={cn(ds.typography.body, "mt-1")}>Dokumenti s verify linkom.</p>
              </MetricCard>
            </div>
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter dokumenata">
              {walletFilters.map((f) => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-brand bg-brand/15 text-brand"
                        : "border-border/60 bg-surface-secondary/70 text-text-secondary hover:text-text-primary",
                    )}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-[30vh] items-center justify-center gap-2 text-text-secondary">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            {loadingLabel}
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
            Nije moguće učitati dokumente. Provjeri prijavu i vezu s API-jem.
          </div>
        ) : null}

        {!isLoading && !isError && data.length === 0 ? (
          <div className="space-y-8">
            <section aria-labelledby="confirmations-empty-heading">
              <h2 id="confirmations-empty-heading" className="text-lg font-semibold text-text-primary">
                A. Potvrde
              </h2>
              <p className="mb-2 text-xs text-amber-200/90" data-testid="learner-confirmation-section-notice">
                {confirmationSectionNotice}
              </p>
              <p
                className="rounded-xl border border-border/40 bg-surface-secondary/30 px-4 py-6 text-sm text-text-secondary"
                data-testid="learner-confirmations-empty"
              >
                {confirmationEmptyCopy}
              </p>
            </section>
            <section aria-labelledby="professional-empty-heading">
              <h2 id="professional-empty-heading" className="text-lg font-semibold text-text-primary">
                B. Profesionalni certifikati osoba
              </h2>
              <p
                className="mb-4 text-xs text-text-muted"
                data-testid="learner-professional-cert-section-notice"
              >
                {professionalCertSectionNotice}
              </p>
              <p
                className="rounded-xl border border-border/40 bg-surface-secondary/30 px-4 py-6 text-sm text-text-secondary"
                data-testid="learner-professional-certs-empty"
              >
                {professionalCertEmptyCopy}
              </p>
            </section>
          </div>
        ) : null}

        {!isLoading && !isError && data.length > 0 && filteredRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-surface-secondary/35 px-6 py-12 text-center">
            <Award className="mx-auto h-10 w-10 text-text-muted" aria-hidden />
            <p className="mt-4 font-semibold text-text-primary">Nema dokumenata za odabrani filter.</p>
            <p className="mt-2 text-sm text-text-secondary">Promijenite filter ili osvježite wallet.</p>
            <Button type="button" variant="outline" className="mt-5 border-border/60" onClick={() => setFilter("all")}>
              Prikaži sve
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && filteredRows.length > 0 ? (
          <div className="space-y-12">
            <section aria-labelledby="exam-pass-heading">
              <div className="mb-4 flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-sky-400" aria-hidden />
                <h2 id="exam-pass-heading" className="text-lg font-semibold text-text-primary">
                  A. Potvrde
                </h2>
              </div>
              <p className="mb-4 text-xs text-amber-200/90" data-testid="learner-confirmation-section-notice">
                {confirmationSectionNotice}
              </p>
              {examPass.length === 0 ? (
                <p
                  className="rounded-xl border border-border/40 bg-surface-secondary/30 px-4 py-6 text-sm text-text-secondary"
                  data-testid="learner-confirmations-empty"
                >
                  {confirmationEmptyCopy}
                </p>
              ) : (
                <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {examPass.map((c) => renderCard(c, "exam"))}
                </ul>
              )}
            </section>

            <section aria-labelledby="person-cert-heading">
              <div className="mb-4 flex items-center gap-3">
                <Award className="h-6 w-6 text-brand" aria-hidden />
                <h2 id="person-cert-heading" className="text-lg font-semibold text-text-primary">
                  B. Profesionalni certifikati osoba
                </h2>
              </div>
              <p
                className="mb-4 text-xs text-text-muted"
                data-testid="learner-professional-cert-section-notice"
              >
                {professionalCertSectionNotice}
              </p>
              {certification.length === 0 ? (
                <p
                  className="rounded-xl border border-border/40 bg-surface-secondary/30 px-4 py-6 text-sm text-text-secondary"
                  data-testid="learner-professional-certs-empty"
                >
                  {professionalCertEmptyCopy}
                </p>
              ) : (
                <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {certification.map((c) => renderCard(c, "person"))}
                </ul>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
