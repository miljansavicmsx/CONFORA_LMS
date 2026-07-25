# CONFORA REPO HEALTH 41 — Secret / URL / Network Review

## Scan scope

All tracked `packages/ai-prompts` source/config/prompt/test files.

## Raw hits (classified)

| Location | Match | Classification |
|----------|-------|----------------|
| `tsconfig.json` `$schema` | `https://json.schemastore.org/tsconfig` | Expected false positive |
| `src/index.ts` comment | denial of `process.env` / network | Expected false positive |
| `src/index.ts` error text | `SafeString` | Expected false positive (rejection) |
| `src/index.test.ts` | `{{{user_message}}}` | Expected false positive (rejection test) |

No `fetch` / `axios` / `WebSocket` / `GraphQL` / `process.env` usage / live endpoints / auth tokens / secrets.

## Counts

| Metric | Value |
|--------|-------|
| secret_pattern_hits | **0** |
| url_or_network_hits | **0** |
| runtime_secret_url_network_hits | **0** |
| provider_or_network_behavior | **false** |
