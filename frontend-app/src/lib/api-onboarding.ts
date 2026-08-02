import { api } from "@/lib/api";

export interface OnboardingRequestBody {
  organizationType: string;
  useCase: string;
  organizationName: string;
  email: string;
  plan: string;
}

export async function requestDemo(body: OnboardingRequestBody): Promise<{ leadId: string }> {
  const { data } = await api.post<{ leadId: string }>("/api/onboarding/request-demo", body);
  return data;
}

export async function startTrial(body: OnboardingRequestBody): Promise<{ leadId: string }> {
  const { data } = await api.post<{ leadId: string }>("/api/onboarding/start-trial", body);
  return data;
}

export async function contactSales(body: {
  company: string;
  email: string;
  planInterest: string;
  message: string;
}): Promise<{ leadId: string }> {
  const { data } = await api.post<{ leadId: string }>("/api/sales/contact", body);
  return data;
}

export async function fetchAdminLeads(): Promise<Array<Record<string, unknown>>> {
  const { data } = await api.get<Array<Record<string, unknown>>>("/api/admin/leads");
  return Array.isArray(data) ? data : [];
}

export async function fetchLaunchStatus(): Promise<Record<string, unknown>> {
  const { data } = await api.get<Record<string, unknown>>("/api/admin/leads/launch-status");
  return data ?? {};
}

