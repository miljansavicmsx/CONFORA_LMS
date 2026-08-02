import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardCheck,
  FileEdit,
  Loader2,
  Scale,
  Settings2,
} from "lucide-react";
import { type JSX, useMemo, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  activateCertificationScheme,
  archiveCertificationScheme,
  fetchCertificationScheme,
  type CertificationSchemeOut,
  type CertificationSchemeStatusApi,
} from "@/lib/api-certification-schemes";
import {
  canArchiveCertificationScheme,
  isSysAdminReadOnlyOnSchemes,
  showActivateAction,
  showApproveAction,
  showEditForm,
  showSubmitReviewAction,
} from "@/lib/certification-schemes-ui-access";
import { formatApiErrorMessage } from "@/lib/format-api-error";
import type { DashboardOutletContext } from "@/pages/dashboard/dashboard-outlet-context";

const detailKey = (id: string) => ["certification-scheme", id] as const;

function badgeFor(st: CertificationSchemeStatusApi): string {
  const u = String(st).toUpperCase();
  if (u === "ACTIVE") return "border-emerald-500/45 bg-emerald-500/12 text-emerald-100";
  if (u === "APPROVED") return "border-sky-500/40 bg-sky-500/10 text-sky-100";
  if (u === "REVIEW") return "border-amber-500/40 bg-amber-500/12 text-amber-100";
  if (u === "DRAFT") return "border-border/55 bg-surface-primary/60 text-text-secondary";
  return "border-border/45 bg-surface-secondary/50 text-text-muted";
}

