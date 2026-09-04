# 04_CSP_SECURITY_REVIEW

## Restoration

- Disposition: `RESTORE_HISTORICAL_EXACT`
- Historical source: `a277a19fc5d835bdf069894ecf5cd38864ef3ea4`
- Blob verified identical in source commit `2b1399a6018843768404479fbff93abc93b7bbce`

## Scope and behavior

- Export: `cspPreviewPlugin`
- Vite hook used: `configurePreviewServer` only (preview-server scoped)
- Forced builder option: `isProd: true`
- Shared builder import: `../packages/config/csp/build-csp.mjs` (unmodified)
- Default mode: `process.env.CSP_MODE ?? 'report-only'`
- Nonce: `crypto.randomUUID()` per request; `x-nonce` response header; no static/secret nonce embedded
- Production browser runtime bundling of this plugin: none (preview middleware only)

## Required properties verified

- Current `frontend-app/vite.config.ts` loads the plugin (`confora-csp-preview` present)
- Forced `isProd: true` preserved
- Prod script-src path through existing builder uses nonce + `strict-dynamic` (no `unsafe-eval` on that path)
- Restored module source does not contain `unsafe-eval`
- No new connect-src widening beyond the existing shared builder
- `NEW_CSP_SECURITY_BLOCKER_COUNT` = 0
- `NEW_CSP_SECURITY_MAJOR_COUNT` = 0

## Known residuals (NOT remediated by this package)

### Majors (2)

1. Default Report-Only semantics (`CSP_MODE ?? 'report-only'`) — must not be described as enforcement by default.
2. Existing shared builder `connect-src` includes bare `https:`.

### Minors (2)

1. Unused local `NODE_ENV` read in historical plugin while forcing `isProd: true`.
2. Existing shared builder production `style-src` permits `'unsafe-inline'`.

These residuals are frozen historical / pre-existing shared-builder semantics. This package does **not** claim they are resolved.
