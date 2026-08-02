/**
 * Pilot korak 10 — jednostavan pregled prijava (cert_committee).
 */

import { api } from "@/lib/api";

export type CommitteePilotQueueRow = {
  readonly applicationId: string;
  readonly candidateName: string;
  readonly courseTitle?: string | null;
  readonly schemeTitle?: string | null;
  readonly status: string;
  readonly submittedAt?: string | null;
  readonly tenantId?: string | null;
  readonly hasEvidence: boolean;
  readonly coiRequired: boolean;
  readonly coiCleared: boolean;
  readonly decisionStatus: string;
};

export type CommitteePilotApplication = {
  readonly applicationId: string;
  readonly userId: string;
  readonly courseId: string;
  readonly status: string;
  readonly submittedAt?: string | null;
  readonly updatedAt?: string | null;
  readonly applicantFullName?: string | null;
  readonly examPassCertificateId?: string | null;
  readonly certificateId?: string | null;
  readonly coiCheck?: boolean | null;
  readonly workExperience?: string;
  readonly educationSummary?: string | null;
  readonly additionalNotes?: string | null;
  readonly evidenceDocuments?: readonly {
    readonly documentId: string;
    readonly fileName?: string | null;
    readonly storageKey: string;
    readonly documentType?: string | null;
  }[];
  readonly pilotCoiDeclarations?: readonly {
    readonly userId: string;
    readonly noConflict: boolean;
    readonly comment?: string | null;
    readonly declaredAt: string;
  }[];
  readonly pilotDecisionHistory?: readonly {
    readonly at: string;
    readonly byUserId: string;
    readonly decision: string;
    readonly comment?: string | null;
  }[];
};

export async function fetchCommitteePilotApplications(): Promise<CommitteePilotQueueRow[]> {
  const { data } = await api.get<CommitteePilotQueueRow[]>("/api/committee/applications");
  return Array.isArray(data) ? data : [];
}

export async function fetchCommitteePilotApplication(id: string): Promise<CommitteePilotApplication> {
  const { data } = await api.get<CommitteePilotApplication>(
    `/api/committee/applications/${encodeURIComponent(id)}`,
  );
  return data;
}

export type CommitteePilotDecision = "APPROVE" | "REJECT" | "REQUEST_INFO";

export async function postCommitteePilotCoi(
  applicationId: string,
  body: { readonly noConflict: boolean; readonly comment?: string; readonly declaredAt?: string | null },
): Promise<CommitteePilotApplication> {
  const { data } = await api.post<CommitteePilotApplication>(
    `/api/committee/applications/${encodeURIComponent(applicationId)}/coi`,
    {
      noConflict: body.noConflict,
      comment: body.comment ?? "",
      declaredAt: body.declaredAt ?? undefined,
    },
  );
  return data;
}

export async function postCommitteePilotDecision(
  applicationId: string,
  body: { readonly decision: CommitteePilotDecision; readonly comment: string },
): Promise<CommitteePilotApplication> {
  const { data } = await api.post<CommitteePilotApplication>(
    `/api/committee/applications/${encodeURIComponent(applicationId)}/decision`,
    body,
  );
  return data;
}
