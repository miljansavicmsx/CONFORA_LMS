# CONFORA-REPO-HEALTH-22 — Import Candidate Recommendation

## Future import candidate (exactly two files)

1. `packages/ui/src/ai-disclosure.tsx`
2. `packages/ui/src/index.ts`

## GO / NO-GO for ChatGPT Work

| Decision | Value |
|----------|-------|
| `future_import_go_recommendation` | **GO** |
| `future_import_files_count` | **2** |
| Notification templates remain deferred | **yes** |

## Why GO

- Mandatory English product defaults removed; text is props/children-driven.
- AI governance contract present; no blocking certification implications in component code.
- Barrel exports only verified UI primitives + reworked disclosure; no side effects.
- Secret/network/runtime/auth scans clean; files small.

## Import constraints for a future import task

- Import **exactly** these two files.
- Do **not** use `git add .` / broad `packages/` / `packages/ui/` adds.
- Do **not** modify package.json / lockfile / workspace / `.gitignore`.
- Do **not** import `packages/notification-templates/**`.
- Do **not** re-import already-tracked W2D-1 primitives unless a separate task requires it.
- Follow with post-import verification evidence (RH23-class) before treating as production-approved.

## Not claimed

Production readiness, external pilot, DPO/legal, or security-delegate approval.
