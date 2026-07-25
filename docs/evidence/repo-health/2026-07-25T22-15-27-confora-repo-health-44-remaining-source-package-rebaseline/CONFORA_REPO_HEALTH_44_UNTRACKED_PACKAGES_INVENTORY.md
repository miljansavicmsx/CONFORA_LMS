# CONFORA REPO HEALTH 44 — Untracked Packages Inventory

On-disk under `packages/` with **0** tracked files (except notification HR MJML which are untracked files inside a tracked package).

| Path | Approx source files* | package.json | Notes | Class |
|------|---------------------:|:------------:|-------|-------|
| `packages/ai-client` | 9 (excl nm/dist/turbo) | yes | Zod `AiPurpose`, gateway `fetch` client; dist/nm on disk | **SAFE_AUDIT_NEXT** |
| `packages/database` | 75 (excl nm) | yes | Prisma schema/migrations/seed; high-risk | **REVIEW_REQUIRED** |
| `packages/ai-governance` | 1 | no | README stub only | **DEFER** |
| `packages/audit` | 1 | no | README stub; points to audit-client | **DEFER** |
| `packages/auth` | 1 | no | README stub | **DEFER** |
| `packages/types` | 1 | no | README stub; points to shared-types | **DEFER** |

\*Excludes `node_modules`, `dist`, `.turbo`, `coverage`.

## Also untracked (non-package, high accidental-staging risk)

`apps/admin`, `apps/ai-service`, `apps/examiner`, `apps/web`, `apps/worker`, `frontend-app`, `frontend-public`, `backend`, `infra`, `infrastructure`, `terraform`, `prisma/`, `scripts/`, `tools/`, `tests/`, assorted root docs/PDFs.

## HR MJML (deferred files in closed package)

Three untracked `.mjml` under `packages/notification-templates/templates/**/hr.mjml` — **DEFER** / do not import.
