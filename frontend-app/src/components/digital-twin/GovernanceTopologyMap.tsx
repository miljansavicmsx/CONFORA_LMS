import { Network } from "lucide-react";
import { Suspense, lazy, type JSX, useMemo } from "react";

import type { DigitalTwinBundle } from "@/lib/digital-twin";
import { topologyStressHint } from "@/lib/digital-twin";

import { AccreditationEvidencePanel } from "./AccreditationEvidencePanel";
import { AccreditationReadinessPanel } from "./AccreditationReadinessPanel";
import { CommitteeCapacityPanel } from "./CommitteeCapacityPanel";
import { GovernanceExposurePanel } from "./GovernanceExposurePanel";
import { GovernanceMaturityPanel } from "./GovernanceMaturityPanel";
import { OperationalResilienceMap } from "./OperationalResilienceMap";
import { OrganizationalResiliencePanel } from "./OrganizationalResiliencePanel";

const CommitteeDependencyGraph = lazy(async () => {
  const m = await import("./CommitteeDependencyGraph");
  return { default: m.CommitteeDependencyGraph };
});

function GraphFallback(): JSX.Element {
  return (
    <div
      className="flex min-h-[200px] items-center justify-center rounded-2xl border border-border/40 bg-surface-secondary/30 text-sm text-text-secondary"
      role="status"
      aria-live="polite"
    >
      Učitavanje topologijskog grafa…
    </div>
  );
}

export function GovernanceTopologyMap({
  bundle,
  governanceDocumentCount,
}: {
  readonly bundle: DigitalTwinBundle;
  readonly governanceDocumentCount: number;
}): JSX.Element {
  const { topology, accreditation, maturity, resilience, capacity, exposure, insights, health } = bundle;

  const twinSummary = useMemo(() => {
    const stress = topologyStressHint(bundle.input);
    return `${health.summary} ${stress} Uvid: ${insights
      .slice(0, 2)
      .map((i) => i.title)
      .join("; ")}.`;
  }, [bundle.input, health.summary, insights]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border/35 pb-6">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/30">
            <Network className="h-6 w-6 text-brand" aria-hidden />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary">Digital twin certifikacionog tijela</h2>
            <p className="mt-1 max-w-3xl text-sm text-text-secondary">
              Topologija uloga, akreditacijska spremnost i otpornost — inferencija na frontendu iz dashboard konteksta i
              directory odbora (bez teškog graph backenda).
            </p>
            <p className="sr-only">{twinSummary}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/45 bg-surface-secondary/50 px-4 py-3 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Twin health</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">{health.score}</p>
          <p className="text-xs capitalize text-text-secondary">{health.band}</p>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<GraphFallback />}>
            <CommitteeDependencyGraph nodes={topology.nodes} edges={topology.edges} />
          </Suspense>
          <section aria-label="Digital twin uvidi" className="mt-4 rounded-2xl border border-border/40 bg-surface-secondary/30 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Insights</p>
            <ul className="mt-2 space-y-2 text-sm">
              {insights.map((i) => (
                <li
                  key={i.id}
                  className={
                    i.tone === "concern"
                      ? "text-amber-100"
                      : i.tone === "positive"
                        ? "text-emerald-100"
                        : "text-text-secondary"
                  }
                >
                  <span className="font-medium text-text-primary">{i.title}</span> — {i.body}
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className="space-y-4">
          <GovernanceMaturityPanel maturity={maturity} />
          <OperationalResilienceMap signals={resilience.signals} />
          <AccreditationEvidencePanel pillars={accreditation.pillars} documentCount={governanceDocumentCount} />
        </div>
      </div>

      <AccreditationReadinessPanel pillars={accreditation.pillars} aggregateStatus={accreditation.aggregateStatus} />

      <div className="grid gap-4 xl:grid-cols-2">
        <OrganizationalResiliencePanel signals={resilience.signals} aggregateSeverity={resilience.aggregateSeverity} />
        <GovernanceExposurePanel slices={exposure} />
      </div>

      <CommitteeCapacityPanel rows={capacity} />

      <section aria-label="Eskalacijski putovi" className="rounded-2xl border border-border/40 bg-surface-secondary/30 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Escalation paths</p>
        <ul className="mt-2 space-y-2 text-xs text-text-secondary">
          {topology.escalations.map((e) => (
            <li key={e.id}>
              <span className="font-medium text-text-primary">{e.id}</span>: {e.steps.join(" → ")} — {e.context}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
