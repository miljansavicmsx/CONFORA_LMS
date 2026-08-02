import { api } from "@/lib/api";

export interface CustomerSuccessRecord {
  id: string;
  tenantId: string;
  customerName?: string | null;
  company?: string | null;
  plan?: string | null;
  status: string;
  owner?: string | null;
  kickoffDate?: string | null;
  firstLoginAt?: string | null;
  firstCourseCreatedAt?: string | null;
  firstCertificateIssuedAt?: string | null;
  firstValueAchievedAt?: string | null;
  trainingCompleted: boolean;
  firstUsageDate?: string | null;
  firstValueAchieved: boolean;
  adoptionScore?: number | null;
  riskFlag?: string | null;
  renewalPotential?: string | null;
  weeklyNotes?: string | null;
  nextAction?: string | null;
  healthStatus?: string | null;
  lastReviewDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchCustomers(): Promise<CustomerSuccessRecord[]> {
  const { data } = await api.get<CustomerSuccessRecord[]>("/api/admin/customers");
  return Array.isArray(data) ? data : [];
}

export async function upsertCustomer(tenantId: string, body: Partial<CustomerSuccessRecord>): Promise<CustomerSuccessRecord> {
  const { data } = await api.put<CustomerSuccessRecord>(`/api/admin/customers/${encodeURIComponent(tenantId)}`, body);
  return data;
}
