/**
 * Browser sessions do not persist access or refresh tokens.
 * Any leftover login envelope is removed. API calls use the httpOnly session cookie.
 */

export type AuthTokenPair = {
  readonly accessToken: string;
  readonly refreshToken: string;
};

export const PERSISTED_AUTH_STORAGE_KEY = "confora-auth";

const LEGACY_KEYS = [PERSISTED_AUTH_STORAGE_KEY, "confora_access_token", "confora_refresh_token"] as const;

function removeKey(storage: Storage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    /* private mode */
  }
}

export function purgePersistedAuthSecrets(): void {
  if (typeof localStorage === "undefined") return;
  for (const key of LEGACY_KEYS) {
    removeKey(localStorage, key);
    removeKey(sessionStorage, key);
  }
}

export function getAccessToken(): string | null {
  purgePersistedAuthSecrets();
  return null;
}

export function getRefreshToken(): string | null {
  purgePersistedAuthSecrets();
  return null;
}

export function setTokens(_tokens: AuthTokenPair): void {
  purgePersistedAuthSecrets();
}

export function setAccessToken(_accessToken: string): void {
  purgePersistedAuthSecrets();
}

export function clearTokens(): void {
  purgePersistedAuthSecrets();
}

export function authorizationHeaderValue(): string | null {
  purgePersistedAuthSecrets();
  return null;
}
