# CONFORA REPO HEALTH 40 — Secret / URL / Network Review

## Targeted scan scope

`packages/ai-prompts` source, config, and prompt JSON (excluding `node_modules` / `dist` / `.turbo`).

Patterns: top-level / import-time fs risk, `{{{`, `SafeString`, `fetch`, `axios`, `WebSocket`, `GraphQL`, `process.env`, `http://`, `https://`, `localhost`, tokens/secrets, tenant/cert IDs.

## Hits (raw)

| Location | Match | Classification |
|----------|-------|----------------|
| `tsconfig.json` `$schema` | `https://json.schemastore.org/tsconfig` | **Expected false positive** (schema URL only) |
| `src/index.test.ts` | `{{{user_message}}}` | **Expected false positive** (triple-brace rejection test) |
| `src/index.ts` comment | denial of `process.env` / network | **Expected false positive** (denial comment) |
| `src/index.ts` | `readFileSync` inside `loadPromptBundleLazy` | **Expected** lazy fs (not import-time; not a secret/network hit) |
| `src/index.ts` | `SafeString` in error string | **Expected false positive** (rejection messaging) |

## Counts (after false-positive classification)

| Metric | Value |
|--------|-------|
| secret_pattern_hits | **0** |
| url_or_network_hits | **0** |
| provider_or_network_behavior | **false** |

No `fetch` / `axios` / `WebSocket` / `GraphQL` / `process.env` / live URLs / auth headers / secrets in prompt package behavior.
