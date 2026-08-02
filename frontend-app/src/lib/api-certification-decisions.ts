/**
 * Formalne odluke certifikacijskog odbora (`/api/certification-decisions`).
 */

import { api } from "@/lib/api";

export type CertificationDecisionStatusApi =
  | "PENDING_COMMITTEE_REVIEW"
  | "UNDER_COMMITTEE_REVIEW"
  | "RETURNED_FOR_MORE_INFORMATION"
  | "APPROVED"
  | "REJECTED"
  | "VOIDED";

export interface CertificationDecisionReviewerRow {
  readonly userId: string;
  readonly roleInCommittee?: string;
  readonly coiDeclared?: boolean;
  readonly hasConflict?: boolean | null;
  readonly recused?: boolean;
  readonly coiAttestations?: Record<string, unknown>;
}

export interface CertificationDecisionItem {
  readonly decisionId: string;
  readonly applicationId: string;
  readonly committeeId?: string;
  readonly candidateUserId?: string;
  readonly courseId: string;
  readonly tenantId?: string | null;
  readonly status: CertificationDecisionStatusApi | string;
  readonly approvedCertificationLevel?: string | null;
  readonly quorumRequired?: number;
  readonly quorumMet?: boolean;
  readonly coiComplete?: boolean;
  readonly coiBlocked?: boolean;
  readonly decidedAt?: string | null;
  readonly certificateId?: string | null;
  readonly issuedCertificateId?: string | null;
  readonly appealEligible?: boolean;
  readonly rationale?: string | null;
  readonly reviewers?: CertificationDecisionReviewerRow[];
}

export interface CertificationDecisionEventRow {
  readonly eventId: string;
  readonly at: string;
  readonly actorUserId?: string | null;
  readonly eventType: string;
  readonly payload?: Record<string, unknown> | null;
}

export interface CertificationDecisionListPayload {
  readonly items: CertificationDecisionItem[];
}


export async function fetchCertificationDecisions(applicationId?: string): Promise<CertificationDecisionItem[]> {
  const q = applicationId?.trim()
    ? `?applicationId=${encodeURIComponent(applicationId.trim())}`
    : "";
  const { data } = await api.get<CertificationDecisionListPayload>(`/api/certification-decisions${q}`);
  const items = data?.items;
  return Array.isArray(items) ? items : [];
}

export async function fetchCertificationDecision(decisionId: string): Promise<CertificationDecisionItem> {
  const id = decisionId.trim();
  const { data } = await api.get<CertificationDecisionItem>(
    `/api/certification-decisions/${encodeURIComponent(id)}`,
  );
  return data;
}

export async function fetchCertificationDecisionEvents(decisionId: string): Promise<CertificationDecisionEventRow[]> {
  const id = decisionId.trim();
  const { data } = await api.get<CertificationDecisionEventRow[]>(
    `/api/certification-decisions/${encodeURIComponent(id)}/events`,
  );
  return Array.isArray(data) ? data : [];
}

export interface DeclareCoiAttestationsPayload {
  readonly noUndeclaredConflict: boolean;
  readonly notInvolvedInCandidateTraining: boolean;
  readonly notExamItemAuthorAffectingImpartiality: boolean;
  readonly noBusinessOrPersonalInterestRelationship: boolean;
}

export async function postCertificationDecisionDeclareCoi(
  decisionId: string,
  body: {
    readonly hasConflict: boolean;
    readonly recuse?: boolean;
    readonly comment?: string;
    readonly attestations?: DeclareCoiAttestationsPayload;
  },
): Promise<CertificationDecisionItem> {
  const id = decisionId.trim();
  const { data } = await api.post<CertificationDecisionItem>(
    `/api/certification-decisions/${encodeURIComponent(id)}/declare-coi`,
    body,
  );
  return data;
}

export async function postCertificationDecisionStartReview(
  decisionId: string,
  body: { readonly note?: string | null },
): Promise<CertificationDecisionItem> {
  const id = decisionId.trim();
  const { data } = await api.post<CertificationDecisionItem>(
    `/api/certification-decisions/${encodeURIComponent(id)}/start-review`,
    body,
  );
  return data;
}

export async function postCertificationDecisionReturnInfo(
  decisionId: string,
  body: { readonly comment: string; readonly internalNotes?: string | null },
): Promise<CertificationDecisionItem> {
  const id = decisionId.trim();
  const { data } = await api.post<CertificationDecisionItem>(
    `/api/certification-decisions/${encodeURIComponent(id)}/return-for-more-information`,
    body,
  );
  return data;
}

export async function postCertificationDecisionApprove(
  decisionId: string,
  body: {
    readonly comment: string;
    readonly approvedCertificationLevel?: string | null;
    readonly internalNotes?: string | null;
  },
): Promise<CertificationDecisionItem> {
  const id = decisionId.trim();
  const { data } = await api.post<CertificationDecisionItem>(
    `/api/certification-decisions/${encodeURIComponent(id)}/approve`,
    body,
  );
  return data;
}

export async function postCertificationDecisionReject(
  decisionId: string,
  body: {
    readonly rationale: string;
    readonly rejectionReasons?: readonly string[];
    readonly internalNotes?: string | null;
  },
): Promise<CertificationDecisionItem> {
  const id = decisionId.trim();
  const { data } = await api.post<CertificationDecisionItem>(
    `/api/certification-decisions/${encodeURIComponent(id)}/reject`,
    body,
  );
  return data;
}

export function decisionStatusLabelHr(status: string): string {
  const s = status.trim().toUpperCase();
  const labels: Record<string, string> = {
    PENDING_COMMITTEE_REVIEW: "Čeka odbor",
    UNDER_COMMITTEE_REVIEW: "U pregledu odbora",
    RETURNED_FOR_MORE_INFORMATION: "Vraćeno za dopunu",
    CREATED: "Čeka odbor",
    REVIEW_STARTED: "U pregledu odbora",
    RETURNED_FOR_MORE_INFO: "Vraćeno za dopunu",
    APPROVED: "Odobreno",
    REJECTED: "Odbijeno",
    VOIDED: "Poništeno",
  };
  return labels[s] ?? status;
}
