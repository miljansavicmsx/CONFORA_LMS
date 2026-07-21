# CONFORA-REPO-HEALTH-15 — Next wave recommendation

## Recommended next wave

`W2C-3_SDK_SOURCE_REVIEW`

## Why

- W2C-2 verified: audit-client source only.
- RH12 order: next is `packages/sdk/src` (**review**, including generated stub) — not a blind add.
- Still defer ui, notification-templates, database, auth, AI, app source.

## Non-actions now

- Do not import W2C-3 in this task
- Do not `git add packages/sdk` broadly
