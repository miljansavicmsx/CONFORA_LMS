/**
 * Sys admin — tehnički pregled (agregati, inspekcija učenja, trag verifikacija).
 * Poslovne odluke certifikacije ostaju u odvojenim ISO tokovima; ovdje je samo vidljivost.
 */

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Activity, BookOpen, Loader2, Shield } from "lucide-react";
import { useMemo, useState, type JSX } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnterpriseUnavailablePanel } from "@/components/error-experience";
import { PlatformGovernanceDashboard } from "@/components/platform-governance";
import { ReleaseReadinessDashboard } from "@/components/release-readiness";
import {
  fetchCertificateVerifications,
  fetchLearningInspection,
  fetchPlatformOverview,
} from "@/lib/api-admin-sys";
import { cn } from "@/lib/utils";

const OVERVIEW_KEY = ["admin", "sys", "platform-overview"] as const;

export default function SysAdminConsole(): JSX.Element {
  const [inspectUserId, setInspectUserId] = useState("");
  const [inspectSubmitted, setInspectSubmitted] = useState<string | null>(null);

  const overviewQ = useQuery({
    queryKey: OVERVIEW_KEY,
    queryFn: fetchPlatformOverview,
  });

  const inspectionQ = useQuery({
    queryKey: ["admin", "sys", "learning", inspectSubmitted ?? ""],
    queryFn: () => fetchLearningInspection(inspectSubmitted ?? ""),
    enabled: Boolean(inspectSubmitted?.trim()),
  });

  const verifQ = useInfiniteQuery({
    queryKey: ["admin", "sys", "verifications"] as const,
    queryFn: ({ pageParam }) =>
      fetchCertificateVerifications({
        limit: 30,
        ...(pageParam != null && pageParam !== "" ? { cursor: pageParam } : {}),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const flatVerif = useMemo(
    () => verifQ.data?.pages.flatMap((p) => [...p.items]) ?? [],
    [verifQ.data?.pages],
  );

  const ov = overviewQ.data;

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="border-b border-border/40 pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
                <Shield className="h-6 w-6 text-brand" aria-hidden />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">Sys admin konzola</h1>
                <p className="mt-1 max-w-3xl text-sm text-text-secondary">
                  Agregirani uzorci (ne potpuno brojanje), nadzirani pristup učenju po korisniku i trag javnih
                  verifikacija. Svaki poziv API-ja za pregled zapisuje se u audit log.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild type="button" variant="outline" size="sm" className="border-border/60">
                <Link to="/dashboard/admin/users">Registar</Link>
              </Button>
              <Button asChild type="button" variant="outline" size="sm" className="border-border/60">
                <Link to="/dashboard/admin/audit-logs">Audit log</Link>
              </Button>
              <Button asChild type="button" variant="outline" size="sm" className="border-border/60">
                <Link to="/dashboard/iso/applications">Cert. pipeline</Link>
              </Button>
              <Button asChild type="button" variant="outline" size="sm" className="border-border/60">
                <Link to="/dashboard/admin/committees">Odbori</Link>
              </Button>
            </div>
          </div>
        </header>

        <PlatformGovernanceDashboard />

        <ReleaseReadinessDashboard />

        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
            <Activity className="h-5 w-5 text-brand" aria-hidden />
            Pregled platforme (uzorak)
          </h2>
          {overviewQ.isLoading ? (
            <div className="flex items-center gap-2 text-text-secondary">
              <Loader2 className="h-5 w-5 animate-spin text-brand" />
              Učitavanje…
            </div>
          ) : overviewQ.isError ? (
            <EnterpriseUnavailablePanel
              title="Pregled platforme nije dostupan"
              message="API je vratio grešku ili nema ovlasti. Provjerite sesiju i pokušajte osvježiti stranicu."
            />
          ) : ov ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Aktivni upisi (uzorak)" value={String(ov.enrollmentsActive)} hint={`/ ${ov.enrollmentsTotalSampled}`} />
              <Stat label="Audit 24h (uzorak)" value={String(ov.auditEventsLast24hSampled)} />
              <Stat label="AI tutor (AI_TUTOR_SESSION) 24h" value={String(ov.aiTutorEventsLast24hSampled)} />
              <Stat label="Verifikacije 24h (uzorak)" value={String(ov.verificationEventsLast24hSampled)} />
              <Stat label="Heuristika osjetljivosti" value={String(ov.suspiciousAuditFlagsSampled)} warn={ov.suspiciousAuditFlagsSampled > 0} />
            </div>
          ) : null}
          {ov?.sampleLimits ? (
            <p className="text-xs text-text-muted">
              Limiti uzorka: {JSON.stringify(ov.sampleLimits)}
            </p>
          ) : null}
          {ov ? (
            <div className="grid gap-4 lg:grid-cols-3">
              <KeyValBox title="Prijave certifikacije (status)" data={ov.applicationsByStatus} />
              <KeyValBox title="Odluke (status)" data={ov.decisionsByStatus} />
              <KeyValBox title="Certifikati (vrsta)" data={ov.certificatesByKind} />
            </div>
          ) : null}
        </section>

        <section className="space-y-4 rounded-2xl border border-border/50 bg-surface-secondary/40 p-6 ring-1 ring-white/[0.04]">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
            <BookOpen className="h-5 w-5 text-brand" aria-hidden />
            Inspekcija učenja (po userId)
          </h2>
          <p className="text-sm text-text-secondary">
            Pristup podacima o napretku i certifikatima korisnika — podliježe audit zapisu. JMBG/ID u registru
            uređuje se samo kad je pravno opravdano; vidi polja u{' '}
            <Link className="text-brand underline" to="/dashboard/admin/users">
              registru
            </Link>
            .
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="inspect-uid">userId (sub)</Label>
              <Input
                id="inspect-uid"
                value={inspectUserId}
                onChange={(e) => setInspectUserId(e.target.value)}
                className="max-w-md border-border/60 bg-surface-primary font-mono text-sm"
                placeholder="uuid korisnika"
              />
            </div>
            <Button
              type="button"
              className="bg-brand text-white hover:bg-brand/90"
              disabled={!inspectUserId.trim() || inspectionQ.isFetching}
              onClick={() => setInspectSubmitted(inspectUserId.trim())}
            >
              {inspectionQ.isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Učitaj
            </Button>
          </div>
          {inspectionQ.isError ? (
            <p className="text-sm text-red-300">Učitavanje nije uspjelo.</p>
          ) : null}
          {inspectionQ.data ? (
            <div className="space-y-4">
              <JsonBlock title="Upisi" rows={inspectionQ.data.enrollmentRows} />
              <JsonBlock title="Napredak" rows={inspectionQ.data.learningProgressRows} />
              <JsonBlock title="Certifikati" rows={inspectionQ.data.certificateRows} />
              <JsonBlock title="Pokušaji ispita" rows={inspectionQ.data.examAttemptRows} />
              <JsonBlock title="Kvizovi (uzorak)" rows={inspectionQ.data.quizAttemptRows} />
            </div>
          ) : null}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Trag verifikacija certifikata</h2>
          <p className="text-sm text-text-secondary">
            Zapisi iz tablice verifikacija (javni verify endpoint). Vrijednosti su skraćene u API-ju.
          </p>
          {verifQ.isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          ) : (
            <ul className="space-y-2">
              {flatVerif.map((v) => (
                <li
                  key={v.verificationId}
                  className="rounded-xl border border-border/50 bg-surface-secondary/50 px-4 py-3 text-sm"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-mono text-xs text-brand">{v.verificationId}</span>
                    <span className="text-xs text-text-muted">{v.createdAt}</span>
                  </div>
                  <p className="mt-1 text-text-secondary">
                    {v.method} · <span className="font-medium text-text-primary">{v.result}</span>
                    {v.certificateId ? (
                      <>
                        {" "}
                        · cert: <span className="font-mono text-xs">{v.certificateId}</span>
                      </>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    IP: {v.ipRedacted ?? "—"} · ref: {v.verificationValueRedacted}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {verifQ.hasNextPage ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={verifQ.isFetchingNextPage}
              onClick={() => verifQ.fetchNextPage()}
            >
              {verifQ.isFetchingNextPage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Učitaj još
            </Button>
          ) : null}
        </section>

        <footer className="border-t border-border/40 pt-6 text-xs text-text-muted">
          <p>
            AI audit: u{' '}
            <Link className="text-brand underline" to="/dashboard/admin/audit-logs">
              audit logu
            </Link>{' '}
            postavi filter entiteta <code className="rounded bg-black/30 px-1">AI_TUTOR_SESSION</code> (akcija{' '}
            <code className="rounded bg-black/30 px-1">AI_TUTOR_CHAT</code>).
          </p>
        </footer>
      </div>
    </div>
  );
}

function Stat(props: { readonly label: string; readonly value: string; readonly hint?: string; readonly warn?: boolean }): JSX.Element {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        props.warn ? "border-amber-500/35 bg-amber-500/10" : "border-border/50 bg-surface-secondary/40",
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{props.label}</p>
      <p className="mt-1 text-2xl font-semibold text-text-primary">
        {props.value}
        {props.hint ? <span className="ml-1 text-sm font-normal text-text-muted">{props.hint}</span> : null}
      </p>
    </div>
  );
}

function KeyValBox(props: { readonly title: string; readonly data: Record<string, number> }): JSX.Element {
  const entries = Object.entries(props.data);
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/50 p-4 text-sm text-text-muted">
        {props.title}: nema podataka u uzorku.
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border/50 bg-surface-secondary/35 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{props.title}</p>
      <ul className="mt-2 space-y-1 text-sm text-text-secondary">
        {entries.map(([k, v]) => (
          <li key={k} className="flex justify-between gap-2">
            <span className="font-mono text-xs text-text-primary">{k}</span>
            <span>{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function JsonBlock(props: { readonly title: string; readonly rows: readonly Record<string, unknown>[] }): JSX.Element {
  if (props.rows.length === 0) {
    return (
      <div>
        <p className="text-sm font-medium text-text-primary">{props.title}</p>
        <p className="text-xs text-text-muted">Prazno.</p>
      </div>
    );
  }
  return (
    <details className="rounded-xl border border-border/50 bg-black/20">
      <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand">
        {props.title}{" "}
        <span className="text-text-muted">({props.rows.length})</span>
        <span className="sr-only"> — pritisnite za proširivanje JSON detalja</span>
      </summary>
      <pre className="max-h-64 overflow-auto p-4 font-mono text-[10px] text-text-muted">
        {JSON.stringify(props.rows, null, 2)}
      </pre>
    </details>
  );
}
