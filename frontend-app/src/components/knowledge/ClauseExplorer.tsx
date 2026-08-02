import { Link } from "react-router";
import type { JSX } from "react";

import { EnterpriseNarrativePanel } from "@/components/enterprise-panels";
import { EnterpriseEmptyState } from "@/design-system";
import { ScrollText } from "lucide-react";
import type { AuditReadinessBundle } from "@/lib/audit-readiness";
import { formatAuditReadinessBandHr, formatAuditReadinessScoreNarration } from "@/lib/audit-readiness";
import type { KnowledgeInsight, KnowledgeRegistryClause } from "@/lib/knowledge/knowledge-types";
import type { TwinNormalizedInput } from "@/lib/digital-twin/twin-types";

import { KnowledgeConfidenceIndicator } from "./KnowledgeConfidenceIndicator";

export function ClauseExplorer({
  clauses,
  selectedId,
  snapshot,
  insights,
  readiness,
}: {
  readonly clauses: readonly KnowledgeRegistryClause[];
  readonly selectedId: string;
  readonly snapshot: TwinNormalizedInput;
  readonly insights: readonly KnowledgeInsight[];
  readonly readiness: AuditReadinessBundle;
}): JSX.Element {
  const selected = selectedId ? clauses.find((x) => x.id === selectedId) : undefined;
  const readinessNarration = formatAuditReadinessScoreNarration(readiness);
  const bandHr = formatAuditReadinessBandHr(readiness.band);

  return (
    <section className="space-y-3" aria-labelledby="clause-explorer-heading">
      <EnterpriseNarrativePanel
        title="Clause explorer — kako čitati hijerarhiju"
        body="Prvo readiness i kontekst pritiska, zatim lista klauzula i detalj odabira. Nema automatskih odluka: navigacija je informacijski orkestracija za audita i upravljanje tragovima."
      />
      <h2 id="clause-explorer-heading" className="text-sm font-semibold text-text-primary">
        Registry klauzula
      </h2>
      <a
        href="#clause-detail-skip"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:inline-block focus:rounded-md focus:bg-brand focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Preskoči na detalje odabrane klauzule
      </a>
      <div className="rounded-xl border border-border/50 bg-surface-secondary/25 p-3 text-xs text-text-secondary">
        <p id="clause-explorer-readiness-live" aria-live="polite">
          <strong className="text-text-primary">{readinessNarration}</strong>
        </p>
        <p className="mt-1">{bandHr}</p>
        <p className="mt-1">
          Pritisak: CAPA preko roka {snapshot.capaOverdue}, pritužbe {snapshot.openComplaints}.
        </p>
        {insights[0] ? (
          <p className="mt-2">
            <strong className="text-text-primary">Insight:</strong> {insights[0].title}
          </p>
        ) : null}
      </div>
      <div
        className="max-h-[420px] overflow-y-auto rounded-xl border border-border/50 bg-surface-primary/20"
        aria-label="Lista registry klauzula"
      >
        {clauses.length === 0 ? (
          <EnterpriseEmptyState
            icon={ScrollText}
            title="Nema klauzula u registryju"
            description="Provjerite build registry modula."
          />
        ) : (
          <ul className="divide-y divide-border/40">
            {clauses.slice(0, 80).map((c) => {
              const active = c.id === selectedId;
              return (
                <li key={c.id}>
                  <Link
                    to={`/dashboard/knowledge?clause=${encodeURIComponent(c.id)}`}
                    className={
                      active
                        ? "flex flex-col gap-1 bg-brand/10 px-3 py-3 text-sm outline-none ring-2 ring-brand/40"
                        : "flex flex-col gap-1 px-3 py-3 text-sm outline-none hover:bg-surface-secondary/40 focus-visible:ring-2 focus-visible:ring-brand"
                    }
                    aria-current={active ? "true" : undefined}
                  >
                    <span className="font-semibold text-brand">{c.clauseRef}</span>
                    <span className="text-text-secondary">{c.title}</span>
                    <span className="text-[11px] uppercase tracking-wide text-text-muted">{c.standardId}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {selected ? (
        <div id="clause-detail-skip" className="rounded-xl border border-brand/30 bg-brand/5 p-4" tabIndex={-1}>
          <h3 className="text-xs font-semibold uppercase text-text-muted">Odabrana klauzula</h3>
          <div className="mt-2 space-y-2 text-sm">
            <p className="font-semibold text-text-primary">
              {selected.clauseRef} — {selected.title}
            </p>
            <p className="text-text-secondary">{selected.summary}</p>
            <KnowledgeConfidenceIndicator facet={selected.facets[0] ?? "general"} snapshot={snapshot} clause={selected} />
            <p className="text-xs text-text-muted">Povezani rizici: {selected.relatedRisks.join(", ") || "—"}</p>
            <p className="text-xs text-text-muted">CAPA okidači: {selected.capaTriggers.join("; ") || "—"}</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-text-muted">Odaberite klauzulu ili koristite command center (clause:).</p>
      )}
    </section>
  );
}
