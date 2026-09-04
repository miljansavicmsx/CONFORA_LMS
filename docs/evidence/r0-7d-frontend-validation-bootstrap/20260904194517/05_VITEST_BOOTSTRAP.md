# 05_VITEST_BOOTSTRAP

## Active config

- Active Vitest config: `frontend-app/vite.config.ts`
- Environment: `jsdom`
- `setupFiles`:
  - `./src/test/vitest-resize-observer.ts`
  - `./src/test/vitest-axios-adapter.ts`
  - `./src/test/vitest-fetch-guard.ts`

## ResizeObserver

- Mode: historical exact restore
- Installs `ResizeObserver` only when `globalThis.ResizeObserver` is undefined
- Also polyfills `Element.prototype.scrollIntoView` when missing (historical)
- External dependency delta: 0

## Axios adapter

- Mode: `RESTORE_ADAPTED_FAIL_CLOSED`
- Patches `axios.defaults.adapter`
- Allowed origins: legacy + nest from `getConforaApiConfig()`
- Allowed-origin traffic: controlled 404 JSON (`vitest-guard:not-found`) — no real network
- Non-allowed origins: `Promise.reject` (no `xhrFallback`)
- Does not import missing `lms-api-test-mock` or `api-base-url`

## Fetch guard

- Mode: `RESTORE_ADAPTED_FAIL_CLOSED`
- API origin from `getDefaultLegacyBaseUrl()`
- Primes `@/lib/api` so axios instances inherit defaults
- API-origin fetches: controlled 404 JSON — no real API network
- Non-API origins: `originalFetch` (jsdom/static assets)
- Does not import missing historical helpers

## Proof

- Vite `loadConfigFromFile` → PASS; plugin + setupFiles present
- Dedicated bootstrap tests (7 assertions across 2 files) → PASS under default config
- `AXIOS_TEST_NETWORK_FAIL_CLOSED` = true
- `FETCH_TEST_NETWORK_FAIL_CLOSED` = true
- `TEST_BOOTSTRAP_NETWORK_ISOLATION_WEAKENED` = false
- `TEST_BOOTSTRAP_GLOBAL_STATE_LEAK_RISK_UNCONTROLLED` = false
