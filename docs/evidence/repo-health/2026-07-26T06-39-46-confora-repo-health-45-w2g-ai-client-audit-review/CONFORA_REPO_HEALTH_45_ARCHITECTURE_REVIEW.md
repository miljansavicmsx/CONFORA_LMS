# CONFORA REPO HEALTH 45 — Architecture Review

## Change-requirement matrix

| Requirement | Needed? | Evidence |
|-------------|:-------:|----------|
| Root `package.json` change | **no** | workspace globs already cover `packages/*`; nothing to add |
| `pnpm-workspace.yaml` change | **no** | `packages/*` already in scope |
| `pnpm-lock.yaml` change | **no** | lockfile line 433 already has a `packages/ai-client` importer with `zod ^3.23.8 → 3.25.76` and the dev deps resolved |
| `apps/api` runtime integration | **no** | `apps/api/package.json:24` already declares `"@confora/ai-client": "workspace:*"`; jest mappers already point at `packages/ai-client/src/index.ts` |
| Database / migration change | **no** | no persistence, no Prisma usage |
| Auth / RBAC / tenant change | **no** | no authorization decisions; token is injected by the caller |
| AI governance approval for import | **no** (for import of contracts + transport) | package makes no AI decisions; governance duties stay in the gateway |

## Tracked-repo consistency finding

Tracked manifests already reference a package whose source is untracked:

```text
apps/api/package.json:24            "@confora/ai-client": "workspace:*"
apps/api/jest.config.cjs:10         '^@confora/ai-client$': '<rootDir>/../../../packages/ai-client/src/index.ts'
apps/api/jest-e2e.config.cjs:12     '^@confora/ai-client$': '<rootDir>/../../packages/ai-client/src/index.ts'
apps/api/jest.compliance.config.cjs:10 (same mapping)
apps/api/jest.integration.config.cjs:10 (same mapping)
pnpm-lock.yaml:126, 433             @confora/ai-client importer entry
```

Importing the source subset therefore **reduces** an existing inconsistency in the tracked tree rather than creating new coupling. No manifest edits are required in either direction.

## Relationship to `packages/ai-prompts`

| Question | Answer |
|----------|--------|
| Imports `packages/ai-prompts`? | **no** — no import, no dependency |
| Duplicates prompt logic? | **no** — no template filling, no prompt file loading; only a doc comment at `src/index.ts:76` mentioning `user_template` |
| Weakens ai-prompts fail-closed behaviour? | **no** — it cannot; the loader's allowlist and throw-on-unknown-ID path are untouched |

**Purpose-set divergence (documented, not a blocker).** `aiPurposeSchema` contains 10 purposes; `AI_PROMPT_IDS_V1` contains 5. The 6 purposes with no closed prompt ID are:

`question.explain`, `proctoring.video`, `proctoring.audio`, `analysis.exam_result`, `content.draft`, `translate.i18n`

This is exactly the RH42-class compatibility gap. Importing this enum **records** the gap; it does not create or widen it, because nothing in tracked source currently maps a purpose to a prompt bundle (RH43A: the gateway source is absent). Alignment must be decided when the canonical gateway is restored — options being to narrow the enum, add prompt bundles, or require `messages` for non-closed purposes. Deciding it now, with no caller present, would be speculative.

## Import ordering vs. blocked apps/api AI source

Importing `packages/ai-client` before the canonical `apps/api` AI source is restored is acceptable:

- it activates nothing (no import-time effects, no tracked callers),
- it satisfies dependency declarations that tracked manifests already make,
- it gives the future gateway rework a reviewed, version-controlled contract to build against,
- and it does not pre-empt the purpose-alignment decision, which stays open.

`import_before_apps_api_ai_source_restored_is_acceptable: true`.

## Stale / generated code from the old apps/api AI gateway?

**No.** The generated files in the package (`src/index.js`, `src/index.d.ts`, `src/index.js.map`, `tsconfig.build.tsbuildinfo`, `dist/**`) are compiled output of this package's own `src/index.ts` — verified by content correspondence (same schemas, same two `fetch` sites). No `apps/api` gateway service code, no `getPromptBundleV1`, no NestJS constructs are embedded. `contains_stale_apps_api_gateway_code: false`.

## Domain-boundary assessment

The package sits correctly as a **shared contracts + transport** library: DTO schemas, purpose taxonomy, and a thin internal HTTP client. It contains no business logic, no persistence, and no authorization. Policy enforcement (rate limits, leakage prevention, audit events, human oversight) remains in the gateway service, which is the required placement.
