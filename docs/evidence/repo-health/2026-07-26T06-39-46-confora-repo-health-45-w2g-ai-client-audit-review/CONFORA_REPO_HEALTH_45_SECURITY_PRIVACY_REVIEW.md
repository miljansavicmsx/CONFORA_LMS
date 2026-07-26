# CONFORA REPO HEALTH 45 — Security / Privacy Review

## Pattern scan

Command (source scope):

```powershell
rg -n -i "accessToken|refreshToken|Authorization|Bearer|client_secret|api_key|sk-[A-Za-z0-9]{8,}|BEGIN PRIVATE KEY|https?://|localhost|process\.env|fetch\(|axios|WebSocket|openai|anthropic|ollama|retry|timeout|console\.(log|debug|info)" `
  packages/ai-client/package.json packages/ai-client/tsconfig.json packages/ai-client/tsconfig.build.json `
  packages/ai-client/src/index.ts packages/ai-client/src/metadata.test.ts
```

All 7 hits, classified:

| Line | Hit | Classification |
|------|-----|----------------|
| `src/index.ts:89` | `getAccessToken?: () => Promise<string \| undefined>` | **false positive** — injected callback type, no credential material |
| `src/index.ts:118` | `const token = await config.getAccessToken?.()` | **false positive** — caller-provided token retrieval |
| `src/index.ts:120` | `headers['authorization'] = \`Bearer ${token}\`` | **false positive** — standard header construction from injected token |
| `src/index.ts:123` | `fetch(\`${parsed.baseUrl}/v1/ai/invoke\`)` | **runtime-active**, internal gateway path (no host literal) |
| `src/index.ts:153` | `const token = await config.getAccessToken?.()` | **false positive** |
| `src/index.ts:155` | `headers['authorization'] = \`Bearer ${token}\`` | **false positive** |
| `src/index.ts:158` | `fetch(\`${parsed.baseUrl}/v1/ai/complete\`)` | **runtime-active**, internal gateway path (no host literal) |

## Results

| Check | Result |
|-------|--------|
| Secrets / tokens / passwords / API keys committed | **0** |
| Hardcoded provider keys | **0** |
| `sk-…` / private key blocks | **0** |
| Hardcoded URLs / hosts / `localhost` | **0** (relative paths only) |
| `process.env` usage | **0** |
| Real PII (names, emails, phone numbers) | **0** |
| Tenant IDs / tenant names | **0** |
| Certificate / application IDs | **0** |
| Prompt or user-data logging | **0** — no `console.*`, no logger |
| Unsafe raw object injection into prompts | **0** — no prompt assembly in this package |

`secret_pattern_hits: 0` · `url_or_network_hits: 0` (no hardcoded URLs; the two `fetch` sites are counted as runtime-active internal gateway paths, not URL literals) · `pii_tenant_findings: 0`.

## URL / network hit classification

- runtime-active, internal gateway paths: **2**
- docs / example: 0
- test-only: 0
- false positives (token callback + Bearer header construction): 4

## Data-handling notes

- Request payloads are validated with `aiGatewayInvokeRequestSchema` before transmission; `input` is `z.record(z.string(), z.unknown())`, so **the caller is responsible for minimisation** of anything placed into `input`. This is the correct boundary for a transport client, but it means the gateway (server side) must remain the enforcement point for leakage prevention and disclosure — which is where RH42 already placed that duty.
- Responses are validated with `aiGatewayResponseSchema`, which requires `is_ai_generated: true`, `model`, `model_version`, `prompt_hash`, `response_hash` — AI traceability metadata is structurally mandatory rather than optional. This supports, and does not undermine, AI-governance auditability.
- Error messages include only the HTTP status (`AI Gateway request failed: 404`) — no body, no headers, no token echo.

## Conclusion

No credentials are present and none would be committed or proposed for import. `credentials_committed_or_proposed: false`. No security or privacy blocker for a source-subset import; enforcement duties (rate limiting, leakage prevention, audit write) remain server-side by design.
