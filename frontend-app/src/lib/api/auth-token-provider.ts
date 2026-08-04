/**
 * 028D-2aS2R — PERSISTED_AUTH_READ_BRIDGE
 *
 * Login persists Zustand state under localStorage key `confora-auth`.
 * The complaint HTTP stack must read that canonical blob without importing
 * authStore / RBAC / nest-auth-pilot.
 *
 * Refresh/clear updates the same `confora-auth` envelope only — no dual-write
 * to legacy `confora_access_token` / `confora_refresh_token` keys.
 */

export type AuthTokenPair = {
  readonly accessToken: string;
  readonly refreshToken: string;
};

/** Canonical Zustand persist key written by the login flow. */
export const PERSISTED_AUTH_STORAGE_KEY = "confora-auth";

type PersistedAuthState = {
  accessToken?: string | null;
  refreshToken?: string | null;
  isAuthenticated?: boolean;
  user?: unknown;
};

type PersistedAuthEnvelope = {
  state?: PersistedAuthState;
  version?: number;
};

function readEnvelope(): PersistedAuthEnvelope | null {
  try {
    const raw = localStorage.getItem(PERSISTED_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as PersistedAuthEnvelope;
  } catch {
    return null;
  }
}

function nonEmpty(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function writeEnvelope(next: PersistedAuthEnvelope): void {
  try {
    localStorage.setItem(PERSISTED_AUTH_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private mode */
  }
}

function patchPersistedTokens(patch: {
  readonly accessToken?: string | null;
  readonly refreshToken?: string | null;
  readonly clear?: boolean;
}): void {
  const current = readEnvelope() ?? { state: {}, version: 0 };
  const prevState = current.state && typeof current.state === "object" ? current.state : {};

  if (patch.clear) {
    writeEnvelope({
      ...current,
      state: {
        ...prevState,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      },
    });
    return;
  }

  const accessToken =
    patch.accessToken !== undefined ? patch.accessToken : (prevState.accessToken ?? null);
  const refreshToken =
    patch.refreshToken !== undefined ? patch.refreshToken : (prevState.refreshToken ?? null);
  const access = nonEmpty(accessToken);
  const refresh = nonEmpty(refreshToken);

  writeEnvelope({
    ...current,
    state: {
      ...prevState,
      accessToken: access,
      refreshToken: refresh,
      isAuthenticated: Boolean(access),
    },
  });
}

/**
 * Access token for API Authorization header.
 * Reads canonical login persistence (`confora-auth`) only.
 */
export function getAccessToken(): string | null {
  const envelope = readEnvelope();
  return nonEmpty(envelope?.state?.accessToken);
}

export function getRefreshToken(): string | null {
  const envelope = readEnvelope();
  return nonEmpty(envelope?.state?.refreshToken);
}

/**
 * Persist rotated token pair into the same `confora-auth` envelope login uses.
 * Does not write legacy dual-storage keys.
 */
export function setTokens(tokens: AuthTokenPair): void {
  patchPersistedTokens({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
}

export function setAccessToken(accessToken: string): void {
  patchPersistedTokens({ accessToken });
}

export function clearTokens(): void {
  patchPersistedTokens({ clear: true });
}

/** Keycloak and Cognito both use Bearer access_token in API calls. */
export function authorizationHeaderValue(): string | null {
  const token = getAccessToken();
  return token ? `Bearer ${token}` : null;
}
