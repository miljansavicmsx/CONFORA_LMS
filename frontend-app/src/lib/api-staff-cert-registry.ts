/**
 * F5-UI-3 — Nest staff certificate registry (PostgreSQL tenant scope).
 */

import { api } from "@/lib/api";
import type { CertificateRegistryRow } from "@/lib/api-certificates";

export type NestCertificateRegistryItem = {
  readonly certificateId: string;
  readonly holderName: string;
  readonly certificateType: string;
  readonly status: string;
  readonly certificateNumber: string | null;
  readonly issuedAt: string | null;
  readonly expiresAt: string | null;
  readonly verificationHash: string | null;
  readonly linkedApplicationId: string | null;
  readonly pdfStorageKey: string | null;
  readonly learnerVerifyPath: string;
};

export type NestCertificateRegistryResponse = {
  readonly contractVersion: string;
  readonly registrySourceMode?: "dual" | "nest";
  readonly items: readonly NestCertificateRegistryItem[];
};

export type NestCertificateRegistryConfigResponse = {
  readonly contractVersion: string;
  readonly globalRegistrySourceMode?: "dual" | "nest";
  readonly tenantId?: string | null;
  readonly effectiveRegistrySourceMode?: "dual" | "nest";
  readonly policySource?: "tenant" | "global" | "default";
  /** F5-UI-8 — false when effective mode is nest (legacy read skipped in UI) */
  readonly legacyRegistryReadEnabled?: boolean;
  /** F5-UI-6 backward compat — mirrors effectiveRegistrySourceMode when present */
  readonly registrySourceMode: "dual" | "nest";
};

export function resolveNestEffectiveRegistryMode(
  config: NestCertificateRegistryConfigResponse,
): "dual" | "nest" {
  return config.effectiveRegistrySourceMode ?? config.registrySourceMode;
}

export async function fetchNestRegistryConfig(): Promise<NestCertificateRegistryConfigResponse> {
  const { data } = await api.get<NestCertificateRegistryConfigResponse>(
    "/v1/staff/certificates/registry-config",
  );
  return data;
}

export function mapNestRegistryItemToRow(item: NestCertificateRegistryItem): CertificateRegistryRow {
  const verifyHash = item.verificationHash?.trim() ?? "";
  return {
    certificateId: item.certificateId,
    holderName: item.holderName,
    certificateType: item.certificateType,
    status: item.status,
    issuedAt: item.issuedAt,
    expiresAt: item.expiresAt,
    verificationHash: item.verificationHash,
    linkedApplicationId: item.linkedApplicationId,
    learnerVerifyPath: item.learnerVerifyPath || (verifyHash ? `/verify/${verifyHash}` : ""),
    publicVerificationUrl: verifyHash ? `/verify/${verifyHash}` : null,
    certificateNumber: item.certificateNumber,
    pdfStorageKey: item.pdfStorageKey,
    registrySource: "nest",
  };
}

export async function fetchNestStaffCertificateRegistry(
  status?: string,
): Promise<CertificateRegistryRow[]> {
  const q = status?.trim() ? `?status=${encodeURIComponent(status.trim())}` : "";
  const { data } = await api.get<NestCertificateRegistryResponse>(
    `/v1/staff/certificates/registry${q}`,
  );
  const items = Array.isArray(data.items) ? data.items : [];
  return items.map(mapNestRegistryItemToRow);
}
