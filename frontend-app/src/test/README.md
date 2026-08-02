# Frontend-app test network isolation (Vitest)

Vitest runs in **jsdom** with the same `VITE_API_URL` / `127.0.0.1:8000` defaults as local dev. Components that call **axios** still use the browser **XMLHttpRequest** adapter, which attempted real TCP connections before this guard.

## How it works

1. **`src/test/vitest-axios-adapter.ts`** — runs first (`setupFiles`) and assigns `axios.defaults.adapter` to a small in-process handler. Any request whose URL origin matches `API_BASE_URL` is satisfied from `resolveLmsTestMock()` (or a **synthetic 404 JSON** with one `console.warn` for the first unhandled LMS URL in the worker).
2. **`src/test/vitest-fetch-guard.ts`** — runs second, `import "@/lib/api"` so `axios.create()` instances pick up the patched default adapter, then wraps `globalThis.fetch` for the same API origin (JSON, CSV export blob, SSE stubs for tutor/roleplay chat).

Traffic to **other origins** still uses axios XHR fallback or native `fetch` (e.g. third-party URLs).

## Adding endpoint-specific mocks

Edit **`src/test/lms-api-test-mock.ts`** and add an entry keyed by **`METHOD` + pathname** (`resolved.pathname`, no hostname). Prefer **minimal valid JSON** (empty arrays, `{ valid: false }`, etc.) — not fictional business narratives.

Tests that rely on richer shapes should keep **local `vi.mock("@/lib/...")`** for that module rather than stuffing large payloads into the global table.

## Rules

- **No real LMS HTTP** to `localhost:8000` / `127.0.0.1:8000` (or whatever `API_BASE_URL` resolves to in tests) unless you intentionally bypass this layer (avoid in CI).
- Unhandled LMS paths yield **404** + **single** aggregated warning (`Test intercepted unmocked API request: …`).
- Production, `npm run dev`, and `npm run build` never import these files.

## See also

- [FRONTEND_TEST_NETWORK_MOCKING.md](../../docs/FRONTEND_TEST_NETWORK_MOCKING.md) — project-level guide
