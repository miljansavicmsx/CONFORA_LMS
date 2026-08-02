/**
 * ISO 17024 — pregled recertifikacijskih prijava (staff dashboard).
 */

import { useQuery } from "@tanstack/react-query";
import { Loader2, Shield } from "lucide-react";
import { type JSX, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchAdminRecertifications, type RecertificationItem } from "@/lib/api-recertification";

const QK = ["admin", "recertifications"] as const;

export default function AdminRecertificationPage(): JSX.Element {
  const [sel, setSel] = useState<RecertificationItem | null>(null);

  const q = useQuery({
    queryKey: QK,
    queryFn: () => fetchAdminRecertifications(),
  });

  const rows = Array.isArray(q.data) ? q.data : [];

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <header className="mb-8 flex flex-col gap-2 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
            <Shield className="h-6 w-6 text-brand" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Recertifikacije</h1>
            <p className="mt-1 max-w-3xl text-sm text-text-secondary">
              Lista zahtjeva: pregled dokaza koristi <code className="text-xs">POST /review</code>, konačna odluka odbora{" "}
              <code className="text-xs">POST /decision</code>, zatim izdavanje obnove{" "}
              <code className="text-xs">POST /issue-renewal</code>. <strong>sys_admin</strong> ima read‑only pogled ako
              uloga nema certifikacijski dashboard; poslovni koraci blokiraju se SoD praviliima u API‑ju.
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void q.refetch()} disabled={q.isFetching}>
          {q.isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Osvježi
        </Button>
      </header>

      {q.isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center gap-2 text-text-secondary">
          <Loader2 className="h-8 w-8 animate-spin text-brand" /> Učitavanje…
        </div>
      ) : null}

      {q.isError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
          Nedovoljne ovlasti ili greška API‑ja. Potreban je pristup certifikacijskom dashboardu.
        </div>
      ) : null}

      {!q.isLoading && !q.isError ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-surface-secondary/40 shadow-sm ring-1 ring-white/[0.04]">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-secondary/80 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-4 py-3">ID prijave</th>
                  <th className="px-4 py-3">Certifikat</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 bg-surface-primary/35">
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-text-secondary" colSpan={3}>
                      Nema prijava za recertifikaciju.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr
                      key={r.recertificationApplicationId}
                      className={`cursor-pointer transition-colors hover:bg-surface-secondary/55 ${
                        sel?.recertificationApplicationId === r.recertificationApplicationId ? "bg-brand/10" : ""
                      }`}
                      onClick={() => setSel(r)}
                    >
                      <td className="max-w-[200px] truncate px-4 py-2 font-mono text-xs">{r.recertificationApplicationId}</td>
                      <td className="max-w-[200px] truncate px-4 py-2 font-mono text-xs">{r.certificateId}</td>
                      <td className="px-4 py-2">
                        <Badge variant="outline" className="text-[11px]">
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-border/50 bg-surface-secondary/40 p-6 ring-1 ring-white/[0.04]">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Panel za odluku</p>
            {sel ? (
              <>
                <p className="mt-4 text-lg font-semibold text-text-primary">Prijava {sel.recertificationApplicationId}</p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-2 border-b border-border/35 pb-2">
                    <dt className="text-text-muted">Kandidat</dt>
                    <dd className="font-mono text-xs text-text-primary">{sel.userId}</dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-border/35 pb-2">
                    <dt className="text-text-muted">Certifikat</dt>
                    <dd className="font-mono text-xs text-text-primary">{sel.certificateId}</dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-border/35 pb-2">
                    <dt className="text-text-muted">Status</dt>
                    <dd>
                      <Badge variant="outline">{sel.status}</Badge>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-text-muted">Due (shema)</dt>
                    <dd className="text-right text-text-primary">{sel.recertificationDueAt || "—"}</dd>
                  </div>
                </dl>
                <p className="mt-6 text-xs leading-relaxed text-text-muted">
                  Akcije (review / decision / issue) izvode se kroz API ili integrisani workflow — UI ovdje služi kao read‑only
                  pregled za brzi operativni uvid; za SoD greške (409) provjerite odgovor tijela.
                </p>
              </>
            ) : (
              <p className="mt-6 text-sm text-text-secondary">Odaberite red u listi.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
