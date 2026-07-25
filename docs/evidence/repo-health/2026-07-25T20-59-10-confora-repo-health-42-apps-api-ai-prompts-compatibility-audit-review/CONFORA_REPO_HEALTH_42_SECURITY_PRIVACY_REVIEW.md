# CONFORA REPO HEALTH 42 — Security / Privacy Review

## Scope

AI gateway / prompt-selection related apps/api files (and documented provider boundary).

## Secrets / tokens

| Hit | Classification |
|-----|----------------|
| `process.env['OPENAI_API_KEY']` / `ANTHROPIC_API_KEY` + `Bearer` in provider routing / embeddings | Expected env-based provider auth — **not** hardcoded secrets |
| `@ApiBearerAuth()` on controller | Swagger auth annotation |
| `tenantId: requireActiveTenantIdFromAls()` | Runtime tenant from ALS — not hardcoded PII |

## Findings counts

| Metric | Value |
|--------|-------|
| secret_pattern_hits (hardcoded secrets) | **0** |
| pii_tenant_findings (real PII / hard tenant IDs) | **0** |
| security_privacy_findings | **0** |

## Prompt interpolation notes

- `inputToTemplateVars` stringifies non-string values via `JSON.stringify` then `fillTemplate` (string-only).  
- Objects are not passed as raw SafeString/HTML into templates.  
- Course-authoring embeds `topic` / video URL into `user_message` strings (application content, not package secret).

## Network / provider boundary (document only)

`ai-provider.routing.ts` may call OpenAI / Anthropic / Ollama when keys set; stubs otherwise. Out of scope to modify; relevant only as existing gateway boundary after messages are built.
