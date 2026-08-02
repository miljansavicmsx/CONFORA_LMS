/**
 * Formalni tijek odluka — pregled stanja COI/kvorum (certifikacijski odbor).
 */

import { useQuery } from "@tanstack/react-query";
import { Gavel, Loader2 } from "lucide-react";
import { useMemo, type JSX } from "react";
import { Link } from "react-router";

import { ContextRibbon } from "@/components/information-disclosure";
import { Badge } from "@/components/ui/badge";
import {
  decisionStatusLabelHr,
  fetchCertificationDecisions,
  type CertificationDecisionItem,
} from "@/lib/api-certification-decisions";
import { IA_RIBBON_KNOWLEDGE_HUB } from "@/lib/workspace-continuity";
import { IsoPageShell } from "@/pages/iso/IsoPageShell";

const QUERY_KEY = ["certification-decisions", "list"] as const;

export default function CertificationDecisionsIsoPage(): JSX.Element {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => fetchCertificationDecisions(),
  });

  const grouped = useMemo(() => {
    const active: CertificationDecisionItem[] = [];
    const finalized: CertificationDecisionItem[] = [];
    const rejected: CertificationDecisionItem[] = [];
    const appealed: CertificationDecisionItem[] = [];
    for (const row of data) {
      const s = row.status.toUpperCase();
      if (s === "REJECTED" && row.appealEligible) {
        appealed.push(row);
      } else if (s === "REJECTED") {
        rejected.push(row);
      } else if (s === "APPROVED" || s === "VOIDED") {
        finalized.push(row);
      } else {
        active.push(row);
      }
    }
    return { active, finalized, rejected, appealed };
  }, [data]);

  return (
    <IsoPageShell
      icon={Gavel}
      title="Odluke o certifikaciji"
      description="Formalni zapis odbora: kvorum, COI i status odluke. Akcije (pregled, odobrenje, odbij…) koriste Certification decisions API — ovaj pregled je read-only sažetak."
    >
      <ContextRibbon title="IA trag — odluke ↔ znanje i tragivost" items={IA_RIBBON_KNOWLEDGE_HUB} />
      <section className="rounded-2xl border border-border/50 bg-surface-secondary/35 p-4 ring-1 ring-white/[0.04] md:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Aktivne i završene odluke</h2>
        <p className="mt-1 text-xs text-text-secondary">
          Stručne odluke (COI, odobrenje, odbijanje) obrađuje isključivo certifikacijski komitet (uloga cert_committee);
          pregled ima direktor, admin ili sys_admin; žalbena komisija samo uz evidentiranu žalbu.
        </p>

        {isLoading ? (
          <div className="mt-8 flex items-center justify-center gap-2 text-text-secondary">
            <Loader2 className="h-6 w-6 animate-spin text-brand" aria-hidden />
            Učitavanje…
          </div>
        ) : null}
        {isError ? (
          <p className="mt-6 text-sm text-red-400">Podaci nisu dostupni (potrebna prijava ili ovlast).</p>
        ) : null}

        {!isLoading && !isError && data.length === 0 ? (
          <p className="mt-6 text-sm text-text-secondary">Nema evidencije o formalnim odlukama.</p>
        ) : null}

        {!isLoading && data.length > 0 ? (
          <div className="mt-6 space-y-8">
            {(
              [
                ["Aktivne", grouped.active],
                ["Završene (odobrene / poništene)", grouped.finalized],
                ["Odbijene", grouped.rejected],
                ["Žalbe — dopuštena žalba", grouped.appealed],
              ] as const
            ).map(([title, items]) =>
              items.length ? (
                <div key={title}>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h3>
                  <ul className="mt-3 divide-y divide-border/40 rounded-xl border border-border/40">
                    {items.map((row: CertificationDecisionItem) => (
              <li key={row.decisionId} className="flex flex-col gap-2 px-4 py-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="font-mono text-xs text-text-muted">{row.decisionId}</p>
                  <p className="text-sm text-text-secondary">
                    Prijava <span className="font-medium text-text-primary">{row.applicationId.slice(0, 8)}…</span>
                    {" · "}Kurs <span className="font-medium text-text-primary">{row.courseId}</span>
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="outline" className="border-brand/35 font-medium text-brand">
                      {decisionStatusLabelHr(row.status)}
                    </Badge>
                    {row.certificateId ? (
                      <Badge variant="outline" className="text-xs">
                        Certifikat: {row.certificateId.slice(0, 10)}…
                      </Badge>
                    ) : null}
                  {row.approvedCertificationLevel ? (
                    <span className="text-xs text-text-muted">Razina: {row.approvedCertificationLevel}</span>
                  ) : null}
                  <p className="pt-1">
                    <Link
                      to={`/dashboard/committee/formal-decisions/${encodeURIComponent(row.decisionId)}`}
                      className="text-xs font-medium text-brand hover:underline"
                    >
                      Formalni pregled odluke →
                    </Link>
                  </p>
                  </div>
                </div>
                <div className="shrink-0 text-xs text-text-muted md:text-right">
                  <p>COI: {row.coiComplete ? "potpuno" : "nedovršeno"}</p>
                  <p>Kvorum: {row.quorumMet ? "da" : "ne"}</p>
                  {row.appealEligible ? <p className="text-amber-200/90">Žalba dopuštena</p> : null}
                </div>
              </li>
                    ))}
                  </ul>
                </div>
              ) : null
            )}
          </div>
        ) : null}
      </section>
    </IsoPageShell>
  );
}
