import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type JSX } from "react";

import { Button } from "@/components/ui/button";
import { createAnalyticsSnapshot, fetchAnalyticsHistory, fetchAnalyticsOverview } from "@/lib/api-analytics";

export default function AnalyticsPage(): JSX.Element {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "analytics-overview"] as const, queryFn: fetchAnalyticsOverview });
  const history = useQuery({ queryKey: ["admin", "analytics-history"] as const, queryFn: fetchAnalyticsHistory });
  const snapshot = useMutation({
    mutationFn: createAnalyticsSnapshot,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "analytics-history"] });
    },
  });
  const kpis = q.data?.kpis ?? {};
  const exportWeekly = (): void => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), data: q.data }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `confora-weekly-kpi-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-text-primary">Pilot analytics</h1>
          <Button type="button" variant="outline" size="sm" onClick={exportWeekly}>
            Export weekly snapshot
          </Button>
          <Button type="button" size="sm" onClick={() => snapshot.mutate()} disabled={snapshot.isPending}>
            Save daily snapshot
          </Button>
        </div>
        <p className="mt-2 text-sm text-text-secondary">{q.data?.note ?? "Current snapshot"}</p>
        {q.data?.pilotSnapshot ? (
          <div className="mt-4 rounded-xl border border-border/50 bg-surface-primary/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Pilot snapshot (real)</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {Object.entries(q.data.pilotSnapshot).map(([k, v]) => (
                <div key={k}>
                  <p className="text-[10px] text-text-muted">{k}</p>
                  <p className="text-lg font-semibold text-text-primary">{String(v ?? "—")}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {["Pilot adoption", "Certification funnel", "Commercial funnel", "Support health", "Product health"].map((name) => (
            <div key={name} className="rounded-lg border border-border/50 bg-surface-primary/50 p-3 text-sm text-text-secondary">
              {name}
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-border/50 bg-surface-primary/50 p-4">
          <p className="text-xs text-text-muted">Pilot health score</p>
          <p className="mt-1 text-3xl font-semibold text-text-primary">{q.data?.pilotHealthScore ?? "—"}</p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(kpis).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-border/50 bg-surface-primary/50 p-4">
              <p className="text-xs text-text-muted">{key}</p>
              <p className="mt-1 text-2xl font-semibold text-text-primary">{value ?? "—"}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-border/50 p-4">
          <h2 className="font-semibold text-text-primary">Historical trends</h2>
          <pre className="mt-2 overflow-auto rounded bg-surface-primary p-2 text-xs text-text-secondary">
            {JSON.stringify(
              {
                last7Days: (history.data?.items ?? []).slice(0, 7),
                last30Days: history.data?.items ?? [],
                trendArrows: "placeholder",
                revenueTrend: "placeholder",
                trends: q.data?.trends ?? [],
                pilotTenantUsage: q.data?.pilotTenantUsage ?? [],
                certificateIssuanceTrend: q.data?.certificateIssuanceTrend ?? [],
                onboardingFunnel: q.data?.onboardingFunnel ?? [],
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
