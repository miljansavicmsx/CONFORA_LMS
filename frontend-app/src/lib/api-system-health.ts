import { api } from "@/lib/api";

export interface HealthReady {
  status: string;
  checks: Record<string, unknown>;
}

export async function fetchHealthReady(): Promise<HealthReady> {
  const { data } = await api.get<HealthReady>("/health/ready");
  return data;
}

export async function runJob(jobName: string): Promise<Record<string, unknown>> {
  const { data } = await api.post<Record<string, unknown>>(`/api/admin/jobs/run/${encodeURIComponent(jobName)}`);
  return data;
}

export interface JobsStatusResponse {
  jobs: Record<string, Record<string, unknown>>;
  worker: Record<string, unknown>;
  dedicated?: Record<string, unknown>;
}

export async function fetchJobsStatus(): Promise<JobsStatusResponse> {
  const { data } = await api.get<JobsStatusResponse>("/api/admin/jobs/status");
  return data ?? { jobs: {}, worker: {} };
}

export async function fetchJobRuns(): Promise<Array<Record<string, unknown>>> {
  const { data } = await api.get<Array<Record<string, unknown>>>("/api/admin/jobs/runs");
  return Array.isArray(data) ? data : [];
}

export async function fetchMetricsText(): Promise<string> {
  const { data } = await api.get<string>("/metrics", { responseType: "text" as never });
  return typeof data === "string" ? data : "";
}

export async function fetchAlertHistory(): Promise<Array<Record<string, unknown>>> {
  const { data } = await api.get<Array<Record<string, unknown>>>("/api/admin/alerts/history");
  return Array.isArray(data) ? data : [];
}

export async function fetchEmailStatus(): Promise<Record<string, unknown>> {
  const { data } = await api.get<Record<string, unknown>>("/api/admin/alerts/email-status");
  return data ?? {};
}

export async function postTestAlert(title: string, message: string): Promise<Record<string, unknown>> {
  const { data } = await api.post<Record<string, unknown>>("/api/admin/alerts/test", {
    level: "warning",
    title,
    message,
  });
  return data ?? {};
}

export async function postAlertMutePlaceholder(): Promise<Record<string, string>> {
  const { data } = await api.post<Record<string, string>>("/api/admin/alerts/mute-placeholder");
  return data ?? {};
}

export async function drainWorkerOnce(): Promise<Record<string, unknown>> {
  const { data } = await api.post<Record<string, unknown>>("/api/admin/jobs/worker/drain");
  return data ?? {};
}

export async function fetchRecurringJobs(): Promise<Array<Record<string, unknown>>> {
  const { data } = await api.get<Array<Record<string, unknown>>>("/api/admin/jobs/recurring");
  return Array.isArray(data) ? data : [];
}

export async function tickRecurringJobs(): Promise<Record<string, unknown>> {
  const { data } = await api.post<Record<string, unknown>>("/api/admin/jobs/recurring/tick");
  return data ?? {};
}

export async function retryJobRun(runId: string): Promise<Record<string, unknown>> {
  const { data } = await api.post<Record<string, unknown>>(
    `/api/admin/jobs/retry/${encodeURIComponent(runId)}`,
  );
  return data ?? {};
}

export function exportSystemSnapshot(payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `confora-system-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

