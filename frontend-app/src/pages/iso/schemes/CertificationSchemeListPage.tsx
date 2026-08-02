import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Loader2, ScrollText } from "lucide-react";
import { type JSX } from "react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchCertificationSchemes, type CertificationSchemeOut, type CertificationSchemeStatusApi } from "@/lib/api-certification-schemes";

const QK = ["certification-schemes"] as const;

function statusBadge(st: CertificationSchemeStatusApi): string {
  const u = String(st).toUpperCase();
  if (u === "ACTIVE") return "border-emerald-500/45 bg-emerald-500/12 text-emerald-100";
  if (u === "APPROVED") return "border-sky-500/40 bg-sky-500/10 text-sky-100";
  if (u === "REVIEW") return "border-amber-500/40 bg-amber-500/12 text-amber-100";
  if (u === "DRAFT") return "border-border/55 bg-surface-primary/60 text-text-secondary";
  if (u === "ARCHIVED") return "border-muted-foreground/40 bg-surface-primary/40 text-text-muted";
  return "border-border/45 bg-surface-secondary/50 text-text-secondary";
}

export default function CertificationSchemeListPage(): JSX.Element {
  const query = useQuery({ queryKey: QK, queryFn: () => fetchCertificationSchemes() });

  const items: CertificationSchemeOut[] = query.data ?? [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="rounded-xl border border-border/40 bg-surface-secondary/25 px-4 py-3 md:px-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Registar dokumenata šema</h2>
          <p className="mt-1 font-mono text-xs text-text-secondary">
            API: GET /api/certification-schemes • poslovna pravila enforced u backend guardovima i SoD sloju
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0 border-border/55">
          <Link to="new">Nova shema</Link>
        </Button>
      </div>

      {query.isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-text-secondary">
          <Loader2 className="h-6 w-6 animate-spin text-brand" aria-hidden />
          Učitavanje registra…
        </div>
      ) : null}

      {query.isError ? (
        <p className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          Pristup registru odbijen ili servis nije dostupan. Potrebne su ovlasti pregleda shema (ISO uloga iz profila).
        </p>
      ) : null}

      {!query.isLoading && items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/55 bg-surface-secondary/20 p-10 text-center">
          <ScrollText className="mx-auto mb-3 h-10 w-10 text-text-muted opacity-70" aria-hidden />
          <p className="text-sm text-text-secondary">Nema registriranih šema u tenantu.</p>
          <Button asChild className="mt-6" size="sm">
            <Link to="new">Kreiraj prvu shemu</Link>
          </Button>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border/45 ring-1 ring-white/[0.03]">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="bg-surface-primary/45 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-4 py-3">Šifra</th>
                <th className="px-4 py-3">Naslov</th>
                <th className="px-4 py-3">Ver.</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Detalj</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => {
                const title = s.title ?? s.name;
                const code = s.schemeCode ?? s.code;
                return (
                  <tr key={s.schemeId} className="border-t border-border/35 hover:bg-surface-primary/25">
                    <td className="px-4 py-3 font-mono text-xs text-text-primary">{code}</td>
                    <td className="px-4 py-3 text-text-secondary">{title}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text-muted">{s.version}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={statusBadge(s.status)}>
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={s.schemeId}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                      >
                        Otvori
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
