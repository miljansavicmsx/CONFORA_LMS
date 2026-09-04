/**
 * Vitest fetch guard — adapted fail-closed bootstrap (R0-7D FEVB).
 *
 * Uses current api-config only. Configured LMS/API-origin fetches never reach
 * the network.
 */

import { getDefaultLegacyBaseUrl } from "@/lib/api/api-config";

import "@/lib/api";

const apiOrigin = new URL(getDefaultLegacyBaseUrl()).origin;

function parseFetchUrl(input: RequestInfo | URL): URL | null {
  try {
    if (input instanceof URL) {
      return input;
    }
    if (typeof input === "string") {
      return input.startsWith("http://") || input.startsWith("https://")
        ? new URL(input)
        : new URL(input, apiOrigin);
    }
    return new URL(input.url);
  } catch {
    return null;
  }
}

const originalFetch = globalThis.fetch.bind(globalThis);

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const resolved = parseFetchUrl(input);
  if (!resolved) {
    throw new Error("vitest-fetch-guard:unresolvable-url");
  }
  if (resolved.origin !== apiOrigin) {
    return originalFetch(input, init);
  }

  return Response.json({ detail: "vitest-fetch-guard:not-found" }, { status: 404 });
};
