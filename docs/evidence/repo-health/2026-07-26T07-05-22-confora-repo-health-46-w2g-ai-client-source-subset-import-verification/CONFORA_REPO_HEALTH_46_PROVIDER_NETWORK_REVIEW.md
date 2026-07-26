# CONFORA REPO HEALTH 46 — Provider / Network Review

Scope: tracked files only (`package.json`, both tsconfigs, `src/index.ts`, `src/metadata.test.ts`).

## Module import inertness

| Check | Result |
|-------|--------|
| Provider initialization at import time | **none** |
| `fetch` at import time | **none** |
| Token retrieval at import time | **none** |
| `process.env` access | **none** (zero matches) |
| Import-time side effects | **none** — top level only builds zod schemas and two `ReadonlySet` constants |

`module_import_inert: true`

## Runtime network (explicit calls only)

Two call sites in `src/index.ts`, both behind exported functions:

| Site | Function | Path |
|------|----------|------|
| L123 | `invokeAiGateway` | `` `${parsed.baseUrl}/v1/ai/invoke` `` |
| L158 | `createAiGatewayClient().complete` (deprecated) | `` `${parsed.baseUrl}/v1/ai/complete` `` |

- Host/base URL: caller-injected via `AiGatewayClientConfig.baseUrl`, validated with `z.string().url()` before use.
- Paths: internal gateway only — `/v1/ai/invoke`, `/v1/ai/complete`.
- No hardcoded OpenAI / Anthropic / Ollama / vendor host.
- No provider SDK dependency (runtime dep is `zod` only; platform `fetch` used).
- No prompt construction / template rendering duplication (no `getPromptBundle` / `fillTemplate` / `ai-prompts` import).

`runtime_network_calls_internal_gateway_only: true`  
`hardcoded_provider_endpoint_found: false`  
`provider_sdk_coupling_found: false`

## Deferred hardening (does not block import)

Neither `fetch` sets a timeout or `AbortSignal`. A hung gateway would hang the caller.

- `fetch_timeout_abortsignal_missing: true`
- `fetch_timeout_abortsignal_blocks_import: false`

Track for post-import hardening when a real gateway caller is restored (RH43 remains blocked).
