import { useAuthStore } from "@/stores/authStore";

export type AuthTokenPair = {
  readonly accessToken: string;
  readonly refreshToken: string;
};

/** R0-7D2S2: minimal legacy storage (avoids out-of-manifest auth-storage.ts). */
const ACCESS_KEY = "confora_access_token";
const REFRESH_KEY = "confora_refresh_token";

function getLegacyStorageAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

function getLegacyStorageRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

function setLegacyStorageTokens(accessToken: string, refreshToken: string): void {
  try {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  } catch {
    /* ignore */
  }
}

function clearLegacyStorageTokens(): void {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* ignore */
  }
}

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
