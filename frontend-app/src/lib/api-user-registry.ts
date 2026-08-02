/**
 * §12.1 — prošireni korisnički registar (SysAdmin + self-service profil).
 * Registry routes always target legacy FastAPI (not Nest) in hybrid/nest pilot.
 */

import axios, { type AxiosInstance } from "axios";

import { getConforaApiConfig } from "@/lib/api/api-config";
import { authorizationHeaderValue } from "@/lib/api/auth-token-provider";

export type IdentityVerificationStatus = "none" | "pending" | "verified" | "rejected";

export type UserRegistryRow = {
  readonly userId: string;
  readonly email: string;
  readonly fullName?: string | null;
  readonly role: string;
  readonly phone?: string | null;
  readonly nationalId?: string | null;
  readonly jobTitle?: string | null;
  readonly educationLevel?: string | null;
  readonly organizationId?: string | null;
  readonly organizationName?: string | null;
  readonly identityVerificationStatus: IdentityVerificationStatus;
  readonly identityNotes?: string | null;
  readonly identityDocumentIdKey?: string | null;
  readonly identityDocumentDiplomaKey?: string | null;
  readonly updatedAt?: string | null;
};

export type UserRegistryListResponse = {
  readonly items: readonly UserRegistryRow[];
  readonly nextCursor: string | null;
};

export type OrganizationRow = {
  readonly organizationId: string;
  readonly legalName: string;
  readonly registrationNumber?: string | null;
  readonly country?: string | null;
  readonly createdAt?: string | null;
};

let legacyRegistryClient: AxiosInstance | null = null;

function registryClient(): AxiosInstance {
  if (!legacyRegistryClient) {
    const { legacyBaseUrl } = getConforaApiConfig();
    legacyRegistryClient = axios.create({
      baseURL: legacyBaseUrl,
      timeout: 10_000,
    });
    legacyRegistryClient.interceptors.request.use((config) => {
      const auth = authorizationHeaderValue();
      if (auth) {
        config.headers.Authorization = auth;
      }
      return config;
    });
  }
  return legacyRegistryClient;
}

export async function fetchRegistryUsers(params: {
  readonly limit?: number;
  readonly cursor?: string;
}): Promise<UserRegistryListResponse> {
  const { data } = await registryClient().get<UserRegistryListResponse>("/api/admin/user-registry/users", {
    params: {
      limit: params.limit ?? 40,
      ...(params.cursor ? { cursor: params.cursor } : {}),
    },
  });
  return {
    items: Array.isArray(data.items) ? data.items : [],
    nextCursor: data.nextCursor ?? null,
  };
}

export async function patchRegistryUser(
  userId: string,
  body: Partial<{
    fullName: string;
    role: string;
    phone: string | null;
    nationalId: string | null;
    jobTitle: string | null;
    educationLevel: string | null;
    organizationId: string | null;
    identityVerificationStatus: IdentityVerificationStatus;
    identityNotes: string | null;
    identityDocumentIdKey: string | null;
    identityDocumentDiplomaKey: string | null;
  }>,
): Promise<UserRegistryRow> {
  const { data } = await registryClient().patch<UserRegistryRow>(
    `/api/admin/user-registry/users/${encodeURIComponent(userId)}`,
    body,
  );
  return data;
}

export async function fetchOrganizations(): Promise<readonly OrganizationRow[]> {
  const { data } = await registryClient().get<{ items: OrganizationRow[] }>(
    "/api/admin/user-registry/organizations",
  );
  return Array.isArray(data.items) ? data.items : [];
}

export async function createOrganization(body: {
  legalName: string;
  registrationNumber?: string;
  country?: string;
}): Promise<OrganizationRow> {
  const { data } = await registryClient().post<OrganizationRow>(
    "/api/admin/user-registry/organizations",
    body,
  );
  return data;
}

export async function fetchMyRegistryProfile(): Promise<UserRegistryRow> {
  const { data } = await registryClient().get<UserRegistryRow>("/api/me/registry-profile");
  return data;
}

export async function patchMyRegistryProfile(body: {
  phone?: string | null;
  nationalId?: string | null;
  jobTitle?: string | null;
  educationLevel?: string | null;
}): Promise<UserRegistryRow> {
  const { data } = await registryClient().patch<UserRegistryRow>("/api/me/registry-profile", body);
  return data;
}
