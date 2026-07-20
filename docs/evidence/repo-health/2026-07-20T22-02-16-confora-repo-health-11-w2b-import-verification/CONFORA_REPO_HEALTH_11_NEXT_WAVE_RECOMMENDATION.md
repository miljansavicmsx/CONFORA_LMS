# CONFORA-REPO-HEALTH-11 — Next wave recommendation

## Recommended next wave

`W2C_CONFIG_AUDIT_CLIENT_SDK_REVIEW`

## Why

- W2B verified: shared-types + shared-kernel source contracts only.
- RH8 order: W2C = `config` eslint/prettier/csp tooling, `audit-client` source, `sdk` source (review generated schema), optionally `ui` / notification templates.
- Do **not** jump to `packages/database/**` or app `src`.

## Non-actions now

- Do not import W2C in this task
- Do not `git add packages`
- Do not import database / auth package / AI packages / app source
