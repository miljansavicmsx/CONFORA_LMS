/**
 * §11.1 — Committee management API (SysAdmin only).
 */

import { api } from "@/lib/api";

export type CommitteeType =
  | "technical_committee"
  | "certification_committee"
  | "appeals_committee"
  | "impartiality_committee";

export type CommitteeStatus = "active" | "inactive";

export type CommitteeMember = {
  readonly userId: string;
  readonly roleInCommittee: string;
  readonly active: boolean;
  readonly appointedAt?: string | null;
  readonly removedAt?: string | null;
  readonly createdBy?: string | null;
};

export type CommitteeRow = {
  readonly committeeId: string;
  readonly committeeType: CommitteeType;
  readonly name: string;
  readonly status: CommitteeStatus;
  readonly members: readonly CommitteeMember[];
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

export async function fetchCommittees(): Promise<readonly CommitteeRow[]> {
  const { data } = await api.get<{ items: CommitteeRow[] }>("/api/admin/committees");
  return Array.isArray(data.items) ? data.items : [];
}

export async function createCommittee(body: {
  committeeType: CommitteeType;
  name: string;
}): Promise<CommitteeRow> {
  const { data } = await api.post<CommitteeRow>("/api/admin/committees", body);
  return data;
}

export async function addCommitteeMember(
  committeeId: string,
  body: { userId: string; roleInCommittee: string },
): Promise<CommitteeRow> {
  const { data } = await api.post<CommitteeRow>(
    `/api/admin/committees/${encodeURIComponent(committeeId)}/members`,
    body,
  );
  return data;
}

export async function removeCommitteeMember(
  committeeId: string,
  userId: string,
): Promise<CommitteeRow> {
  const { data } = await api.delete<CommitteeRow>(
    `/api/admin/committees/${encodeURIComponent(committeeId)}/members`,
    { data: { userId } },
  );
  return data;
}
