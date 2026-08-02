import {
  clearAuthTokens as clearLegacyStorageTokens,
  getAccessToken as getLegacyStorageAccessToken,
  getRefreshToken as getLegacyStorageRefreshToken,
  setAuthTokens as setLegacyStorageTokens,
} from "@/lib/auth-storage";
import { useAuthStore } from "@/stores/authStore";

export type AuthTokenPair = {
  readonly accessToken: string;
  readonly refreshToken: string;
};

/**
 * Access token for API Authorization header.
 * Prefers in-memory Zustand store (login session), then legacy localStorage keys.
 */
export function getAccessToken(): string | null {
  const fromStore = useAuthStore.getState().accessToken;
  if (fromStore) return fromStore;
  return getLegacyStorageAccessToken();
}

export function getRefreshToken(): string | null {
  const fromStore = useAuthStore.getState().refreshToken;
  if (fromStore) return fromStore;
  return getLegacyStorageRefreshToken();
}

export function setTokens(tokens: AuthTokenPair): void {
  useAuthStore.getState().login({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });
  setLegacyStorageTokens(tokens.accessToken, tokens.refreshToken);
}

export function setAccessToken(accessToken: string): void {
  useAuthStore.getState().setAccessToken(accessToken);
  const refresh = getRefreshToken();
  if (refresh) {
    setLegacyStorageTokens(accessToken, refresh);
  }
}

export function clearTokens(): void {
  useAuthStore.getState().logout();
  clearLegacyStorageTokens();
}

/** Keycloak and Cognito both use Bearer access_token in API calls. */
export function authorizationHeaderValue(): string | null {
  const token = getAccessToken();
  return token ? `Bearer ${token}` : null;
}
