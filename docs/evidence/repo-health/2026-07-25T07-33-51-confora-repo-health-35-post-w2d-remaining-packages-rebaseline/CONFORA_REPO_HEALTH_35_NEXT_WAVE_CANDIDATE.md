# CONFORA-REPO-HEALTH-35 — Next Wave Candidate

## Recommended next wave

**Task name:** `CONFORA-REPO-HEALTH-36` / **W2E — packages/i18n integrity review**

**Mode:** Audit-only (package already fully tracked — **not** a new import).

## Why safest

1. Already in git (50 files) — zero new import blast radius.
2. No package.json / lockfile / workspace change required.
3. No DB/migrations, no auth/RBAC weakening, no provider network in package code.
4. No prior RH integrity evidence found for `@confora/i18n`.
5. Aligns with UI (RH24) and notification-templates (RH31/RH34) closeout pattern before opening AI packages.

## Candidate files (exact tracked set)

```text
packages/i18n/package.json
packages/i18n/jest.config.cjs
packages/i18n/tsconfig.json
packages/i18n/tsconfig.build.json
packages/i18n/src/create-i18n.ts
packages/i18n/src/index.ts
packages/i18n/src/keys.ts
packages/i18n/src/react.tsx
packages/i18n/src/resources.ts
packages/i18n/test/locales-complete.test.ts
packages/i18n/locales/{en,bs,hr,sl,sr}/{a11y,auth,candidatePortal,certificationStaff,common,dashboard,navigation,shell}.json
```

(40 locale JSON + 5 src + 1 test + 4 config = **50** tracked files.)

## Out of this wave (see EXCLUDED_SCOPE)

HR MJML, `database`, `ai-*`, README stubs, apps, lockfile, any import/staging.

## After RH36

If GO: either continue next package (likely **ai-prompts REVIEW_REQUIRED audit**) or optional HR MJML localization track.
