/**
 * Javna verifikacija dokumenta — razlikuje EXAM_PASS potvrdu i PERSON_CERTIFICATION.
 */

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  Printer,
  Shield,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useCallback, useMemo, useState, type JSX } from "react";
import { Link, useParams } from "react-router";

import { EnterpriseNarrativePanel } from "@/components/enterprise-panels";
import { PublicTrustMessaging } from "@/components/public/PublicTrustMessaging";
import { Button } from "@/components/ui/button";
import { EntityRelationshipPanel } from "@/components/entity-relations";
import { verifyCertificate, type VerifiedCertificatePublic } from "@/lib/api-certificates";
import { EntityKind, buildPublicVerifyRelationships } from "@/lib/entity-relationships";
import { presentPublicVerificationStatus } from "@/lib/public-verification-status";
import { cn } from "@/lib/utils";

function formatDate(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  try {
    return new Date(iso).toLocaleString("bs-BA", {
      dateStyle: "long",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

type UiKind = "loading" | "invalid" | "not_found" | "success";

function normalizeStatus(s: string): "valid" | "expired" | "suspended" | "revoked" | "other" {
  const u = s.toUpperCase();
  if (u === "ACTIVE" || u === "VALID" || u === "VALIDAN") {
    return "valid";
  }
  if (u === "EXPIRED" || u === "ISTEKAO") {
    return "expired";
  }
  if (u === "SUSPENDED" || u === "SUSPENDIRAN") {
    return "suspended";
  }
  if (u === "REVOKED" || u === "REPLACED" || u === "WITHDRAWN") {
    return "revoked";
  }
  return "other";
}

export default function VerifyCertificate(): JSX.Element {
  const { verificationHash: rawParam } = useParams<{ verificationHash: string }>();
  const certificateId = rawParam ? decodeURIComponent(rawParam).trim() : "";
  const [checkTime] = useState(() =>
    new Date().toLocaleString("bs-BA", { dateStyle: "full", timeStyle: "medium" }),
  );
  const [toast, setToast] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["verifyCertificate", certificateId],
    queryFn: () => verifyCertificate(certificateId),
    enabled: certificateId.length > 0,
  });

  const copyHash = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(certificateId);
      setToast("Verifikacijski kod kopiran.");
      window.setTimeout(() => setToast(null), 2400);
    } catch {
      setToast("Kopiranje nije uspjelo.");
      window.setTimeout(() => setToast(null), 2400);
    }
  }, [certificateId]);

  const ui = useMemo((): { kind: UiKind; data?: VerifiedCertificatePublic } => {
    if (!certificateId) {
      return { kind: "invalid" };
    }
    if (query.isLoading || query.isFetching) {
      return { kind: "loading" };
    }
    if (query.isError) {
      return { kind: "invalid" };
    }
    const r = query.data;
    if (!r) {
      return { kind: "invalid" };
    }
    if (r.kind === "not_found") {
      return { kind: "not_found" };
    }
    if (r.kind === "error") {
      return { kind: "invalid" };
    }
    return { kind: "success", data: r.data };
  }, [certificateId, query.isLoading, query.isFetching, query.isError, query.data]);

  return (
    <div className="relative min-h-svh overflow-hidden bg-[#050608] text-text-primary">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <header className="relative border-b border-white/10 bg-black/40 px-4 py-5 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand/20 ring-1 ring-brand/35">
              <Shield className="h-6 w-6 text-brand" aria-hidden />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand/90">CONFORA</p>
              <p className="text-sm font-medium text-white/90">Registar dokumenata — javna provjera</p>
            </div>
          </div>
          <Link
            to="/login"
            className="text-xs text-text-muted underline-offset-4 hover:text-brand hover:underline"
          >
            Prijava za polaznike
          </Link>
        </div>
      </header>

      <section
        aria-labelledby="verify-certificate-heading"
        className="relative mx-auto max-w-3xl px-4 py-12 sm:px-8 sm:py-16"
      >
        <h1 id="verify-certificate-heading" className="sr-only">
          Javna provjera certifikata
        </h1>
        <div className="mb-8">
          <EnterpriseNarrativePanel
            title="Narativ javne provjere"
            body="Ova stranica potvrđuje prisutnost zapisa u registru za dati hash. To nije zamjena za formalni odgovor organizacije — koristite službene kanale za pravne ili accreditorske upite. Za trag u platformi prijavite se i otvorite knowledge ili governance module."
          />
        </div>
        {toast ? (
          <div
            className="fixed bottom-6 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-lg border border-emerald-500/40 bg-emerald-950/95 px-4 py-2 text-center text-sm text-emerald-50 shadow-lg"
            role="status"
          >
            {toast}
          </div>
        ) : null}

        {!certificateId ? (
          <div
            className="rounded-2xl border border-red-500/40 bg-red-950/50 p-8 text-center ring-1 ring-red-500/20"
            data-testid="verify-invalid-link"
          >
            <XCircle className="mx-auto h-14 w-14 text-red-400" aria-hidden />
            <h1 className="mt-4 text-xl font-bold text-red-100">Nevalidan link</h1>
            <p className="mt-2 text-sm text-red-200/90">
              Nedostaje verifikacijski hash. Kanon: <span className="font-mono">/verify/{"{64-hex hash}"}</span>
            </p>
          </div>
        ) : null}

        {certificateId && ui.kind === "loading" ? (
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-surface-secondary/30 px-8 py-20 text-center ring-1 ring-white/5"
            data-testid="verify-loading-state"
            aria-busy="true"
          >
            <Loader2 className="h-12 w-12 animate-spin text-brand" aria-hidden />
            <p className="max-w-sm text-sm text-text-secondary">
              Provjera u blockchain/bazi podataka…
            </p>
            <p className="text-xs text-text-muted">Molimo sačekaj trenutak.</p>
          </div>
        ) : null}

        {certificateId && ui.kind === "not_found" && !query.isLoading && !query.isFetching ? (
          <div
            className="rounded-2xl border-2 border-red-600/50 bg-gradient-to-b from-red-950/80 to-[#1a0808] p-8 text-center shadow-2xl ring-1 ring-red-500/30 sm:p-10"
            data-testid="verify-not-found-state"
          >
            <AlertTriangle className="mx-auto h-16 w-16 text-red-400" aria-hidden />
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-red-100">Nije pronađeno</h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-red-200/95">
              Hash nije u registru ili dokument nije dostupan za javnu provjeru. Za pomoć kontaktiraj organizatora.
            </p>
            <p className="mt-8 font-mono text-xs text-red-300/70">{certificateId}</p>
          </div>
        ) : null}

        {certificateId && ui.kind === "invalid" && !query.isLoading && !query.isFetching ? (
          <div className="rounded-2xl border-2 border-amber-600/45 bg-gradient-to-b from-amber-950/70 to-[#141008] p-8 text-center shadow-2xl ring-1 ring-amber-500/25 sm:p-10">
            <AlertTriangle className="mx-auto h-16 w-16 text-amber-300" aria-hidden />
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-amber-50">Provjera nije uspjela</h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-amber-100/90">
              Mrežna greška ili neočekivan odgovor. Pokušaj ponovo za nekoliko sekundi.
            </p>
          </div>
        ) : null}

        {certificateId && ui.kind === "success" && ui.data ? (
          <div data-testid="verify-result-panel">
            <SuccessCard
              data={ui.data}
              checkTime={checkTime}
              verificationHash={certificateId}
              onCopyHash={copyHash}
            />
          </div>
        ) : null}

        {certificateId && ui.kind === "success" ? (
          <div className="mt-8">
            <PublicTrustMessaging variant="verification" testId="verify-trust-messaging" />
          </div>
        ) : null}
      </section>

      <footer className="relative border-t border-white/10 px-4 py-6 text-center text-[11px] text-text-muted sm:px-8">
        © {new Date().getFullYear()} CONFORA — javna provjera potvrda o ispitu i certifikata osobe.
      </footer>
    </div>
  );
}

