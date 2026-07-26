# CONFORA REPO HEALTH 45 — Report

**Task:** CONFORA-REPO-HEALTH-45 — W2G `packages/ai-client` Audit-Only Review
**Branch:** `fix/ca-h01-frontend-f4-cutover`
**Base HEAD:** `2096d944` (`2096d94406a12281466f139d32c0aeb76f7160b9`)
**Evidence folder:** `docs/evidence/repo-health/2026-07-26T06-39-46-confora-repo-health-45-w2g-ai-client-audit-review/`
**Mode:** audit-only — no source modified, nothing staged, nothing imported, nothing deleted

## 1. Baseline

HEAD matches `2096d944` and is present on `origin/fix/ca-h01-frontend-f4-cutover`. Index empty before and after. `packages/ai-client` untracked (`git ls-files` = 0). `packages/ai-prompts`, `apps/api`, `packages/i18n`, `packages/ui` clean. Only the 3 deferred HR MJML files untracked in notification-templates.

`git status --porcelain -uno` reports 74 `docs/evidence` files as `M`; all 74 have blob hashes identical to HEAD (`same=74 differs=0`), i.e. line-ending/stat noise with no content change.

## 2. File count and shape

**9 in-scope files**, plus 22 files in ignored `dist` (3), `node_modules` (15), `.turbo` (4).

Shape: node-library — `package.json`, `tsconfig.json`, `tsconfig.build.json`, `src/index.ts`, `src/metadata.test.ts`; no README; plus compiled artifacts emitted into `src/` and an ignored `tsconfig.build.tsbuildinfo`.

## 3. Provider / network

No OpenAI/Anthropic/local-model coupling, no provider SDK, no axios/WebSocket, no `process.env`, no hardcoded endpoints, no prompt construction, no tool calling, no prompt/user logging. Two `fetch` sites (`src/index.ts:123`, `:158`) POST to the **internal** gateway paths `/v1/ai/invoke` and `/v1/ai/complete`, with the host supplied by the caller and validated via `z.string().url()`.

Import is **inert** — top level only constructs zod schemas and two `ReadonlySet`s. Network activity requires an explicit call. Finding: neither `fetch` sets a timeout or `AbortSignal` (DEFER).

## 4. Security / privacy

`secret_pattern_hits: 0`, `url_or_network_hits: 0` (no URL literals), `pii_tenant_findings: 0`. All 7 scan hits classified: 2 runtime-active internal gateway paths, 4 false positives (injected token callback + `Bearer` header construction), 1 type declaration. No credentials present or proposed for import. Errors expose HTTP status only.

## 5. Architecture

No root `package.json`, lockfile, or workspace change required — `apps/api/package.json:24`, four jest module mappers, and `pnpm-lock.yaml:433` already declare `@confora/ai-client` with `zod` resolved. No DB/migration, no auth/RBAC/tenant change. Does not import `packages/ai-prompts`, does not duplicate prompt logic, does not weaken its fail-closed loader. Contains no stale `apps/api` gateway code — generated files are this package's own build output.

Documented divergence: `aiPurposeSchema` has 10 purposes vs. 5 closed prompt IDs; the 6 unmatched (`question.explain`, `proctoring.video`, `proctoring.audio`, `analysis.exam_result`, `content.draft`, `translate.i18n`) are the RH42-class gap, deferred to the gateway wave since no tracked caller exists.

## 6. Governance / workflow boundary

**0 blocking findings** across all 11 prohibited behaviours. The contract is governance-supportive: `disclosure_shown` is required, `human_oversight_required` defaults to `true`, `isAiGenerated`/`is_ai_generated` are `z.literal(true)`, and prompt/response hashes are mandatory. `CERTIFICATION_RELEVANT_AI_PURPOSES` is documented as PendingValidation-until-SME-acceptance. No approval claims of any kind.

## 7. Generated / vendor

Ignored: `dist`, `node_modules`, `.turbo`, `tsconfig.build.tsbuildinfo`. **Not ignored (primary finding):** `src/index.js`, `src/index.d.ts`, `src/index.js.map` — stageable build output inside `src/`, creating an accidental-staging risk and a resolution-shadowing risk for `metadata.test.ts` (which imports `'./index.js'`). No binaries, no vendored source, no file above 1 MB.

## 8. Validation

```powershell
pnpm exec tsc --noEmit -p packages/ai-client/tsconfig.json   # TSC_EXIT=0
pnpm exec tsx --test packages/ai-client/src/metadata.test.ts # pass 1, fail 0
```

Both read-only; no network access; no environment startup.

## 9. Classification

- **IMPORT_CANDIDATE (5):** `package.json`, `tsconfig.json`, `tsconfig.build.json`, `src/index.ts`, `src/metadata.test.ts`
- **REWORK_REQUIRED (0)**
- **DEFER (4 open items):** purpose/prompt-ID alignment, `fetch` timeout hardening, deprecated client removal, stray-artifact cleanup
- **DO_NOT_IMPORT:** `src/index.js`, `src/index.d.ts`, `src/index.js.map`, `tsconfig.build.tsbuildinfo`, `dist/**`, `node_modules/**`, `.turbo/**`

## 10. Recommended next action

`RH46_CONTROLLED_IMPORT_OF_AI_CLIENT_SOURCE_SUBSET_5_FILES_EXCLUDING_GENERATED_ARTIFACTS` — explicit file-list staging only; never `git add packages/ai-client/src`.

## 11. Verdict

**CONFORA_REPO_HEALTH_45_AI_CLIENT_AUDIT_READY_FOR_REVIEW**

No production, external-pilot, DPO/legal, security-delegate, accreditation, or AI-governance approval is claimed or implied.
