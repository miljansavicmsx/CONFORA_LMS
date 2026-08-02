import {
  getConforaApiConfig,
  joinBaseUrlAndPath,
  normalizeApiPath,
  type ApiProviderMode,
  type ConforaApiConfig,
} from "./api-config";
import { resolveOwnerForPath, type EndpointOwner } from "./endpoint-registry";

export type ResolvedApiTarget = {
  readonly baseUrl: string;
  readonly owner: EndpointOwner;
  readonly provider: ApiProviderMode;
  readonly path: string;
};

/** Resolve auth API base URL (hybrid stays legacy unless VITE_AUTH_PROVIDER=nest). */
export function resolveAuthApiBaseUrl(config: ConforaApiConfig = getConforaApiConfig()): string {
  if (config.provider === "nest") return config.nestBaseUrl;
  if (config.provider === "legacy") return config.legacyBaseUrl;
  return config.authProvider === "nest" ? config.nestBaseUrl : config.legacyBaseUrl;
}

export function resolveAuthApiTarget(): ResolvedApiTarget {
  const config = getConforaApiConfig();
  const baseUrl = resolveAuthApiBaseUrl(config);
  return {
    baseUrl,
    owner: baseUrl === config.nestBaseUrl ? "nest" : "legacy",
    provider: config.provider,
    path: "/auth",
  };
}

/** Base URL for a given provider mode (ignores path). */
export function resolveBaseUrlForProvider(
  provider: ApiProviderMode,
  config: ConforaApiConfig = getConforaApiConfig(),
): string {
  if (provider === "nest") return config.nestBaseUrl;
  return config.legacyBaseUrl;
}

/** Resolve base URL for a concrete API path under current env configuration. */
export function resolveApiBaseUrl(path?: string): string {
  const config = getConforaApiConfig();
  if (!path) {
    return resolveBaseUrlForProvider(config.provider === "nest" ? "nest" : "legacy", config);
  }
  const owner = resolveOwnerForPath(normalizeApiPath(path), config.provider);
  return owner === "nest" ? config.nestBaseUrl : config.legacyBaseUrl;
}

/** Full absolute URL for an API path. */
export function buildConforaApiUrl(path: string): string {
  const normalized = normalizeApiPath(path);
  return joinBaseUrlAndPath(resolveApiBaseUrl(normalized), normalized);
}

export function resolveApiTarget(path: string): ResolvedApiTarget {
  const config = getConforaApiConfig();
  const normalized = normalizeApiPath(path);
  const owner = resolveOwnerForPath(normalized, config.provider);
  const baseUrl = owner === "nest" ? config.nestBaseUrl : config.legacyBaseUrl;
  return {
    baseUrl,
    owner,
    provider: config.provider,
    path: normalized,
  };
}
