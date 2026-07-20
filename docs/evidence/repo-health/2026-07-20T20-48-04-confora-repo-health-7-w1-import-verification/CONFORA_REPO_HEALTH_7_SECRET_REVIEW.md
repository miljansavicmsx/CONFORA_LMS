# CONFORA-REPO-HEALTH-7 — Secret review

**No secret values are reproduced in this report.**

## Automated pattern scan (W1 files)

Patterns checked: AWS access-key shape, PEM private-key blocks, JWT-like triples, password/api_key/client_secret assignments with long quoted literals, `otpauth://`, Bearer tokens.

| Result | Count |
|--------|------:|
| Pattern hits | **0** |

## `frontend-app/.env.example`

| Result | Detail |
|--------|--------|
| Placeholder-only | **true** |
| Keys reviewed | `VITE_API_URL`, `VITE_LEGACY_API_URL`, `VITE_CONFORA_API_URL`, `VITE_API_PROVIDER`, feature flags (`VITE_*_ENABLED`, report flags) |
| Live opaque secrets | none observed |

## Compose env (local/CI names)

Secret-*named* keys exist under local/CI compose (expected for docker wiring):

| File | Keys (names only) | Classification |
|------|-------------------|----------------|
| `docker-compose.yml` | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `DEV_LOCAL_JWT_SECRET`, `DEV_LOCAL_PASSWORD` | Local/dev fixture naming; placeholderish heuristic **pass** |
| `docker-compose.a11y-ci.yml` | same family | Local/a11y CI fixtures; `DEV_LOCAL_JWT_SECRET` is a 32-char local fixture string (not AWS/otpauth/PEM). Acceptable for **DEV_LOCAL_*** / a11y CI only — production must inject via env, not reuse |

## Verdict

| Field | Value |
|-------|-------|
| `secrets_committed` | **false** (no production credential patterns found) |
| `env_examples_placeholders_only` | **true** |
| Residual note | Keep treating compose `DEV_LOCAL_*` as non-production fixtures in later waves |
