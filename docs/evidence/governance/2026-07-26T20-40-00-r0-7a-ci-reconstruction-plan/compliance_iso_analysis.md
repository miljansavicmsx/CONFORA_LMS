# Compliance ISO job analysis

Job: `compliance-iso` in `accessibility.yml`.

## Primary failure on PR #3

Fails at **Initialize containers** with the same Docker exit **125** as
`ci.yml` / `database` (shared RC-R07-3). Install and Playwright compliance
gates never ran.

## Invocations (never reached on PR #3)

- Prisma generate/migrate/seed in `packages/database` (untracked)
- Build `@confora/api`, `@confora/web`, `frontend-app`
- Start Nest `apps/api` `dist/main.js` (no tracked `main.ts` — would fail)
- Playwright specs under `tests/e2e/compliance/iso17024_*.spec.ts` (untracked)
- Jest compliance/integration configs under `apps/api` (configs tracked; suites
  may depend on incomplete API)

## Conformity-claim risk

Job name and step titles reference ISO/IEC 17024 clause letters. On a clean
clone these checks are **not reproducible**. Presenting green compliance CI
without tracked evidence would be a false conformity signal.

## Split recommendation (R0-7E)

1. Documentation / mapping validation (no standards full-text)
2. Architecture-policy validation against SoT labels
3. Implementation tests only for tracked, buildable components

Do not reproduce copyrighted standards text in CI artifacts.
