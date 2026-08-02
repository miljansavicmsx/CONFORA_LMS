/**
 * CERT-ELIGIBILITY-UX-1 — Learner certification eligibility API (Nest read model).
 */

import { getConforaApiConfig } from "@/lib/api/api-config";
import { api } from "@/lib/api";
import type { LearnerCertEligibilityItem } from "@/lib/cert-eligibility-labels";

const NEST_ELIGIBILITY_PATH = "/v1/me/certification/eligibility";

export type LearnerCertEligibilityResponse = {
  readonly contractVersion?: string;
  readonly items?: readonly LearnerCertEligibilityItem[];
};

function usesNestEligibility(): boolean {
  const provider = getConforaApiConfig().provider;
  return provider === "nest" || provider === "hybrid";
}

/** Backend-driven certification eligibility for enrolled programmes. */
export async function fetchMyCertificationEligibility(): Promise<LearnerCertEligibilityItem[]> {
  if (!usesNestEligibility()) {
    return [];
  }
  const { data } = await api.get<LearnerCertEligibilityResponse>(NEST_ELIGIBILITY_PATH);
  return Array.isArray(data?.items) ? [...data.items] : [];
}

export { NEST_ELIGIBILITY_PATH };
