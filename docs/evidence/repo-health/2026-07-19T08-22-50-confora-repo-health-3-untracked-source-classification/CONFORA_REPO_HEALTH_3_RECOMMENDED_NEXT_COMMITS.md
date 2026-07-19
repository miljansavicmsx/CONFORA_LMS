# Recommended next commits (proposals only)

Do **not** run `git add .`. Each item is a candidate for a **future** explicit-path commit after owner approval.

## 0) Optional small product commit (modified tracked)

**If** nav/i18n appeals polish is intentional:

- Paths: sidebar-sections, breadcrumbs, `bs/sl/sr` navigation.json
- Message sketch: `fix(nav): align staff appeals-complaints labels and routes`
- Exclude CRLF-only dirty files unless normalizing intentionally.

## 1) Repo identity / workspace meta

Track root workspace + quality config + CI hooks (Tier A list in source candidates).  
Separate from application feature work.

## 2) Packages shared kernel (narrow)

Selectively track `packages/*` sources already depended on by tracked `package.json` workspaces — after verifying no secrets.

## 3) Frontend / API source waves (large — plan as multiple PRs)

- Wave F1: `frontend-app/src` core app shell + auth (exclude generated).
- Wave A1: `apps/api/src` modules already proven by tracked tests/evidence.
- Always exclude `build-log.txt`, local env, screenshots binaries.

## 4) Ops runners referenced by package.json

Prefer tracking ops scripts that are already wired in `package.json` (43 untracked references measured) **after** secret review of Keycloak/MFA scripts.

## 5) Evidence

Commit only canonical packages under retention policy; largest backlog domain is `f5-pilot-readiness` (240 entries) — do not bulk-add without curation.

## Explicit non-commits now

- No application code commit from this HEALTH-3 task.
- No cleanup commits that delete files.
- No broad docs dump of all strategic markdown/docx.
