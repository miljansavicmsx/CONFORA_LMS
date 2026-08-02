import { api } from "@/lib/api";

export interface LaunchStatus {
  mode: string;
  signupEnabled: boolean;
  requiresApproval: boolean;
  waitlistEnabled: boolean;
  maxSlots?: number | null;
  usedSlots: number;
  waitlistCount: number;
  ctaLabel: string;
  ctaTarget: string;
  riskChecklist?: Record<string, boolean>;
}

export async function fetchLaunchStatus(): Promise<LaunchStatus> {
  const { data } = await api.get<LaunchStatus>("/api/admin/launch/status");
  return data;
}

export async function updateLaunchMode(payload: {
  mode: "pilot" | "limited_ga" | "full_ga";
  maxSlots?: number;
  requiresApproval?: boolean;
}): Promise<LaunchStatus> {
  const { data } = await api.put<LaunchStatus>("/api/admin/launch/mode", payload);
  return data;
}
