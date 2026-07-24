# CONFORA-REPO-HEALTH-28 — Validation Commands

## Commands run (no install / no lockfile change)

### Typecheck

```text
packages/notification-templates: tsc --noEmit -p tsconfig.json
```

**Exit:** 0 → `typecheck_passed: true`

### Tests (same W2D2R command)

```text
node_modules/.bin/tsx --test
  packages/notification-templates/src/escape.test.ts
  packages/notification-templates/src/subjects.test.ts
  packages/notification-templates/src/events.interpolate.test.ts
  packages/notification-templates/src/index.test.ts
```

**Exit:** 0 · **15/15 passed** → `tests_passed: true`

### Notes

- Package `package.json` has no `test` script (untouched); root workspace `tsx` used.
- No emails rendered/sent; no providers called.
