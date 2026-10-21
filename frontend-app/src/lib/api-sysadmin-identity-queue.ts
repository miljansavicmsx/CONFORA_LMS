/**
 * F5-UI-7 — Sysadmin cross-tenant identity queue (metadata only).
 */

import { api } from "@/lib/api";

export type SysadminIdentityQueueItem = {
  readonly verificationId: string;
  readonly userId: string;
  readonly email: string;
  readonly fullName: string;
  readonly tenantId: string;
  readonly docType: string;
  readonly status: string;
  readonly documentKey: string | null;
  readonly submittedAt: string | null;
};

type RawSysadminIdentityRow = {
  readonly id: string;
  readonly userId: string;
  readonly docType: string;
  readonly status: string;
  readonly docUrlEnc?: string | null;
  readonly documentKey?: string | null;
  readonly createdAt?: string;
  readonly user?: {
    readonly id: string;
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly tenantId?: string;
  };
};

function mapRow(row: RawSysadminIdentityRow): SysadminIdentityQueueItem {
  const fullName =
    `${row.user?.firstName ?? ""} ${row.user?.lastName ?? ""}`.trim() || row.user?.email || "—";
  return {
    verificationId: row.id,
    userId: row.userId,
    email: row.user?.email ?? "",
    fullName,
    tenantId: row.user?.tenantId ?? "",
    docType: row.docType,
    status: row.status,
    documentKey: row.docUrlEnc ?? row.documentKey ?? null,
    submittedAt: row.createdAt ?? null,
  };
}

export async function fetchSysadminIdentityQueue(
  status?: string,
): Promise<readonly SysadminIdentityQueueItem[]> {
  const q = status?.trim() ? `?status=${encodeURIComponent(status.trim())}` : "";
  const { data } = await api.get<RawSysadminIdentityRow[]>(`/v1/sysadmin/users/identity-queue${q}`);
  const rows = Array.isArray(data) ? data : [];
  return rows.map(mapRow);
}

export function isSysadminCrossTenantQueueRole(jwtRoles: readonly string[]): boolean {
  return jwtRoles.includes("STAFF_SYSADM");
}
