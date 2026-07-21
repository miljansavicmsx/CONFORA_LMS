# CONFORA-REPO-HEALTH-16 — SDK inventory

Untracked via `git ls-files --others --exclude-standard -- packages/sdk`.

| Path | Bytes | Null byte | Role |
|------|------:|:---------:|------|
| `packages/sdk/src/generated/schema.ts` | 137 | no | Placeholder: `export type paths = Record<string, never>` (replaced by generate later) |
| `packages/sdk/src/index.ts` | 889 | no | Handwritten `createConforaSdk` — Zod `baseUrl` + `getOpenApiJson()` |

**Candidate count: 2**

No other untracked package-level SDK files. No test fixtures under `packages/sdk`.
