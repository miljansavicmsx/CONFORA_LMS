/**
 * Governance API — `/api/certification-schemes` (ISO/IEC 17024 sloj šema iznad LMS-a).
 */

import { api } from "@/lib/api";

export type CertificationSchemeStatusApi =
  | "DRAFT"
  | "REVIEW"
  | "APPROVED"
  | "ACTIVE"
  | "SUSPENDED"
  | "ARCHIVED"
  | "RETIRED";

export type CertificationSchemeOut = {
  readonly schemeId: string;
  readonly code: string;
  readonly schemeCode?: string;
  readonly name: string;
  readonly title?: string;
  readonly level?: string;
  readonly description?: string | null;
  readonly version: string;
  readonly status: CertificationSchemeStatusApi;
  readonly validityMonths?: number;
  readonly recertificationRequired?: boolean;
  readonly certificateValidityMonths?: number | null;
  readonly certificationLevels?: readonly string[];
  readonly minimumExamScore?: number | null;
  readonly requiredExamPassCertificate?: boolean;
  readonly createdByUserId?: string | null;
  readonly approvedAt?: string | null;
  readonly approvedBy?: string | null;
  readonly activatedAt?: string | null;
  readonly activatedBy?: string | null;
  readonly archivedAt?: string | null;
  readonly archivedBy?: string | null;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly ownerOrganization?: string | null;
  readonly industrySector?: string | null;
  readonly scope?: string | null;
};

export type CertificationSchemeListPayload = {
  readonly items: readonly CertificationSchemeOut[];
  readonly total: number;
};

export type CertificationSchemeCreateBody = {
  readonly code: string;
  readonly name: string;
  readonly version?: string;
  readonly level?: string;
  readonly description?: string | null;
  readonly minimumExamScore?: number;
  readonly recertificationRequired?: boolean;
  readonly certificateValidityMonths?: number;
  readonly committeeDecisionRequired?: boolean;
};

export type CertificationSchemePatchBody = Partial<{
  name: string;
  description: string | null;
  level: string;
  version: string;
  minimumExamScore: number | null;
  ownerOrganization: string | null;
  industrySector: string | null;
  scope: string | null;
  suspensionRules: string | null;
  withdrawalRules: string | null;
  appealsRules: string | null;
  complaintsRules: string | null;
}>;

export async function fetchCertificationSchemes(status?: string): Promise<CertificationSchemeOut[]> {
  const q = status?.trim() ? `?status=${encodeURIComponent(status.trim())}` : "";
  const { data } = await api.get<CertificationSchemeListPayload>(`/api/certification-schemes${q}`);
  return Array.isArray(data?.items) ? [...data.items] : [];
}

export async function fetchCertificationScheme(schemeId: string): Promise<CertificationSchemeOut> {
  const id = schemeId.trim();
  const { data } = await api.get<CertificationSchemeOut>(`/api/certification-schemes/${encodeURIComponent(id)}`);
  return data;
}

export async function createCertificationScheme(body: CertificationSchemeCreateBody): Promise<CertificationSchemeOut> {
  const { data } = await api.post<CertificationSchemeOut>("/api/certification-schemes", body);
  return data;
}

export async function patchCertificationScheme(
  schemeId: string,
  body: CertificationSchemePatchBody,
): Promise<CertificationSchemeOut> {
  const id = schemeId.trim();
  const { data } = await api.patch<CertificationSchemeOut>(
    `/api/certification-schemes/${encodeURIComponent(id)}`,
    body,
  );
  return data;
}

export async function submitCertificationSchemeReview(schemeId: string): Promise<CertificationSchemeOut> {
  const id = schemeId.trim();
  const { data } = await api.post<CertificationSchemeOut>(
    `/api/certification-schemes/${encodeURIComponent(id)}/submit-review`,
  );
  return data;
}

export async function approveCertificationScheme(schemeId: string): Promise<CertificationSchemeOut> {
  const id = schemeId.trim();
  const { data } = await api.post<CertificationSchemeOut>(
    `/api/certification-schemes/${encodeURIComponent(id)}/approve`,
  );
  return data;
}

export async function activateCertificationScheme(schemeId: string): Promise<CertificationSchemeOut> {
  const id = schemeId.trim();
  const { data } = await api.post<CertificationSchemeOut>(
    `/api/certification-schemes/${encodeURIComponent(id)}/activate`,
  );
  return data;
}

export async function archiveCertificationScheme(
  schemeId: string,
  body?: { reason?: string | null },
): Promise<CertificationSchemeOut> {
  const id = schemeId.trim();
  const { data } = await api.post<CertificationSchemeOut>(
    `/api/certification-schemes/${encodeURIComponent(id)}/archive`,
    body ?? {},
  );
  return data;
}
