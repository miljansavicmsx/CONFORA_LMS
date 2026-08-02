import { useQuery } from "@tanstack/react-query";
import { Loader2, Radar } from "lucide-react";
import { Suspense, lazy, type JSX, useMemo } from "react";

import { ExecutiveSummaryPanel } from "@/components/enterprise-panels";
import { DASHBOARD_CONTEXT_QUERY_KEY, fetchDashboardContext } from "@/lib/dashboard-context-api";
import {
  buildOperationsIntelligenceBundle,
  type IntelligenceSupplement,
  summarizeInputForAria,
} from "@/lib/operations-intelligence";

import { ComplianceHealthPanel } from "./ComplianceHealthPanel";
import { ExecutiveAlertPanel } from "./ExecutiveAlertPanel";
import { GovernanceHealthPanel } from "./GovernanceHealthPanel";
import { GovernanceTimelinePanel } from "./GovernanceTimelinePanel";
import { IntelligenceRecommendationPanel } from "./IntelligenceRecommendationPanel";
import { OperationalRiskPanel } from "./OperationalRiskPanel";
import { WorkflowBottleneckPanel } from "./WorkflowBottleneckPanel";
import { WorkloadHeatmapPanel } from "./WorkloadHeatmapPanel";

const CertificationThroughputPanel = lazy(async () => {
  const m = await import("./CertificationThroughputPanel");
  return { default: m.CertificationThroughputPanel };
});

const CommitteeLoadPanel = lazy(async () => {
  const m = await import("./CommitteeLoadPanel");
  return { default: m.CommitteeLoadPanel };
});

function ChartPanelFallback(): JSX.Element {
  return (
    <div
      className="flex min-h-[200px] items-center justify-center rounded-2xl border border-border/40 bg-surface-secondary/30 text-sm text-text-secondary"
      role="status"
      aria-live="polite"
    >
      Učitavanje grafova…
    </div>
  );
}
export function ExecutiveControlTower({
  supplement,
}: {
  readonly supplement?: IntelligenceSupplement;
}): JSX.Element {
  const q = useQuery({
    queryKey: DASHBOARD_CONTEXT_QUERY_KEY,
    queryFn: fetchDashboardContext,
  });

  const bundle = useMemo(
    () => (q.data ? buildOperationsIntelligenceBundle(q.data, supplement) : null),
    [q.data, supplement],
  );

  const ariaSummary = bundle ? summarizeInputForAria(bundle.input) : "";

  if (q.isLoading) {
    return (
      <div className="flex items-center gap-2 py-12 text-text-secondary">
        <Loader2 className="h-6 w-6 animate-spin text-brand" aria-hidden />
        Učitavanje operativnog konteksta…
      </div>
    );
  }

  if (q.isError || !bundle) {
    return (
      <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-50" role="alert">
        Nije moguće učitati `/api/dashboard/context` za control tower. Provjerite sesiju i ulogu.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border/35 pb-6">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/30">
            <Radar className="h-6 w-6 text-brand" aria-hidden />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary">Executive Control Tower</h2>
            <p className="mt-1 max-w-3xl text-sm text-text-secondary">
              Observability-first prikaz operativnog i governance zdravlja — inferencija isključivo na frontendu iz
              dashboard agregata (i opcionalnih CB brojača).
            </p>
            <p className="sr-only">{ariaSummary}</p>
          </div>
        </div>
      </header>

      <ExecutiveSummaryPanel bundle={bundle} />

      <div className="grid gap-4 xl:grid-cols-2">
        <GovernanceHealthPanel health={bundle.health} />
        <OperationalRiskPanel risk={bundle.risk} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-4">
          <Suspense fallback={<ChartPanelFallback />}>
            <CertificationThroughputPanel trends={bundle.trends} />
          </Suspense>
          <WorkloadHeatmapPanel workload={bundle.workload} />
        </div>
        <div className="space-y-4">
          <Suspense fallback={<ChartPanelFallback />}>
            <CommitteeLoadPanel workload={bundle.workload} />
          </Suspense>
          <ComplianceHealthPanel insights={bundle.crossModule} />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <WorkflowBottleneckPanel insights={bundle.workflowInsights} />
        <GovernanceTimelinePanel events={bundle.timeline} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ExecutiveAlertPanel alerts={bundle.alerts} />
        <IntelligenceRecommendationPanel items={bundle.recommendations} />
      </div>
    </div>
  );
}
