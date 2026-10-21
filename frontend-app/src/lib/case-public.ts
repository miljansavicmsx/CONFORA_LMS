import { api } from "@/lib/api";
import { getConforaApiConfig, joinBaseUrlAndPath } from "@/lib/api/api-config";

export type PublicCaseDocument = {
  readonly kind: "EDUCATION" | "EXAM_PASS";
  readonly number: string;
  readonly holderName: string | null;
  readonly title: string;
  readonly issuedAt: string;
  readonly statement: string;
  readonly professionalCertificate: false;
  readonly participationSeconds?: number;
  readonly passed?: boolean;
};

export type CommitteeCaseView = {
  readonly caseId: string;
  readonly path: string;
  readonly phase: string;
  readonly trainingGates: false;
  readonly scheme: string;
  readonly computedLevelCode: string | null;
  readonly eligibleLevel: string | null;
  readonly proposals: readonly {
    readonly userId: string;
    readonly state: string;
    readonly exclusionReason: string | null;
  }[];
  readonly evidence: readonly { readonly id: string; readonly kind: string; readonly title: string }[];
  readonly referees: readonly {
    readonly id: string;
    readonly refereeName: string;
    readonly organization: string;
    readonly state: string;
    readonly requirementsSatisfied: false;
  }[];
};

export function isEducationOrExamNumber(value: string): boolean {
  return /^(?:EDU|EXM)-\d{4}-\d{4}$/iu.test(value.trim());
}

async function publicGet(path: string): Promise<Response> {
  return fetch(joinBaseUrlAndPath(getConforaApiConfig().nestBaseUrl, path), {
    headers: { Accept: "application/json" },
  });
}

export async function fetchPublicCaseDocument(number: string): Promise<
  | { readonly kind: "ok"; readonly data: PublicCaseDocument }
  | { readonly kind: "not_found" }
  | { readonly kind: "rate_limited" }
  | { readonly kind: "error" }
> {
  const response = await publicGet(`/v1/public/documents/${encodeURIComponent(number.trim())}`);
  if (response.status === 404) return { kind: "not_found" };
  if (response.status === 429) return { kind: "rate_limited" };
  if (!response.ok) return { kind: "error" };
  return { kind: "ok", data: (await response.json()) as PublicCaseDocument };
}

export async function fetchMyCases(): Promise<readonly { caseId: string; path: string; phase: string; trainingGates: false }[]> {
  const { data } = await api.get<{ caseId: string; path: string; phase: string; trainingGates: false }[]>(
    "/v1/me/certification-cases",
  );
  return data;
}

export async function openCertificationCase(body: {
  schemeVersionId: string;
  path: "CONFORA_EDUCATION" | "DIRECT";
  prerequisitesAcknowledged: true;
  certificationApplicationId: string;
  experienceMonths: number;
}): Promise<{ caseId: string; trainingGates: false; path: string }> {
  const { data } = await api.post<{ caseId: string; trainingGates: false; path: string }>(
    "/v1/me/certification-cases",
    body,
  );
  return data;
}

export async function fetchCommitteeCase(caseId: string): Promise<CommitteeCaseView> {
  const { data } = await api.get<CommitteeCaseView>(`/v1/committee/cases/${encodeURIComponent(caseId)}`);
  return data;
}

export async function suggestForCase(caseId: string, purpose: "summary" | "completeness" | "inconsistencies" | "committee" | "notification"): Promise<{ suggestion: string; label: string; decides: false }> {
  const { data } = await api.post<{ suggestion: string; label: string; decides: false }>(
    `/v1/committee/cases/${encodeURIComponent(caseId)}/assist`,
    { purpose },
  );
  return data;
}

export async function respondAsReferee(token: string, body: { accept: boolean; confirmedFacts: string; discrepancies?: string }): Promise<{ requirementsSatisfied: false }> {
  const response = await fetch(
    joinBaseUrlAndPath(getConforaApiConfig().nestBaseUrl, `/v1/public/referees/${encodeURIComponent(token)}`),
    {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!response.ok) {
    throw new Error("REFEREE_RESPONSE_FAILED");
  }
  return (await response.json()) as { requirementsSatisfied: false };
}
