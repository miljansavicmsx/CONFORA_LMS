/**
 * Phase 2: prime shared api module (axios instances inherit defaults.adapter),
 * then replace global fetch for LMS origin (SSE/chat + CSV exports + JSON).
 */

import { API_BASE_URL } from "@/lib/api-base-url";
import { resolveLmsTestMock, warnUnmockedLmsApiOnce } from "@/test/lms-api-test-mock";

import "@/lib/api";

const apiOrigin = new URL(API_BASE_URL).origin;

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

function readAcceptHeader(init?: RequestInit): string {
  const h = init?.headers;
  if (!h) {
    return "";
  }
  if (h instanceof Headers) {
    return h.get("accept") ?? "";
  }
  if (Array.isArray(h)) {
    const row = h.find(([k]) => k.toLowerCase() === "accept");
    return row ? String(row[1]) : "";
  }
  const o = h as Record<string, string>;
  return o.Accept ?? o.accept ?? "";
}

const originalFetch = globalThis.fetch.bind(globalThis);

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const resolved = parseFetchUrl(input);
  if (!resolved) {
    return originalFetch(input, init);
  }
  if (resolved.origin !== apiOrigin) {
    return originalFetch(input, init);
  }

  const method = (init?.method ?? "GET").toUpperCase();
  const path = resolved.pathname.replace(/\/+$/, "") || "/";

  const accept = readAcceptHeader(init);
  if (
    accept.includes("text/event-stream") &&
    method === "POST" &&
    (path === "/ai-tutor/chat" || /\/api\/roleplay\/sessions\/.+\/chat$/.test(path))
  ) {
    const sse =
      path === "/ai-tutor/chat"
        ? 'data: {"text":"vitest"}\ndata: [DONE]\n\n'
        : "data: [DONE]\n\n";
    return new Response(sse, {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const canned = resolveLmsTestMock(method, path);
  if (!canned) {
    warnUnmockedLmsApiOnce(method, resolved.toString());
    return Response.json({ detail: "vitest-fetch-guard:not-found" }, { status: 404 });
  }

  return Response.json(canned.data, { status: canned.status });
};
