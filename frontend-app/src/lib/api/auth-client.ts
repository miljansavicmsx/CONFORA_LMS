import axios from "axios";

import type { MePermissionsPayload } from "@/lib/permissions";
import type { User } from "@/types/lms-stores";

import { normalizeApiError, type NormalizedApiError } from "./api-error";
import { getConforaApiConfig, joinBaseUrlAndPath, parseAuthProviderMode, type AuthProviderMode } from "./api-config";
import { authorizationHeaderValue } from "./auth-token-provider";
import { resolveAuthApiBaseUrl } from "./api-provider";

export type AuthTokenResponse = {
  readonly access_token: string;
  readonly refresh_token?: string;
  readonly expires_in?: number;
  readonly token_type?: string;
};

export type AuthMeProfileRaw = {
  readonly sub?: string;
  readonly userId?: string;
  readonly user_id?: string;
  readonly email?: string | null;
  readonly fullName?: string | null;
  readonly full_name?: string | null;
  readonly role?: string;
  readonly roles?: readonly string[];
  readonly permissions?: readonly string[];
  readonly tenantId?: string | null;
  readonly tenant_id?: string | null;
  readonly preferredUsername?: string | null;
  readonly preferred_username?: string | null;
  readonly mfaVerified?: boolean;
  readonly mfa_verified?: boolean;
};

export type AuthClientResult<T> =
  | { readonly kind: "ok"; readonly data: T }
  | { readonly kind: "error"; readonly normalized: NormalizedApiError };

const AUTH_REFRESH_PATH = "/auth/refresh";
const AUTH_ME_PATH = "/auth/me";
const AUTH_PERMISSIONS_PATH = "/api/auth/me/permissions";

function authBaseUrl(): string {
  return resolveAuthApiBaseUrl();
}

function authUrl(path: string): string {
  return joinBaseUrlAndPath(authBaseUrl(), path);
}

/** Whether Nest-style JSON refresh body is used (nest provider or hybrid + VITE_AUTH_PROVIDER=nest). */
export function resolveAuthRefreshTransport(
  authProvider: AuthProviderMode = getConforaApiConfig().authProvider,
  apiProvider = getConforaApiConfig().provider,
): "json-body" | "bearer-header" {
  if (apiProvider === "nest") return "json-body";
  if (apiProvider === "hybrid" && authProvider === "nest") return "json-body";
  return "bearer-header";
}

/** Map Nest `/auth/me` (or legacy profile) to frontend `User` + extras. */
export function normalizeAuthProfile(raw: AuthMeProfileRaw): User & {
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
  readonly tenantId: string | null;
  readonly mfaVerified: boolean;
} {
  const userId = String(raw.userId ?? raw.user_id ?? raw.sub ?? "").trim();
  const email = String(raw.email ?? raw.preferredUsername ?? raw.preferred_username ?? "").trim();
  const fullName = String(raw.fullName ?? raw.full_name ?? "").trim();
  const role = String(raw.role ?? raw.roles?.[0] ?? "learner").trim() || "learner";
  const tenantId =
    typeof raw.tenant_id === "string" && raw.tenant_id.trim()
      ? raw.tenant_id.trim()
      : typeof raw.tenantId === "string" && raw.tenantId.trim()
        ? raw.tenantId.trim()
        : null;

  return {
    ...(userId ? { userId, id: userId } : {}),
    email: email || "—",
    ...(fullName ? { full_name: fullName } : {}),
    role,
    roles: Array.isArray(raw.roles) ? raw.roles : [],
    permissions: Array.isArray(raw.permissions) ? raw.permissions : [],
    tenantId,
    mfaVerified: Boolean(raw.mfaVerified ?? raw.mfa_verified),
  };
}

