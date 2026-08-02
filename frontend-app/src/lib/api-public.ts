import axios from "axios";

import { API_BASE_URL } from "@/lib/api";

const publicClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export type LaunchMode = "closed_beta" | "pilot" | "limited_ga" | "full_ga" | "public";

export interface PublicLaunchMode {
  launchMode: LaunchMode;
  mode?: LaunchMode;
  signupEnabled?: boolean;
  requiresApproval?: boolean;
  waitlistEnabled?: boolean;
  maxSlots?: number | null;
  usedSlots?: number;
  ctaLabel?: string;
  ctaTarget?: string;
}

export async function fetchPublicLaunchMode(): Promise<LaunchMode> {
  const { data } = await publicClient.get<PublicLaunchMode>("/api/public/launch-mode");
  const m = String(data?.launchMode ?? "pilot").toLowerCase().replace("-", "_");
  if (m === "closed_beta" || m === "pilot" || m === "limited_ga" || m === "full_ga" || m === "public") {
    return m;
  }
  return "pilot";
}

export async function fetchPublicLaunchConfig(): Promise<PublicLaunchMode> {
  const { data } = await publicClient.get<PublicLaunchMode>("/api/public/launch-mode");
  return data;
}