export default function CertificationSchemeDetailPage(): JSX.Element {
  const { schemeId = "" } = useParams<{ schemeId: string }>();
  const id = schemeId.trim();
  const { user } = useOutletContext<DashboardOutletContext>();
  const qc = useQueryClient();
  const [archiveReason, setArchiveReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const q = useQuery({
    queryKey: detailKey(id),
    enabled: Boolean(id),
    queryFn: () => fetchCertificationScheme(id),
  });

  const role = user.role;

  const actMut = useMutation({
    mutationFn: () => activateCertificationScheme(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: detailKey(id) });
      await qc.invalidateQueries({ queryKey: ["certification-schemes"] });
      setMsg(null);
    },
    onError: (e) => setMsg(formatApiErrorMessage(e)),
  });

  const archMut = useMutation({
    mutationFn: () =>
      archiveCertificationScheme(id, archiveReason.trim() ? { reason: archiveReason.trim() } : {}),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: detailKey(id) });
      await qc.invalidateQueries({ queryKey: ["certification-schemes"] });
      setMsg(null);
    },
    onError: (e) => setMsg(formatApiErrorMessage(e)),
  });

  const s: CertificationSchemeOut | undefined = q.data;

  const readOnlySa = useMemo(() => isSysAdminReadOnlyOnSchemes(role), [role]);

  const canAct = Boolean(s && showActivateAction(role, s.status));
  const canArch = Boolean(s && canArchiveCertificationScheme(role) && s.status !== "ARCHIVED");
  const navEdit = Boolean(s && showEditForm(role, s.status));
  const navReview = Boolean(s && showSubmitReviewAction(role, s.status));
  const navApprove = Boolean(s && showApproveAction(role, s.status));

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-text-muted">
        <Link className="text-brand hover:underline" to="..">
          Registar šema
        </Link>
        <span aria-hidden>/</span>
        <span className="font-mono text-text-secondary">{id || "…"}</span>
      </div>

      {q.isLoading ? (
        <div className="flex items-center gap-2 py-16 text-text-secondary">
          <Loader2 className="h-6 w-6 animate-spin text-brand" aria-hidden />
          Učitavanje detalja…
        </div>
      ) : null}

      {q.isError ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {formatApiErrorMessage(q.error)}
        </p>
      ) : null}

      {msg ? (
        <p className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">{msg}</p>
      ) : null}

      {s ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4 rounded-2xl border border-border/45 bg-surface-secondary/30 p-5 ring-1 ring-white/[0.03] md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">Dokument sheme</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">{s.title ?? s.name}</h2>
                <p className="mt-1 font-mono text-xs text-text-secondary">
                  schemeId <span className="text-brand/90">{s.schemeId}</span>
                </p>
              </div>
              <Badge variant="outline" className={badgeFor(s.status)}>
                {s.status}
              </Badge>
            </div>

            <dl className="grid gap-3 border-y border-border/35 py-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Šifra & verzija</dt>
                <dd className="mt-1 font-mono text-text-primary">
                  {s.schemeCode ?? s.code} <span className="text-text-muted">v{s.version}</span>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Certifikacijska razina</dt>
                <dd className="mt-1 text-text-secondary">{s.level?.trim() || "—"}</dd>
              </div>
              {s.createdByUserId ? (
                <div className="sm:col-span-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Autor (owner user)</dt>
                  <dd className="mt-1 font-mono text-xs text-text-secondary">{s.createdByUserId}</dd>
                </div>
              ) : null}
              {s.approvedBy ? (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Formalno odobrio</dt>
                  <dd className="mt-1 font-mono text-xs text-text-secondary">{s.approvedBy}</dd>
                </div>
              ) : null}
              {s.activatedBy ? (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Aktivirano od</dt>
                  <dd className="mt-1 font-mono text-xs text-text-secondary">{s.activatedBy}</dd>
                </div>
              ) : null}
            </dl>

            {s.description ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Sažetak</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{s.description}</p>
              </div>
            ) : (
              <p className="text-sm text-text-muted">Bez dodatnog sažetka u dokumentu.</p>
            )}

            {s.scope?.trim() ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Opseg (ISO scope)</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{s.scope}</p>
              </div>
            ) : null}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border/45 bg-surface-primary/30 p-4 ring-1 ring-white/[0.03]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                Lifecycle & radni tokovi
              </p>
              <nav className="mt-4 flex flex-col gap-2">
                {navEdit ? (
                  <Link
                    to="edit"
                    className="flex items-center gap-2 rounded-lg border border-border/40 px-3 py-2 text-sm text-text-primary hover:bg-surface-secondary/40"
                  >
                    <FileEdit className="h-4 w-4 text-brand" aria-hidden /> Uredi sadržaj (nacrt/review)
                  </Link>
                ) : (
                  <p className="text-[11px] text-text-muted">Uređivanje sadržaja: dostupno admin ili quality_manager u DRAFT/REVIEW.</p>
                )}
                {navReview ? (
                  <Link
                    to="review"
                    className="flex items-center gap-2 rounded-lg border border-border/40 px-3 py-2 text-sm text-text-primary hover:bg-surface-secondary/40"
                  >
                    <ClipboardCheck className="h-4 w-4 text-brand" aria-hidden /> Slanje na formalni pregled
                  </Link>
                ) : (
                  <p className="text-[11px] text-text-muted">Prijenos u REVIEW dostupan iz DRAFT uz ulogu nacrta.</p>
                )}
                {navApprove ? (
                  <Link
                    to="approve"
                    className="flex items-center gap-2 rounded-lg border border-border/40 px-3 py-2 text-sm text-text-primary hover:bg-surface-secondary/40"
                  >
                    <Scale className="h-4 w-4 text-brand" aria-hidden /> Odluka odbora na pregledanom dokumentu
                  </Link>
                ) : (
                  <p className="text-[11px] text-text-muted">
                    Formalni čin odobrenja (REVIEW → APPROVED) vidljiv je članici certifikacijskog odbora.
                  </p>
                )}
              </nav>
              {readOnlySa ? (
                <p className="mt-3 text-[11px] leading-relaxed text-amber-200/85">
                  Uloga sys_admin ima pregled; poslovno odobrenje i aktivacija su blokirani u API-ju.
                </p>
              ) : null}
            </div>

            {!readOnlySa ? (
              <div className="rounded-2xl border border-border/45 bg-surface-primary/30 p-4">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                  <Settings2 className="h-3.5 w-3.5" aria-hidden /> Operacije nakon formalnog životnog ciklusa
                </p>

                <div className="mt-3 space-y-3">
                  {canAct ? (
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      disabled={actMut.isPending}
                      onClick={() => void actMut.mutate()}
                    >
                      {actMut.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Aktivacija…
                        </>
                      ) : (
                        "Aktiviraj (APPROVED → ACTIVE)"
                      )}
                    </Button>
                  ) : null}

                  {canArch ? (
                    <div className="space-y-2 border-t border-border/35 pt-3">
                      <label className="block text-[11px] font-medium uppercase tracking-wide text-text-muted">
                        Trajna arhiva (samo direktor / top_management)
                      </label>
                      <textarea
                        value={archiveReason}
                        onChange={(ev) => setArchiveReason(ev.target.value)}
                        rows={3}
                        placeholder="Razlog (opcionalno za audit zapis)"
                        className="w-full rounded-lg border border-border/50 bg-surface-secondary/45 px-2 py-1.5 text-xs text-text-primary"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        disabled={archMut.isPending}
                        onClick={() => {
                          void archMut.mutate();
                        }}
                      >
                        {archMut.isPending ? "Arhiva…" : "Arhiviraj"}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
    </section>
  );
}