/** POST `/auth/login` — Keycloak password grant (Nest canonical). */
export async function loginWithPassword(
  email: string,
  password: string,
): Promise<AuthClientResult<AuthTokenResponse>> {
  const username = email.trim().toLowerCase();
  if (!username || !password) {
    return {
      kind: "error",
      normalized: { status: 0, code: "VALIDATION_ERROR", message: "missing_credentials" },
    };
  }

  try {
    const res = await axios.post<AuthTokenResponse>(
      authUrl("/auth/login"),
      { username, password },
      { headers: { Accept: "application/json", "Content-Type": "application/json" } },
    );
    return { kind: "ok", data: res.data };
  } catch (e) {
    return { kind: "error", normalized: normalizeApiError(e) };
  }
}

/** POST `/auth/refresh` — transport adapts to legacy Bearer vs Nest JSON body. */
export async function refresh(refreshToken: string): Promise<AuthClientResult<AuthTokenResponse>> {
  const token = refreshToken.trim();
  if (!token) {
    return {
      kind: "error",
      normalized: { status: 0, code: "VALIDATION_ERROR", message: "missing_refresh_token" },
    };
  }

  const transport = resolveAuthRefreshTransport();
  const url = authUrl(AUTH_REFRESH_PATH);

  try {
    const res =
      transport === "json-body"
        ? await axios.post<AuthTokenResponse>(
            url,
            { refresh_token: token },
            { headers: { Accept: "application/json", "Content-Type": "application/json" } },
          )
        : await axios.post<AuthTokenResponse>(
            url,
            {},
            {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          );

    return { kind: "ok", data: res.data };
  } catch (e) {
    return { kind: "error", normalized: normalizeApiError(e) };
  }
}

/** Normalize raw JWT or existing Bearer value for Authorization header. */
function bearerHeader(accessToken?: string): string | null {
  const fromArg = accessToken?.trim();
  if (fromArg) {
    return fromArg.startsWith("Bearer ") ? fromArg : `Bearer ${fromArg}`;
  }
  return authorizationHeaderValue();
}

/** GET `/auth/me` using optional explicit access token or store token. */
export async function getCurrentUser(accessToken?: string): Promise<AuthClientResult<ReturnType<typeof normalizeAuthProfile>>> {
  const bearer = bearerHeader(accessToken);
  if (!bearer) {
    return {
      kind: "error",
      normalized: { status: 401, code: "UNAUTHORIZED", message: "missing_access_token" },
    };
  }

  try {
    const res = await axios.get<AuthMeProfileRaw>(authUrl(AUTH_ME_PATH), {
      headers: { Accept: "application/json", Authorization: bearer },
    });
    return { kind: "ok", data: normalizeAuthProfile(res.data) };
  } catch (e) {
    return { kind: "error", normalized: normalizeApiError(e) };
  }
}

/** GET `/api/auth/me/permissions` — permissions snapshot for dashboard RBAC. */
export async function getCurrentUserPermissions(
  accessToken?: string,
): Promise<AuthClientResult<MePermissionsPayload>> {
  const bearer = bearerHeader(accessToken);
  if (!bearer) {
    return {
      kind: "error",
      normalized: { status: 401, code: "UNAUTHORIZED", message: "missing_access_token" },
    };
  }

  const config = getConforaApiConfig();
  const permissionsBase =
    config.provider === "nest" || (config.provider === "hybrid" && config.authProvider === "nest")
      ? config.nestBaseUrl
      : config.legacyBaseUrl;

  try {
    const res = await axios.get<MePermissionsPayload>(
      joinBaseUrlAndPath(permissionsBase, AUTH_PERMISSIONS_PATH),
      {
        headers: { Accept: "application/json", Authorization: bearer },
      },
    );
    return { kind: "ok", data: res.data };
  } catch (e) {
    return { kind: "error", normalized: normalizeApiError(e) };
  }
}

export {
  AUTH_ME_PATH,
  AUTH_PERMISSIONS_PATH,
  AUTH_REFRESH_PATH,
  parseAuthProviderMode,
};
