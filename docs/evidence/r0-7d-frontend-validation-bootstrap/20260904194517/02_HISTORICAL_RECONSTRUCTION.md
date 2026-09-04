# 02_HISTORICAL_RECONSTRUCTION

## Historical source commit

- SHA: `a277a19fc5d835bdf069894ecf5cd38864ef3ea4`
- Message context: `fix(frontend-app): restore tracked buildable source slice for a11y baseline (R0-7D2R)`
- Contained on: `remotes/origin/ci/r0-7d2-accessibility-baseline`
- Ancestor of integration head `32ac270e…`: **false**

## Restored exactly from historical blob

| Path                                              | Blob SHA (git hash-object)                 |
| ------------------------------------------------- | ------------------------------------------ |
| `frontend-app/vite-csp-preview.mjs`               | `855793bb3ed56e99d4f2219d4aacbf65658b89a0` |
| `frontend-app/src/test/vitest-resize-observer.ts` | `1630bd5f7564c6284c6207cc8f34b1d4017e6cec` |

Post-source-commit verification: both blobs still match historical exact content.

## Historical Axios / Fetch setup (NOT restored exact)

Historical files at `a277a19…` imported:

- `@/test/lms-api-test-mock` (absent on integration base)
- `@/lib/api-base-url` (absent on integration base; Fetch guard)

Exact historical restore would require path7+ outside the frozen six-path envelope and was therefore forbidden.

Historical Axios also used `xhrFallback` for non-allowed origins, which weakens fail-closed isolation relative to the adapted design.

## Why missing helpers remain outside scope

- `frontend-app/src/test/lms-api-test-mock.ts` — historical canned LMS mocks; not required for Vite/Vitest bootstrap load; would expand envelope and Model D / debt surface.
- `frontend-app/src/lib/api-base-url.ts` — superseded by current `getDefaultLegacyBaseUrl()` / `getConforaApiConfig()` in `@/lib/api/api-config`.

Adapted fail-closed Axios/Fetch use only existing dependencies: `axios`, `@/lib/api/api-config`, `@/lib/api`.
