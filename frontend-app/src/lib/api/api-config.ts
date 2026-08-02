/** Canonical API provider mode (see P0_CANONICAL_API_CUTOVER_PLAN.md). */
export type ApiProviderMode = "legacy" | "nest" | "hybrid";

/** Optional auth stack override in hybrid mode (`legacy` default until P0-E cutover). */
export type AuthProviderMode = "legacy" | "nest";

const DEFAULT_LEGACY = "http://127.0.0.1:8000";
const DEFAULT_NEST = "http://localhost:4000";

function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function readEnvString(key: string): string | undefined {
  const raw = import.meta.env[key];
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseApiProviderMode(raw: string | undefined): ApiProviderMode {
  const v = (raw ?? "legacy").trim().toLowerCase();
  if (v === "nest" || v === "canonical") return "nest";
  if (v === "hybrid") return "hybrid";
  return "legacy";
}

export function parseAuthProviderMode(raw: string | undefined): AuthProviderMode {
  const v = (raw ?? "legacy").trim().toLowerCase();
  if (v === "nest" || v === "keycloak" || v === "canonical") return "nest";
  return "legacy";
}

export type ConforaApiConfig = {
  readonly legacyBaseUrl: string;
  readonly nestBaseUrl: string;
  readonly provider: ApiProviderMode;
  readonly authProvider: AuthProviderMode;
};

/** Resolved API environment (no side effects). */
export function getConforaApiConfig(): ConforaApiConfig {
  const legacyFromEnv =
    readEnvString("VITE_LEGACY_API_URL") ?? readEnvString("VITE_API_URL") ?? DEFAULT_LEGACY;
  const nestFromEnv = readEnvString("VITE_CONFORA_API_URL") ?? DEFAULT_NEST;
  const provider = parseApiProviderMode(readEnvString("VITE_API_PROVIDER"));
  const authProvider = parseAuthProviderMode(readEnvString("VITE_AUTH_PROVIDER"));

  return {
    legacyBaseUrl: trimTrailingSlash(legacyFromEnv),
    nestBaseUrl: trimTrailingSlash(nestFromEnv),
    provider,
    authProvider,
  };
}

/**
 * Default base URL for backward-compatible exports (`API_BASE_URL`).
 * Always the legacy stack URL so existing single-URL assumptions remain valid in legacy mode.
 */
export function getDefaultLegacyBaseUrl(): string {
  return getConforaApiConfig().legacyBaseUrl;
}

export function normalizeApiPath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export function joinBaseUrlAndPath(baseUrl: string, path: string): string {
  return `${trimTrailingSlash(baseUrl)}${normalizeApiPath(path)}`;
}
