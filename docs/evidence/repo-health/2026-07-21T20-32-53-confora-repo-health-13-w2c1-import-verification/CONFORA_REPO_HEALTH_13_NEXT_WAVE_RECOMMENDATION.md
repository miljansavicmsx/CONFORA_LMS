# CONFORA-REPO-HEALTH-13 — Next wave recommendation

## Recommended next wave

`W2C-2_AUDIT_CLIENT_SOURCE_REVIEW`

## Why

- W2C-1 verified and pushed as controlled 7-file import.
- RH12 order: next is audit-client source (**review**, then import) — not a blind add.
- Do **not** jump to direct `packages/audit-client/src` import without the review task.
- Still defer sdk (W2C-3), UI, notification-templates, database, auth, AI, app source.

## Non-actions now

- Do not import W2C-2 in this task
- Do not `git add .` / broad `packages/`
