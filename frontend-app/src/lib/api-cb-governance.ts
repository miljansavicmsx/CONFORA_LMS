/**
 * Certification body governance API (`/api/cb-governance`).
 */

import { api } from "@/lib/api";

export function getCbGovernanceTenantId(): string {
  const v = import.meta.env.VITE_DEFAULT_TENANT_ID;
  return typeof v === "string" && v.trim() ? v.trim() : "default";
}

export type CbGovernanceEntityType =
  | "IMPARTIALITY_RISK"
  | "COI_RECORD"
  | "INTERNAL_AUDIT"
  | "AUDIT_FINDING"
  | "MANAGEMENT_REVIEW"
  | "CAPA";

export interface CbGovernanceRecordOut {
  readonly recordId: string;
  readonly tenantId: string;
  readonly entityType: CbGovernanceEntityType;
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly dueDate?: string | null;
  readonly assignedToUserId?: string | null;
  readonly createdByUserId: string;
  readonly linkedRecordIds: readonly string[];
  readonly payload: Record<string, unknown>;
  readonly allowedViewerRoles: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface GovernanceDocumentVersionOut {
  readonly version: number;
  readonly storageKey: string;
  readonly fileName?: string | null;
  readonly sha256Hex?: string | null;
  readonly uploadedByUserId: string;
  readonly uploadedAt: string;
  readonly approvalStatus: string;
  readonly approvedByUserId?: string | null;
  readonly approvedAt?: string | null;
}

export interface GovernanceDocumentOut {
  readonly documentId: string;
  readonly tenantId: string;
  readonly title: string;
  readonly docType: string;
  readonly currentVersion: number;
  readonly versions: readonly GovernanceDocumentVersionOut[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly nextReviewAt?: string | null;
  readonly aiMetadata?: Record<string, unknown>;
}

export interface CbGovernanceMetricsOut {
  readonly tenantId: string;
  readonly byEntityType: Record<string, Record<string, number>>;
  readonly overdueCount: number;
  readonly openEthicsCount: number;
}

export async function fetchCbGovernanceRecords(params: {
  readonly tenantId?: string;
  readonly entityType?: CbGovernanceEntityType;
  readonly status?: string;
}): Promise<CbGovernanceRecordOut[]> {
  const tid = params.tenantId ?? getCbGovernanceTenantId();
  const { data } = await api.get<CbGovernanceRecordOut[]>("/api/cb-governance/records", {
    params: {
      tenantId: tid,
      ...(params.entityType ? { entityType: params.entityType } : {}),
      ...(params.status ? { status: params.status } : {}),
    },
  });
  return Array.isArray(data) ? data : [];
}

export async function fetchCbGovernanceDocuments(tenantId?: string): Promise<GovernanceDocumentOut[]> {
  const tid = tenantId ?? getCbGovernanceTenantId();
  const { data } = await api.get<GovernanceDocumentOut[]>("/api/cb-governance/documents", {
    params: { tenantId: tid },
  });
  return Array.isArray(data) ? data : [];
}

export async function patchGovernanceDocumentMeta(
  documentId: string,
  body: { readonly nextReviewAt?: string | null; readonly aiMetadata?: Record<string, unknown> | null },
  tenantId?: string,
): Promise<GovernanceDocumentOut> {
  const tid = tenantId ?? getCbGovernanceTenantId();
  const { data } = await api.patch<GovernanceDocumentOut>(
    `/api/cb-governance/documents/${encodeURIComponent(documentId)}`,
    body,
    { params: { tenantId: tid } },
  );
  return data;
}

export async function fetchCbEthicsReports(tenantId?: string): Promise<readonly Record<string, unknown>[]> {
  const tid = tenantId ?? getCbGovernanceTenantId();
  const { data } = await api.get<Record<string, unknown>[]>("/api/cb-governance/ethics", {
    params: { tenantId: tid },
  });
  return Array.isArray(data) ? data : [];
}

export async function fetchCbGovernanceMetrics(tenantId?: string): Promise<CbGovernanceMetricsOut> {
  const tid = tenantId ?? getCbGovernanceTenantId();
  const { data } = await api.get<CbGovernanceMetricsOut>("/api/cb-governance/metrics", {
    params: { tenantId: tid },
  });
  return data;
}
