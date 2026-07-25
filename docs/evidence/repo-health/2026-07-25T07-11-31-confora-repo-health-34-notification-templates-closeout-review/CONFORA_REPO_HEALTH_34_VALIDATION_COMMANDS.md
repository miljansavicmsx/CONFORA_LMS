# CONFORA-REPO-HEALTH-34 — Validation Commands

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

**15 pass / 0 fail** · `TEST_EXIT=0` · `tests_passed: true`

## Notes

No dependency install, MJML render, email send, or provider call.
