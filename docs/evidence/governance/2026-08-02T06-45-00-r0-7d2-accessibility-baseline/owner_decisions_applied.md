# Owner decisions applied

- PLAN_C_STAGED_RECOVERY
- frontend-app only; not added to pnpm-workspace
- Exactly one new direct dep: `@axe-core/playwright@4.12.1` (devDependency, exact)
- axe-core remains transitive only (~4.12.1 via adapter)
- No promotion of tools/a11y, scripts/a11y, tests/e2e
- package-lock.json regenerated in clean worktree and force-tracked
- Unauthenticated public routes only
- Artifacts only; pull-requests: write removed
- compliance-iso left unrepaired (OD-R07-2 / R0-7E)
