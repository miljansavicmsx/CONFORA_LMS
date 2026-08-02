/**
 * Registers axios.defaults.adapter BEFORE `@/lib/api` is evaluated (phase 1 of Vitest setup).
 */

import axios from "axios";
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";

import { getConforaApiConfig } from "@/lib/api/api-config";
import { resolveLmsTestMock, warnUnmockedLmsApiOnce } from "@/test/lms-api-test-mock";

const xhrFallback = axios.getAdapter(["xhr"]) as AxiosAdapter;

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
    return xhrFallback(config);
  }

  if (!allowedOrigins().has(resolved.origin)) {
    return xhrFallback(config);
  }

  const method = String(config.method ?? "get");
  const path = resolved.pathname.replace(/\/+$/, "") || "/";

  const canned = resolveLmsTestMock(method, path);
  if (canned) {
    return axiosJsonResponse(config, canned.status, canned.data);
  }

  warnUnmockedLmsApiOnce(method.toUpperCase(), resolved.toString());
  return axiosJsonResponse(config, 404, { detail: "vitest-guard:not-found" });
}) as AxiosAdapter;
