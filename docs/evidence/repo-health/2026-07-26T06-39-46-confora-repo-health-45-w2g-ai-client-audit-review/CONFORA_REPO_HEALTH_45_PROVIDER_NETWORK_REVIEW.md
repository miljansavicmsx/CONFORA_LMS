# CONFORA REPO HEALTH 45 — Provider / Network Review

Scope: `package.json`, both tsconfigs, `src/index.ts`, `src/metadata.test.ts` (canonical source scope). Generated artifacts reviewed separately.

## Capability matrix

| Capability | Present | Evidence |
|------------|:-------:|----------|
| External provider clients (OpenAI / Anthropic / local model) | **no** | zero matches for `openai`, `anthropic`, `ollama` in source or manifest |
| SDK wrappers | **no** | no provider SDK dependency; only `zod` |
| API client to internal CONFORA gateway | **yes** | `invokeAiGateway`, `createAiGatewayClient` |
| `fetch` calls | **yes (2)** | `src/index.ts:123`, `src/index.ts:158` |
| `axios` / `WebSocket` / GraphQL | **no** | zero matches |
| `process.env` usage | **no** | zero matches — base URL is injected via `AiGatewayClientConfig` |
| Hardcoded endpoints | **no** | only relative paths `/v1/ai/invoke`, `/v1/ai/complete`; host comes from caller-supplied `baseUrl` |
| Prompt construction / templating | **no** | no template filling; `input` is passed through as an opaque record |
| Tool calling / function calling | **no** | no tool schemas or handlers |
| Retry / timeout / abort | **no** | see finding below |
| Logging of prompts or user inputs | **no** | no `console.*`, no logger; errors carry only HTTP status |

## The two network call sites

```typescript
// packages/ai-client/src/index.ts — invokeAiGateway
const response = await fetch(`${parsed.baseUrl}/v1/ai/invoke`, {
  method: 'POST',
  headers,
  body: JSON.stringify(body),
});
```

```typescript
// packages/ai-client/src/index.ts — createAiGatewayClient().complete (deprecated)
const response = await fetch(`${parsed.baseUrl}/v1/ai/complete`, {
  method: 'POST',
  headers,
  body: JSON.stringify(body),
});
```

Both target the **internal** AI Gateway in `apps/api`, never a vendor endpoint. `baseUrl` is validated with `z.string().url()` before use. The bearer token, when present, comes from an injected `getAccessToken()` callback; the package never reads, stores, or persists credentials. The file documents the intent: *"Invoke the centralized AI Gateway (ISO §6.5 — no direct vendor calls)."*

## Inert vs. runtime-active

- **Module import:** inert. Top level only builds zod schemas and two `ReadonlySet` constants. No file system access, no network, no env reads, no timers, no singletons, no side-effectful registration.
- **Function call:** runtime-active. `invokeAiGateway` / `complete` issue a POST — but only when a caller supplies a `baseUrl` and invokes them. No tracked source currently calls them (RH43A: `apps/api` AI source is absent), so importing the package activates nothing.
- **Provider activation:** impossible from this package alone; it has no vendor credentials, no vendor endpoints, and no vendor SDK.

## Findings

1. **No timeout / abort signal on either `fetch`** — a hung gateway would hang the caller indefinitely. Robustness gap, classified DEFER (hardening note, not an import blocker, and it belongs with the gateway wave that will actually call these functions).
2. `createAiGatewayClient` is explicitly `@deprecated` in favour of `invokeAiGateway`, but is still exported. Keeping it preserves compatibility with the (currently absent) gateway callers; removal should be decided in the gateway wave, not here.

## Conclusions

- **provider_or_network_behavior:** internal gateway client only; runtime-active on call; **no import-time side effects**.
- **import_time_side_effects:** false.
- **safe_to_import_without_activating_provider_calls:** true.
