# CONFORA REPO HEALTH 46 — Security / Privacy Review

## Scan command (tracked source scope)

```powershell
rg -n -i "accessToken|refreshToken|Authorization|Bearer|client_secret|api_key|sk-[A-Za-z0-9]{8,}|BEGIN PRIVATE KEY|https?://|localhost|process\.env|fetch\(|axios|WebSocket|openai|anthropic|ollama|AbortSignal|timeout|console\.(log|debug|info)" `
  packages/ai-client/package.json packages/ai-client/tsconfig.json packages/ai-client/tsconfig.build.json `
  packages/ai-client/src/index.ts packages/ai-client/src/metadata.test.ts
```

## Hits classification

| Line | Hit | Classification |
|------|-----|----------------|
| `src/index.ts:89` | `getAccessToken?: () => ...` | injected callback type (expected) |
| `src/index.ts:118` | `config.getAccessToken?.()` | injected token retrieval (expected) |
| `src/index.ts:120` | `Bearer ${token}` | header construction from injected token (expected) |
| `src/index.ts:123` | `fetch(.../v1/ai/invoke)` | internal gateway path (expected) |
| `src/index.ts:153` | `config.getAccessToken?.()` | injected token retrieval (expected) |
| `src/index.ts:155` | `Bearer ${token}` | header construction (expected) |
| `src/index.ts:158` | `fetch(.../v1/ai/complete)` | internal gateway path (expected) |

No hardcoded credentials, no `sk-…` keys, no private-key blocks, no `http://`/`https://`/`localhost` literals, no `process.env`, no axios/WebSocket/provider SDK, no `console.*` logging of prompts/user data.

## PII / tenant / workflow identifiers

```powershell
rg -n -i "tenantId|tenantName|certificateId|applicationId|ISSUED|ACTIVE|zalba|žalba|prigovor|recertification|certified|@[a-z0-9.-]+\.[a-z]{2,}|getPromptBundle|fillTemplate|ai-prompts" ...
```

Exit code 1 (no matches). `pii_tenant_findings: 0`.

## Results

| Metric | Value |
|--------|------:|
| `secret_pattern_hits` | 0 |
| `url_or_network_hits` | 0 (no hardcoded URL literals) |
| `runtime_secret_url_network_hits` | 0 |
| `credentials_committed` | false |

No credentials committed. Expected callback/Bearer/gateway-path hits are not secret material.
