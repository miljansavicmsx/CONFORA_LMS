# CONFORA REPO HEALTH 44 — Security / Privacy Screen

## Scope

Shallow scan of remaining **untracked** candidate packages (`ai-client`, `ai-governance`, `audit`, `auth`, `database`, `types`), excluding deep walks of `node_modules` / large vendor trees.

## Secrets

| Hit | Classification |
|-----|----------------|
| `getAccessToken?:()` / Bearer header in `ai-client` | Expected client API — **not** hardcoded secret |
| `packages/database/.env.example` placeholder DB URL/password | Example only — **not** production secret |

**secret_pattern_hits:** 0 (after false-positive classification)

## URL / network

| Hit | Classification |
|-----|----------------|
| `ai-client` `fetch` to `${baseUrl}/v1/ai/invoke` | Intentional gateway client — expected |
| `database` seed public `iso.org` URLs | Public documentation links — expected |

**url_or_network_hits:** 0 (no unexpected hardcoded provider keys/endpoints)

## PII / tenant

| Hit | Classification |
|-----|----------------|
| `seed.ts` `@confora.local` emails + `DEFAULT_TENANT_ID` | Synthetic seed fixtures — not real PII |

**pii_tenant_findings:** 0 (after classification)

## Large / vendor risks (document, do not deep-process)

- `apps/api/dist`, `apps/api/coverage`
- `packages/*/node_modules`, `packages/*/dist`, `.turbo`
- `packages/database/node_modules`

Do not import these.
