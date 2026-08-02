/**
 * ISO 17024 — Audit trail (GET /api/admin/audit-logs), samo sys_admin na backendu.
 */

import { api } from "@/lib/api";

/** Odgovara backend `AuditLog` (camelCase u JSON-u). */
export type AuditLog = {
  readonly id: string;
  readonly timestamp: string;
  readonly actorId: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly details: Record<string, unknown>;
  readonly ipAddress?: string | null;
};

export type AuditLogListResponse = {
  readonly items: readonly AuditLog[];
  readonly nextCursor: string | null;
};

export type AuditLogFilters = {
  readonly entityType?: string;
  readonly actorId?: string;
  readonly cursor?: string;
  readonly limit?: number;
};

export async function fetchAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogListResponse> {
  const params: Record<string, string | number> = {};
  const et = filters.entityType?.trim();
  if (et) {
    params.entityType = et;
  }
  const aid = filters.actorId?.trim();
  if (aid) {
    params.actorId = aid;
  }
  if (filters.cursor?.trim()) {
    params.cursor = filters.cursor.trim();
  }
  if (typeof filters.limit === "number" && filters.limit >= 1 && filters.limit <= 100) {
    params.limit = filters.limit;
  }

  const { data } = await api.get<AuditLogListResponse>("/api/admin/audit-logs", { params });
  return {
    items: Array.isArray(data.items) ? data.items : [],
    nextCursor: data.nextCursor ?? null,
  };
}
