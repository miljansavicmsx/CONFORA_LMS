# CONFORA-REPO-HEALTH-33 — Validation Commands

## Typecheck

```text
pnpm exec tsc --noEmit -p packages/notification-templates/tsconfig.json
TSC_EXIT=0
```

`typecheck_passed: true`

## Unit tests

```text
pnpm exec tsx --test \
  packages/notification-templates/src/escape.test.ts \
  packages/notification-templates/src/subjects.test.ts \
  packages/notification-templates/src/index.test.ts \
  packages/notification-templates/src/events.interpolate.test.ts
```

Result: **15 pass / 0 fail** · `TEST_EXIT=0`

Covered: HTML escape, allowlisted interpolate, legacy fail-closed, index surface, subject fallback, workflow-boundary subject distinctness.

`tests_passed: true`

## Notes

- No dependency install performed.
- No MJML render / email send / provider call performed.
