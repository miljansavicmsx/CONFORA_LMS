import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type JSX } from "react";

import { Button } from "@/components/ui/button";
import {
  exportSystemSnapshot,
  fetchAlertHistory,
  fetchEmailStatus,
  fetchHealthReady,
  fetchJobsStatus,
  fetchMetricsText,
  postAlertMutePlaceholder,
  postTestAlert,
} from "@/lib/api-system-health";

export default function SystemHealthPage(): JSX.Element {
  const qc = useQueryClient();
  const health = useQuery({ queryKey: ["system", "health-ready"] as const, queryFn: fetchHealthReady });
  const metrics = useQuery({ queryKey: ["system", "metrics"] as const, queryFn: fetchMetricsText });
  const alerts = useQuery({ queryKey: ["system", "alerts"] as const, queryFn: fetchAlertHistory });
  const email = useQuery({ queryKey: ["system", "email"] as const, queryFn: fetchEmailStatus });
  const jobs = useQuery({ queryKey: ["system", "jobs-status"] as const, queryFn: fetchJobsStatus });

  const testAlert = useMutation({
    mutationFn: () => postTestAlert("CONFORA test alert", "Manual test from system-health UI."),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["system", "alerts"] });
    },
  });

  const mute = useMutation({
    mutationFn: () => postAlertMutePlaceholder(),
  });

  const recent = (alerts.data ?? []).slice(-12).reverse();

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-text-primary">System health</h1>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => exportSystemSnapshot({ health: health.data, metrics: metrics.data, alerts: alerts.data, email: email.data })}
          >
            Export snapshot
          </Button>
        </div>
        <div className="mt-4 rounded-xl border border-border/50 p-4">
          <p className="text-sm text-text-secondary">Ready: {health.data?.status ?? "..."}</p>
          <pre className="mt-2 overflow-auto rounded bg-surface-primary p-2 text-xs text-text-secondary">
            {JSON.stringify(health.data?.checks ?? {}, null, 2)}
          </pre>
          <p className="mt-2 text-xs text-text-muted">
            External monitoring:{" "}
            {String((health.data?.checks?.externalMonitoring as { connected?: boolean } | undefined)?.connected ?? false)}
            {" · version "}
            {String((health.data?.checks?.externalMonitoring as { version?: string } | undefined)?.version ?? "dev")}
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-border/50 p-4">
          <h2 className="font-semibold text-text-primary">Metrics (Prometheus text)</h2>
          <pre className="mt-3 max-h-64 overflow-auto rounded bg-surface-primary p-2 text-xs text-text-secondary">
            {metrics.data ?? ""}
          </pre>
        </div>

        <div className="mt-6 rounded-xl border border-border/50 p-4">
          <h2 className="font-semibold text-text-primary">Email health</h2>
          <pre className="mt-3 max-h-48 overflow-auto rounded bg-surface-primary p-2 text-xs text-text-secondary">
            {JSON.stringify(email.data ?? {}, null, 2)}
          </pre>
        </div>

        <div className="mt-6 rounded-xl border border-border/50 p-4">
          <h2 className="font-semibold text-text-primary">Operational scale warnings</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border/40 bg-surface-primary/60 p-3 text-sm">
              <p className="text-text-muted">Queue backlog</p>
              <p className="text-xl font-semibold text-text-primary">
                {String(jobs.data?.worker.redisQueueDepth ?? jobs.data?.worker.queueDepth ?? "—")}
              </p>
              <p className="text-xs text-text-muted">Capacity warning threshold placeholder: 100 queued jobs.</p>
            </div>
            <div className="rounded-md border border-border/40 bg-surface-primary/60 p-3 text-sm">
              <p className="text-text-muted">Incident banner</p>
              <p className="font-semibold text-text-primary">
                {health.data?.checks?.maintenanceMode ? "Maintenance active" : "No active incident banner"}
              </p>
              <p className="text-xs text-text-muted">Auto trigger placeholder from alerts/error spikes.</p>
            </div>
            <div className="rounded-md border border-border/40 bg-surface-primary/60 p-3 text-sm">
              <p className="text-text-muted">Retention / backup</p>
              <p className="font-semibold text-text-primary">30d retention assumed</p>
              <p className="text-xs text-text-muted">Verify backup schedule in deploy confidence checklist.</p>
            </div>
            <div className="rounded-md border border-border/40 bg-surface-primary/60 p-3 text-sm">
              <p className="text-text-muted">Billing failure alerts</p>
              <p className="font-semibold text-text-primary">Webhook metrics available</p>
              <p className="text-xs text-text-muted">Monitor `billing_webhook_total` and payment failures.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-text-primary">Alerts</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={testAlert.isPending}
                onClick={() => testAlert.mutate()}
              >
                Resend test alert
              </Button>
              <Button type="button" variant="outline" size="sm" disabled={mute.isPending} onClick={() => mute.mutate()}>
                Mute (placeholder)
              </Button>
            </div>
          </div>
          {mute.data ? (
            <p className="mt-2 text-xs text-text-muted">
              {mute.data.status}: {mute.data.detail ?? ""}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-text-muted">Recent alerts (newest first)</p>
          <ul className="mt-2 space-y-2">
            {recent.map((a) => (
              <li
                key={String(a.id ?? a.createdAt)}
                className="rounded-md border border-border/40 bg-surface-primary/60 px-3 py-2 text-sm"
              >
                <span className="font-medium text-text-primary">{String(a.title ?? "")}</span>
                <span className="ml-2 text-xs text-text-muted">[{String(a.level ?? "")}]</span>
                <span className="ml-2 text-xs text-text-muted">channel={String(a.channel ?? "")}</span>
                <p className="mt-1 text-xs text-text-secondary">{String(a.message ?? "")}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