function SuccessCard({
  data,
  checkTime,
  verificationHash,
  onCopyHash,
}: {
  readonly data: VerifiedCertificatePublic;
  readonly checkTime: string;
  readonly verificationHash: string;
  readonly onCopyHash: () => void;
}) {
  const rawStatus = (data.effectiveStatus ?? data.status ?? "").trim();
  const statusPresentation = presentPublicVerificationStatus(rawStatus);
  const tier = normalizeStatus(rawStatus);
  const typeLine =
    (data.credentialTypeLabel && data.credentialTypeLabel.trim()) ||
    (data.certificateKind ? `Tip (strogi kod): ${data.certificateKind}` : null);
  const accent =
    tier === "valid"
      ? {
          border: "border-emerald-500/45",
          ring: "ring-emerald-500/25",
          bg: "from-emerald-950/50 to-[#071210]",
          icon: CheckCircle2,
          iconClass: "text-emerald-400",
          stamp: "VERIFIED",
          stampBg: "bg-emerald-600/90",
        }
    : tier === "expired"
      ? {
          border: "border-red-500/45",
          ring: "ring-red-500/25",
          bg: "from-red-950/50 to-[#140808]",
          icon: ShieldAlert,
          iconClass: "text-red-400",
          stamp: "ISTEKAO",
          stampBg: "bg-red-700/90",
        }
      : tier === "suspended"
        ? {
            border: "border-amber-500/45",
            ring: "ring-amber-500/25",
            bg: "from-amber-950/40 to-[#121008]",
            icon: AlertTriangle,
            iconClass: "text-amber-400",
            stamp: "SUSPENDIRAN",
            stampBg: "bg-amber-600/90",
          }
        : tier === "revoked"
          ? {
              border: "border-rose-500/45",
              ring: "ring-rose-500/25",
              bg: "from-rose-950/50 to-[#140810]",
              icon: ShieldAlert,
              iconClass: "text-rose-400",
              stamp: "NEAKTIVAN",
              stampBg: "bg-rose-700/90",
            }
          : {
              border: "border-slate-500/40",
              ring: "ring-slate-500/20",
              bg: "from-slate-900/60 to-[#0a0c10]",
              icon: ShieldCheck,
              iconClass: "text-slate-300",
              stamp: "POTVRĐENO",
              stampBg: "bg-slate-600/90",
            };

  const Icon = accent.icon;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 bg-gradient-to-b p-8 shadow-2xl ring-1 sm:p-10",
        accent.border,
        accent.ring,
        accent.bg,
      )}
    >
      <div className="absolute right-6 top-6 hidden sm:block">
        <div
          className={cn(
            "flex h-24 w-24 rotate-[-12deg] flex-col items-center justify-center rounded-full border-4 border-dashed border-white/25 text-center shadow-lg",
            accent.stampBg,
          )}
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-white">{accent.stamp}</span>
        </div>
      </div>

      <div className="relative flex flex-col items-center text-center sm:items-start sm:text-left">
        <Icon className={cn("h-14 w-14", accent.iconClass)} aria-hidden />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {tier === "valid" ? "Javna provjera u registru" : "Rezultat provjere u registru"}
        </h1>
        {typeLine ? (
          <p className="mt-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-left text-xs leading-snug text-white/85">
            <span className="font-semibold text-brand/95">Tip dokumenta: </span>
            {typeLine}
          </p>
        ) : null}
        {data.certificateKind ? (
          <p className="mt-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-left text-xs leading-snug text-amber-50">
            {data.certificateKind.includes("EXAM_PASS")
              ? "EXAM_PASS_CERTIFICATE potvrđuje položen ispit. To nije PERSON_CERTIFICATION po ISO/IEC 17024 shemi."
              : "PERSON_CERTIFICATION označava formalni certifikat osobe nakon odluke certifikacijskog komiteta."}
          </p>
        ) : null}
        {data.certificateKind && data.credentialTypeLabel ? (
          <p className="mt-1 text-[10px] font-mono text-white/45">Strogi kod tipa: {data.certificateKind}</p>
        ) : null}
        <p className="mt-2 text-sm text-white/70">
          Sljedeći podaci usklađeni su s CONFORA LMS registrom u trenutku provjere (ograničeni podaci, bez osetljivih
          stvari u linku).
        </p>
      </div>

      <dl className="relative mt-8 space-y-4 rounded-xl border border-white/10 bg-black/25 p-6 text-left backdrop-blur-sm">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/45">ID certifikata</dt>
          <dd className="mt-1 font-mono text-sm text-brand">{data.certificateId}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/45">Ime i prezime</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{data.fullName}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/45">Obuka</dt>
          <dd className="mt-1 text-text-primary">{data.courseName?.trim() || "—"}</dd>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/45">Datum izdavanja</dt>
            <dd className="mt-1 text-sm text-white/90">{formatDate(data.issueDate)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/45">Datum isteka</dt>
            <dd className="mt-1 text-sm text-white/90">{formatDate(data.expiryDate)}</dd>
          </div>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/45">Status u registru</dt>
          <dd className="mt-1 font-medium text-white/90" data-testid="verify-status-label">
            {statusPresentation.label}
            {rawStatus ? (
              <span className="ml-2 font-mono text-xs text-white/50">({rawStatus})</span>
            ) : null}
          </dd>
          <dd className="mt-1 text-xs text-white/60">{statusPresentation.description}</dd>
        </div>
      </dl>

      <div className="relative mt-8 flex flex-col gap-3 rounded-lg border border-white/10 bg-black/35 px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-white/55">
            <Clock className="h-4 w-4 shrink-0 text-brand/80" aria-hidden />
            <span>
              Digitalni trag provjere: <span className="font-mono text-white/80">{checkTime}</span>
            </span>
          </div>
          {tier === "valid" ? (
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/90">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Trust badge · VERIFIED
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-white/20 bg-black/40 text-white hover:bg-black/55"
            onClick={() => onCopyHash()}
          >
            <Copy className="mr-2 h-4 w-4" aria-hidden />
            Kopiraj verifikacijski kod
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-white/20 bg-black/40 text-white hover:bg-black/55"
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-4 w-4" aria-hidden />
            Štampaj
          </Button>
        </div>
        <p className="break-all font-mono text-[10px] text-white/40" title={verificationHash}>
          {verificationHash.slice(0, 24)}…{verificationHash.slice(-12)}
        </p>
      </div>

      <EntityRelationshipPanel
        title="Javna trust traceability"
        subtitle="Lanac povezanosti dokumenta i ove provjere bez novih API poziva."
        centerId={data.certificateId}
        centerType={EntityKind.CERTIFICATE}
        centerLabel={data.fullName}
        edges={buildPublicVerifyRelationships(data, verificationHash)}
        {...(data.certificateKind?.toUpperCase().includes("PERSON")
          ? {
              workflowMeta: {
                workflowType: "PERSON_CERTIFICATION",
                status:
                  rawStatus.toUpperCase() === "VALID" || rawStatus.toUpperCase() === "VALIDAN"
                    ? "ACTIVE"
                    : rawStatus.toUpperCase(),
                ...(data.credentialTypeLabel ? { resourceLabel: data.credentialTypeLabel } : {}),
              },
            }
          : {})}
        defaultCollapsed
      />
    </div>
  );
}
