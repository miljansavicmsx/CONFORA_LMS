import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type JSX } from "react";

import { Button } from "@/components/ui/button";
import {
  drainWorkerOnce,
  fetchJobRuns,
  fetchJobsStatus,
  fetchRecurringJobs,
  retryJobRun,
  runJob,
  tickRecurringJobs,
} from "@/lib/api-system-health";

export default function AdminJobsPage(): JSX.Element {
  const qc = useQueryClient();
  const jobs = useQuery({ queryKey: ["system", "jobs-status"] as const, queryFn: fetchJobsStatus });
  const runs = useQuery({ queryKey: ["system", "job-runs"] as const, queryFn: fetchJobRuns });
  const recurring = useQuery({ queryKey: ["system", "jobs-recurring"] as const, queryFn: fetchRecurringJobs });

  const invalidateJobs = async (): Promise<void> => {
    await qc.invalidateQueries({ queryKey: ["system", "jobs-status"] });
    await qc.invalidateQueries({ queryKey: ["system", "job-runs"] });
    await qc.invalidateQueries({ queryKey: ["system", "jobs-recurring"] });
  };

  const runJobMutation = useMutation({
    mutationFn: (name: string) => runJob(name),
    onSuccess: invalidateJobs,
  });

  const drainMutation = useMutation({
    mutationFn: () => drainWorkerOnce(),
    onSuccess: invalidateJobs,
  });

  const tickMutation = useMutation({
    mutationFn: () => tickRecurringJobs(),
    onSuccess: invalidateJobs,
  });

  const retryMutation = useMutation({
    mutationFn: (runId: string) => retryJobRun(runId),
    onSuccess: invalidateJobs,
  });

  const worker = jobs.data?.worker ?? {};
  const dedicated = jobs.data?.dedicated ?? {};

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-text-primary">Jobs & workers</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Redis provider: queue depth, DLQ, heartbeat and recurring status. Use &quot;Drain one&quot; to process a single
          queued job when no separate worker process is running.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border/50 p-3 text-sm">
            <p className="text-text-muted">Provider</p>
            <p className="font-semibold text-text-primary">{String(worker.provider ?? "—")}</p>
          </div>
          <div className="rounded-xl border border-border/50 p-3 text-sm">
            <p className="text-text-muted">Queue depth</p>
            <p className="font-semibold text-text-primary">{String(worker.queueDepth ?? worker.redisQueueDepth ?? "—")}</p>
          </div>
          <div className="rounded-xl border border-border/50 p-3 text-sm">
            <p className="text-text-muted">Dead letter</p>
            <p className="font-semibold text-text-primary">{String(worker.deadLetterCount ?? "0")}</p>
          </div>
          <div className="rounded-xl border border-border/50 p-3 text-sm">
            <p className="text-text-muted">Avg duration (ms)</p>
            <p className="font-semibold text-text-primary">{String(worker.avgDurationMs ?? "—")}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border/50 p-3 text-sm">
          <p className="text-text-muted">Dedicated worker</p>
          <p className="font-semibold text-text-primary">
            {worker.dedicatedWorkerOnline ? "online" : "offline / no heartbeat"}
          </p>
          <p className="text-text-muted">Heartbeat worker</p>
          <p className="font-mono text-xs text-text-primary">{String(worker.heartbeatWorkerId ?? "—")}</p>
          <p className="text-text-muted">Last heartbeat</p>
          <p className="font-mono text-xs text-text-primary">{String(worker.lastHeartbeatAt ?? "—")}</p>
          <p className="mt-1 text-text-muted">Recurring due (score window)</p>
          <p className="font-semibold text-text-primary">{String(worker.recurringDue ?? "0")}</p>
          <pre className="mt-2 overflow-auto rounded bg-surface-primary p-2 text-xs text-text-secondary">
            {JSON.stringify(dedicated, null, 2)}
          </pre>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={() => runJobMutation.mutate("daily_certificate_expiry")}>Run daily_certificate_expiry</Button>
          <Button variant="outline" onClick={() => runJobMutation.mutate("retry_failed_notifications")}>
            Queue retry_failed_notifications
          </Button>
          <Button variant="secondary" onClick={() => drainMutation.mutate()} disabled={drainMutation.isPending}>
            Drain one (Redis)
          </Button>
          <Button variant="outline" onClick={() => tickMutation.mutate()} disabled={tickMutation.isPending}>
            Recurring tick
          </Button>
        </div>

        <div className="mt-6 rounded-xl border border-border/50 p-4">
          <h2 className="font-semibold text-text-primary">Recurring schedule (Redis)</h2>
          <pre className="mt-2 max-h-40 overflow-auto rounded bg-surface-primary p-2 text-xs text-text-secondary">
            {JSON.stringify(recurring.data ?? [], null, 2)}
          </pre>
        </div>

        <div className="mt-6 rounded-xl border border-border/50 p-4">
          <h2 className="font-semibold text-text-primary">Raw worker snapshot</h2>
          <pre className="mt-2 overflow-auto rounded bg-surface-primary p-2 text-xs text-text-secondary">
            {JSON.stringify(jobs.data ?? {}, null, 2)}
          </pre>
        </div>

        <div className="mt-6 rounded-xl border border-border/50 p-4">
          <h2 className="font-semibold text-text-primary">Recent runs</h2>
          <ul className="mt-3 space-y-2">
            {(runs.data ?? []).slice(-20).map((r) => (
              <li
                key={String(r.id)}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/40 bg-surface-primary/50 px-3 py-2 text-xs"
              >
                <span className="font-mono text-text-primary">{String(r.id)}</span>
                <span className="text-text-secondary">{String(r.jobName)}</span>
                <span className="text-text-muted">{String(r.status)}</span>
                {String(r.status) === "FAILED" ? (
                  <Button type="button" size="sm" variant="outline" onClick={() => retryMutation.mutate(String(r.id))}>
                    Retry
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
