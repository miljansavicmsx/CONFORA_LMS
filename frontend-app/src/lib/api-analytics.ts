import { api } from "@/lib/api";

export interface AnalyticsOverview {
  kpis: Record<string, number | null>;
  pilotHealthScore?: number;
  trends: unknown[];
  pilotTenantUsage: unknown[];
  certificateIssuanceTrend: unknown[];
  onboardingFunnel: unknown[];
  note?: string;
  /** Stvarne agregatne brojke (pilot), ako backend vraća. */
  pilotSnapshot?: {
    examPassCertificatesIssued?: number;
    personCertificationsIssued?: number;
    openFeedbackQueue?: number;
    certificationApplicationsVisible?: number;
    totalCertificatesInDb?: number;
  };
}

export async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  const { data } = await api.get<AnalyticsOverview>("/api/admin/analytics/overview");
  return data;
}

export async function fetchAnalyticsHistory(): Promise<{ items: Array<Record<string, unknown>>; range: string }> {
  const { data } = await api.get<{ items: Array<Record<string, unknown>>; range: string }>("/api/admin/analytics/history");
  return data ?? { items: [], range: "last_0" };
}

export async function createAnalyticsSnapshot(): Promise<Record<string, unknown>> {
  const { data } = await api.post<Record<string, unknown>>("/api/admin/analytics/snapshot");
  return data ?? {};
}
