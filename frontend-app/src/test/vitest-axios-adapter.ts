/**
 * Vitest axios adapter — adapted fail-closed bootstrap (R0-7D FEVB).
 *
 * Uses only existing dependencies. Never falls back to real XHR for any origin.
 */

import axios from "axios";
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";

import { getConforaApiConfig } from "@/lib/api/api-config";

function allowedOrigins(): Set<string> {
  const { legacyBaseUrl, nestBaseUrl } = getConforaApiConfig();
  return new Set([new URL(legacyBaseUrl).origin, new URL(nestBaseUrl).origin]);
}

function axiosJsonResponse<T>(
  config: InternalAxiosRequestConfig,
  status: number,
  data: T,
): Promise<AxiosResponse<T>> {
  return Promise.resolve({
    config,
    data,
    headers: {},
    status,
    statusText: status >= 400 ? "Error" : "OK",
  } as AxiosResponse<T>);
}

axios.defaults.adapter = ((config: InternalAxiosRequestConfig) => {
  let resolved: URL;
  try {
    resolved = new URL(axios.getUri(config));
  } catch {
    return Promise.reject(new Error("vitest-axios-adapter:unresolvable-uri"));
  }

  if (!allowedOrigins().has(resolved.origin)) {
    return Promise.reject(
      new Error(`vitest-axios-adapter:blocked-origin:${resolved.origin}`),
    );
  }

  return axiosJsonResponse(config, 404, { detail: "vitest-guard:not-found" });
}) as AxiosAdapter;
