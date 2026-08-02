import {
  clearAuthTokens as clearLegacyStorageTokens,
  getAccessToken as getLegacyStorageAccessToken,
  getRefreshToken as getLegacyStorageRefreshToken,
  setAuthTokens as setLegacyStorageTokens,
} from "@/lib/auth-storage";

export type AuthTokenPair = {
  readonly accessToken: string;
  readonly refreshToken: string;
};

/**
 * 028D-2aS2: storage-backed tokens only.
 * Avoids pulling authStore → content-editor-access (RBAC overreach outside the
 * owner-authorized complaint promote ceiling).
 */
export function getAccessToken(): string | null {
  return getLegacyStorageAccessToken();
}

export function getRefreshToken(): string | null {
  return getLegacyStorageRefreshToken();
}

export function setTokens(tokens: AuthTokenPair): void {
  setLegacyStorageTokens(tokens.accessToken, tokens.refreshToken);
}

export function setAccessToken(accessToken: string): void {
  const refresh = getRefreshToken();
  if (refresh) {
    setLegacyStorageTokens(accessToken, refresh);
  }
}

export function clearTokens(): void {
  clearLegacyStorageTokens();
}

/** Keycloak and Cognito both use Bearer access_token in API calls. */
export function authorizationHeaderValue(): string | null {
  const token = getAccessToken();
  return token ? `Bearer ${token}` : null;
}
