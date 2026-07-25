# CONFORA-REPO-HEALTH-39 — Security / Privacy Review

## Secret / URL / network scan (9 source files)

Patterns: tokens, passwords, API keys, `http(s)://`, `localhost`, `fetch`/`axios`/`WebSocket`/`GraphQL`, `process.env`, etc.

| Metric | Value |
|--------|------:|
| `secret_pattern_hits` | **0** |
| `url_or_network_hits` | **0** (runtime) |

Non-finding: `tsconfig.json` `$schema` → `https://json.schemastore.org/tsconfig` (editor metadata only).

## PII / tenant

No real names, emails, phones, certificate/application/tenant IDs, or pasted credentials. Placeholders only (`{{user_message}}`, `{{context}}`, `{{blueprint}}`, `{{audit_events_last_30d}}`, etc.).

`pii_tenant_findings: 0`

## Risky operational behavior in `src/index.ts`

| Behavior | Present? | Notes |
|----------|----------|-------|
| fetch/axios/WebSocket/GraphQL | **no** | |
| process.env | **no** | |
| Filesystem **read** | **yes** | `readFileSync` at **module import time** for all prompts |
| Filesystem write | **no** | |
| Shell / eval / Function | **no** | |
| Hardcoded provider credentials | **no** | |
| External AI provider coupling | **no** | prompt text only; gateway lives elsewhere |

## Loader risks (not secrets — architecture/safety)

1. **Eager I/O** on `import '@confora/ai-prompts'` — fails if JSON missing; couples consumers to Node fs.
2. **`fillTemplate`** replaces any `{{key}}` from caller-supplied map with **no allowlist**, **no escaping**, **no leftover-placeholder check** — prompt-injection / unexpected substitution risk if untrusted vars are passed.

These drive **REWORK_REQUIRED** on `src/index.ts`, not secret findings.
