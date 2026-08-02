import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

import { refreshAccessToken } from "@/lib/auth-refresh";

import { resolveApiBaseUrl, resolveApiTarget } from "./api-provider";
import { authorizationHeaderValue, clearTokens, getRefreshToken, setAccessToken } from "./auth-token-provider";
import { normalizeApiError } from "./api-error";
import { getDefaultLegacyBaseUrl } from "./api-config";

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const FORBIDDEN_TENANT_BODY_KEYS = new Set(["tenant_id", "tenantId"]);
const FORBIDDEN_TENANT_QUERY_KEYS = new Set(["tenant_id", "tenantId"]);

let refreshAccessPromise: Promise<string> | null = null;

async function refreshAccessTokenOnce(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("no_refresh_token");
  }
  const access = await refreshAccessToken(refreshToken);
  setAccessToken(access);
  return access;
}

function getSharedRefreshPromise(): Promise<string> {
  if (!refreshAccessPromise) {
    refreshAccessPromise = refreshAccessTokenOnce().finally(() => {
      refreshAccessPromise = null;
    });
  }
  return refreshAccessPromise;
}

function stripTenantFromQueryParams(config: InternalAxiosRequestConfig): void {
  if (!config.params || typeof config.params !== "object") return;
  const params = { ...(config.params as Record<string, unknown>) };
  for (const key of FORBIDDEN_TENANT_QUERY_KEYS) {
    delete params[key];
  }
  config.params = params;
}

function stripTenantFromJsonBody(config: InternalAxiosRequestConfig): void {
  const data = config.data;
  if (!data || typeof data !== "object" || data instanceof FormData) return;
  if (Array.isArray(data)) return;
  const body = { ...(data as Record<string, unknown>) };
  let changed = false;
  for (const key of FORBIDDEN_TENANT_BODY_KEYS) {
    if (key in body) {
      delete body[key];
      changed = true;
    }
  }
  if (changed) {
    config.data = body;
  }
}

function applyAuthHeader(config: InternalAxiosRequestConfig): void {
  const auth = authorizationHeaderValue();
  config.headers = config.headers ?? {};
  if (auth) {
    config.headers.Authorization = auth;
  } else if ("Authorization" in config.headers) {
    delete config.headers.Authorization;
  }
}

function applyDynamicBaseUrl(config: InternalAxiosRequestConfig): void {
  const url = String(config.url ?? "");
  const pathOnly = url.startsWith("http") ? new URL(url).pathname : url;
  config.baseURL = resolveApiBaseUrl(pathOnly);
}

function attachRequestPolicies(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  applyDynamicBaseUrl(config);
  stripTenantFromQueryParams(config);
  stripTenantFromJsonBody(config);
  applyAuthHeader(config);
  return config;
}

function isAuthPath(url: string): boolean {
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/mfa")
  );
}

function createConforaHttpClient(): AxiosInstance {
  const client = axios.create({
    baseURL: getDefaultLegacyBaseUrl(),
    headers: { "Content-Type": "application/json" },
    maxBodyLength: 12 * 1024 * 1024,
    maxContentLength: 12 * 1024 * 1024,
  });

  client.interceptors.request.use((config) => attachRequestPolicies(config));

  client.interceptors.response.use(
    (res) => res,
    async (err: unknown) => {
      if (!axios.isAxiosError(err) || !err.config) {
        return Promise.reject(normalizeApiError(err));
      }

      const status = err.response?.status;
      const original = err.config as RetryConfig;
      const url = String(original.url ?? "");

      if (status !== 401) {
        return Promise.reject(normalizeApiError(err));
      }

      if (isAuthPath(url)) {
        clearTokens();
        return Promise.reject(normalizeApiError(err));
      }

      if (original._retry) {
        clearTokens();
        return Promise.reject(normalizeApiError(err));
      }

      if (!getRefreshToken()) {
        clearTokens();
        return Promise.reject(normalizeApiError(err));
      }

      try {
        await getSharedRefreshPromise();
        original._retry = true;
        applyAuthHeader(original);
        return client(original);
      } catch {
        clearTokens();
        return Promise.reject(normalizeApiError(err));
      }
    },
  );

  return client;
}

let sharedClient: AxiosInstance | null = null;

/** Singleton axios client with provider-aware base URL and auth interceptors. */
export function getHttpClient(): AxiosInstance {
  if (!sharedClient) {
    sharedClient = createConforaHttpClient();
  }
  return sharedClient;
}

/** Test-only reset (Vitest). */
export function resetHttpClientForTests(): void {
  sharedClient = null;
  refreshAccessPromise = null;
}

export { resolveApiTarget, resolveApiBaseUrl, buildConforaApiUrl } from "./api-provider";
