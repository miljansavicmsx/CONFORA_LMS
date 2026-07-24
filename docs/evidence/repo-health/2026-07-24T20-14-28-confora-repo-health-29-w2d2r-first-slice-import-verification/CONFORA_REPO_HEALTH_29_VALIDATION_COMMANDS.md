# CONFORA-REPO-HEALTH-29 — Validation Commands

## Commands (no install)

```text
pnpm exec tsc --noEmit -p packages/notification-templates/tsconfig.json
→ exit 0  (typecheck_passed: true)

pnpm exec tsx --test
  packages/notification-templates/src/escape.test.ts
  packages/notification-templates/src/subjects.test.ts
  packages/notification-templates/src/index.test.ts
→ exit 0  · 10/10 passed  (tests_passed: true)
```

No emails rendered/sent; no providers called.
