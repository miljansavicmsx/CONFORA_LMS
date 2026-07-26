# CONFORA REPO HEALTH 46 — Report

**Task:** CONFORA-REPO-HEALTH-46 — W2G AI Client Source Subset Import Verification  
**Branch:** `fix/ca-h01-frontend-f4-cutover`  
**Base HEAD / import commit:** `f2270fdf` (`f2270fdf8fe4ec0bfb7ab2af528d3b8e57e0db4c`)  
**RH45 evidence:** `1b9179ae`  
**Evidence folder:** `docs/evidence/repo-health/2026-07-26T07-05-22-confora-repo-health-46-w2g-ai-client-source-subset-import-verification/`  
**Mode:** audit-only — no source modified, nothing staged, generated artifacts not imported

## 1. Baseline

HEAD and remote match `f2270fdf`. Index empty. Exactly 5 tracked `packages/ai-client` files. Generated `src/index.{js,d.ts,js.map}` exist on disk and remain untracked. `ai-prompts`, `apps/api`, `i18n`, `ui` clean. Only 3 deferred HR MJML untracked. Porcelain `M` on prior docs/evidence is content-identical noise (sample_same=5).

## 2. Commit scope

`f2270fdf` adds exactly:

1. `packages/ai-client/package.json`  
2. `packages/ai-client/tsconfig.json`  
3. `packages/ai-client/tsconfig.build.json`  
4. `packages/ai-client/src/index.ts`  
5. `packages/ai-client/src/metadata.test.ts`  

No apps, lockfile, workspace, ai-prompts, HR MJML, dist, node_modules, .turbo, or generated JS/DTS/maps. Parent is RH45 evidence commit `1b9179ae` (docs-only).

## 3. Package inventory

5 tracked files; SHA-256 hashes match RH45 audit. Shape correct. No tracked generated/vendor artifacts.

## 4. Provider / network

Module import inert. Runtime `fetch` only on explicit `invokeAiGateway` / deprecated `complete`, targeting `/v1/ai/invoke` and `/v1/ai/complete` with caller-injected, schema-validated `baseUrl`. No provider SDK, no hardcoded vendor endpoints, no `process.env`, no prompt construction.

**Deferred hardening:** no timeout / AbortSignal on fetch — does not block import verification GO.

## 5. Security / privacy

Secrets 0, URL literals 0, PII/tenant 0. Expected hits are getAccessToken callback, Bearer header construction, and internal gateway paths.

## 6. Architecture

Import introduced no root package.json / lockfile / workspace / apps/api / DB / auth changes. Existing `@confora/ai-client` workspace references now resolve to tracked source. Does not weaken `ai-prompts` fail-closed. Package should remain imported. RH43 remains blocked.

## 7. Governance / workflow

0 blocking findings. Governance-supportive metadata preserved: disclosure required, human_oversight default true, AI-generated literals, prompt/response hashes, certification-relevant purposes PendingValidation until SME acceptance.

## 8. Generated / vendor

All generated/vendor paths untracked. Import exclusion confirmed. Residual hygiene risk for directory-scoped adds remains deferred.

## 9. Validation

Typecheck PASS (exit 0). Tests **1/1 PASS**.

## 10. Verdict

**CONFORA_REPO_HEALTH_46_W2G_AI_CLIENT_SOURCE_SUBSET_IMPORT_VERIFICATION_GO**

Recommended next: `COMMIT_RH46_AI_CLIENT_IMPORT_VERIFICATION_EVIDENCE_THEN_REBASELINE_REMAINING_DEFERRED_ITEMS`

No production, external-pilot, DPO/legal, security-delegate, accreditation, or AI-governance approval claimed.
