import { api } from "@/lib/api";

export type CommitteeVote = "APPROVE" | "REJECT" | "ABSTAIN";

export interface CommitteeReviewSummary {
  applicationId: string;
  decisionId: string;
  status: string;
  quorumRequired: number;
  eligibleMembers: number;
  blockedMembers: string[];
  coiSummary: {
    blockedMembers: string[];
    pendingDeclarations?: string[];
  };
  nextActions: string[];
}

export interface CommitteeReviewDetail {
  applicationSummary: {
    applicationId: string;
    status: string;
    requestedLevel?: string | null;
  };
  candidateSummary: { candidateId: string };
  certificationSchemeSummary: { schemeId?: string; name?: string };
  evidenceSummary: {
    documents: number;
    workExperienceRecords: number;
    referees: number;
  };
  decisionStatus: string;
  quorumStatus: {
    quorumRequired: number;
    quorumAchieved: boolean;
    votesCast: number;
  };
  votes: Array<{ voterUserId: string; vote: CommitteeVote; castAt?: string; comment?: string | null }>;
  coiStatusByMember: Array<Record<string, unknown>>;
  blockers: {
    blockedMembers: string[];
    pendingDeclarations: string[];
  };
  allowedActions: {
    canCurrentUserVote: boolean;
    voteBlockedReason: string | null;
    canClose: boolean;
  };
}

export async function startCommitteeReview(applicationId: string): Promise<CommitteeReviewSummary> {
  const { data } = await api.post<CommitteeReviewSummary>(
    `/api/certification-applications/${encodeURIComponent(applicationId)}/committee-review/start`,
  );
  return data;
}

export async function getCommitteeReview(applicationId: string): Promise<CommitteeReviewDetail> {
  const { data } = await api.get<CommitteeReviewDetail>(
    `/api/certification-applications/${encodeURIComponent(applicationId)}/committee-review`,
  );
  return data;
}

export async function castCommitteeVote(
  decisionId: string,
  body: { vote: CommitteeVote; comment?: string; conflictDeclared?: boolean; conflictReason?: string },
): Promise<{ status: string; voteSummary?: unknown }> {
  const { data } = await api.post<{ status: string; voteSummary?: unknown }>(
    `/api/committee-decisions/${encodeURIComponent(decisionId)}/vote`,
    body,
  );
  return data;
}

export async function closeCommitteeDecision(
  decisionId: string,
  body: { rationale?: string; internalNotes?: string },
): Promise<{ status: string; certificateId?: string | null }> {
  const { data } = await api.post<{ status: string; certificateId?: string | null }>(
    `/api/committee-decisions/${encodeURIComponent(decisionId)}/close`,
    body,
  );
  return data;
}

