# CONFORA-REPO-HEALTH-30 — Validation Commands

```text
pnpm exec tsc --noEmit -p packages/notification-templates/tsconfig.json
→ exit 0  (typecheck_passed: true)

pnpm exec tsx --test
  .../escape.test.ts
  .../subjects.test.ts
  .../index.test.ts
  .../events.interpolate.test.ts
→ exit 0  · 15/15 passed  (tests_passed: true)
```

No emails rendered/sent; no providers called.
