# Modified tracked review

Audit of the **8** modified tracked files. **Not staged / not committed** by this task.

| Path | Domain | Classification | Notes |
|------|--------|----------------|-------|
| `frontend-app/src/components/layout/sidebar-sections.tsx` | Frontend nav / appeals | **likely intended product change** | Points staff appeals nav to `/dashboard/admin/appeals-complaints`; keeps ISO appeals as oversight |
| `frontend-app/src/pages/dashboard/dashboard-breadcrumbs.ts` | Frontend i18n labels | **likely intended product change** | `complaints` label → Prigovori; adds `appeals-complaints` breadcrumb |
| `packages/i18n/locales/bs/navigation.json` | i18n | **likely intended product change** | Adds `appealsComplaints` key |
| `packages/i18n/locales/sl/navigation.json` | i18n | **likely intended product change** | Same key (locale pack) |
| `packages/i18n/locales/sr/navigation.json` | i18n | **likely intended product change** | Same key (locale pack) |
| `frontend-app/e2e/pilot-login.ts` | E2E helper | **uncertain / line-ending** | `git status` dirty; `git diff` showed no content hunk (likely CRLF) |
| `scripts/ops/local-stack-readiness.mjs` | Ops | **uncertain / line-ending** | Status dirty; no content hunk in diff |
| `scripts/ops/run-exam-reg-1-e2e-auth-recovery.mjs` | Ops | **uncertain / line-ending** | Status dirty; no content hunk in diff |

## Boundary note

Nav/label edits align with žalba ≠ prigovor and staff appeals route separation. They do **not** by themselves change certification decision, certificate issuance, exam result, or public verification.

## Recommendation

- If committing product nav/i18n: dedicated small commit with explicit paths only (after owner review).
- Do not bundle CRLF-only files unless intentional normalization.
