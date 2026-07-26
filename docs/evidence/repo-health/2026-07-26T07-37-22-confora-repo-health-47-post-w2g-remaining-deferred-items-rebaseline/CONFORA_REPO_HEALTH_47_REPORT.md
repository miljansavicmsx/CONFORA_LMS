# CONFORA REPO HEALTH 47 — Report

**Task:** CONFORA-REPO-HEALTH-47 — Post-W2G Remaining Deferred Items Rebaseline
**Branch:** `fix/ca-h01-frontend-f4-cutover`
**Base HEAD:** `40f80e97` (`40f80e97f476ff100707ef2adbf97752452f7f4d`)
**Evidence folder:** `docs/evidence/repo-health/2026-07-26T07-37-22-confora-repo-health-47-post-w2g-remaining-deferred-items-rebaseline/`
**Mode:** audit-only — nothing modified, staged, deleted, or imported

## 1. Baseline

HEAD matches `40f80e97` and is present on remote. Index empty. Scoped `git status --porcelain -uno` for `ai-prompts`, `apps/api`, `i18n`, `ui`, `ai-client` returned empty (no tracked modifications). `packages/ai-client` has exactly 5 tracked files; its 3 generated artifacts remain untracked. 3 HR MJML remain untracked. RH43 remains blocked (canonical apps/api AI source absent).

## 2. Closed packages (10)

`config`, `shared-types`, `shared-kernel`, `audit-client`, `sdk`, `ui`, `notification-templates` (source + EN MJML), `i18n`, `ai-prompts`, `ai-client` (source subset). Tracked package roots match this set (10 roots).

## 3. Deferred generated items

`packages/ai-client/src/index.d.ts`, `index.js`, `index.js.map` — DO_NOT_IMPORT, untracked, not staged.

## 4. HR MJML status

3 `hr.mjml` files under `packages/notification-templates` untracked/deferred; no other untracked content in that package.

## 5. apps/api RH43 status

`apps/api` tracked source clean; canonical AI gateway/course-authoring/exam source still absent (RH43A). **RH43 rework remains blocked.**

## 6. Remaining untracked roots

- **REVIEW_REQUIRED:** `packages/database` (75 files; package.json + src + prisma + node_modules), `frontend-app` (787), `backend` (338), `apps` (74), `frontend-public` (72), `tests` (58), `infrastructure` (39), `infra` (33), `terraform`, `scripts`.
- **DEFER:** HR MJML (3), README stub roots (`ai-governance`, `audit`, `auth`, `types`), `tools` (5), `prisma` (1), loose root docs.

## 7. Accidental staging risk

**HIGH.** Large untracked app/infra trees plus ai-client generated artifacts and HR MJML would be swept by any broad add. Stage by explicit file list only; never `git add .` / `packages/` / `apps/` / `docs/` / `packages/ai-client/src/`; never `git clean`.

## 8. Recommended next action

`RH48_NOTIFICATION_TEMPLATES_HR_MJML_LOCALIZATION_AUDIT_THEN_REWORK_OR_GENERATED_ARTIFACT_GITIGNORE_HYGIENE` — smallest bounded next step; large app/infra roots and `packages/database` reserved for dedicated waves.

## 9. Verdict

**CONFORA_REPO_HEALTH_47_REBASELINE_READY_FOR_REVIEW**

No production, external-pilot, DPO/legal, security-delegate, accreditation, or AI-governance approval claimed. `source_staged_after_audit: false`.
