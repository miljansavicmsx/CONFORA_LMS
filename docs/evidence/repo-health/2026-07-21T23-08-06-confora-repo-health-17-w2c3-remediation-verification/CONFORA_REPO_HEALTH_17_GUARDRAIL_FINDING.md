# CONFORA-REPO-HEALTH-17 — Guardrail finding

**Transparent finding:** Initial W2C-3 content did **not** fully meet the inert-placeholder bar used for conditional GO.

## Commit under review

`19cb3317` — `packages/sdk/src/index.ts` (schema stub was already empty `paths`)

## Detected issue

| Issue ID | `runtime_fetch_openapi_placeholder_client` |
|----------|--------------------------------------------|
| Runtime `fetch(...)` | **present** |
| `baseUrl` runtime Zod config | **present** |
| Network path `/openapi/json` | **present** |
| Hardcoded `http(s)://` URL | absent |
| Authorization / token provider | absent |
| axios | absent |

## Why this matters

A “source stub” import wave was expected to avoid **runtime network/transport** behavior. Fetching OpenAPI JSON at runtime from a configured `baseUrl` is placeholder client behavior beyond an inert type export.

## Disposition

Corrected by follow-up remediation commit `a849dfbb` (W2C-3R). Not hidden; not claimed as initially fully inert.

| Field | Value |
|-------|-------|
| `initial_w2c3_guardrail_issue_detected` | **true** |
| `initial_w2c3_guardrail_issue` | `runtime_fetch_openapi_placeholder_client` |
