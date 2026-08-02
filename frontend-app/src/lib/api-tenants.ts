import { api } from "@/lib/api";

export interface TenantAdminItem {
  tenantId: string;
  plan: string;
  subscriptionStatus: string;
  activeUsers: number;
  isPilot?: boolean;
  pilotNotes?: string | null;
  pilotHealthScore?: number | null;
}

export interface TenantDemoStatus {
  exists: boolean;
  tenantId: string;
  status?: string | null;
  billingStatus?: string | null;
  launchMode?: string | null;
  usersCount: number;
  coursesCount: number;
}

export interface CourseDemoStatus {
  exists: boolean;
  courseId: string;
  tenantId: string;
  published: boolean;
  lessonsCount: number;
  learnersEnrolled: number;
}

export async function fetchAdminTenants(): Promise<TenantAdminItem[]> {
  const { data } = await api.get<TenantAdminItem[]>("/api/admin/tenants");
  return Array.isArray(data) ? data : [];
}

export async function fetchTenantDemoStatus(): Promise<TenantDemoStatus> {
  const { data } = await api.get<TenantDemoStatus>("/api/admin/tenants/demo-status");
  return data;
}

export async function fetchCourseDemoStatus(): Promise<CourseDemoStatus> {
  const { data } = await api.get<CourseDemoStatus>("/api/admin/courses/demo-status");
  return data;
}

export async function markTenantPilot(tenantId: string): Promise<Record<string, unknown>> {
  const { data } = await api.put<Record<string, unknown>>(`/api/admin/tenants/${encodeURIComponent(tenantId)}/pilot`, {
    isPilot: true,
    pilotNotes: "Marked as first pilot candidate from admin UI.",
    pilotHealthScore: 70,
  });
  return data ?? {};
}

