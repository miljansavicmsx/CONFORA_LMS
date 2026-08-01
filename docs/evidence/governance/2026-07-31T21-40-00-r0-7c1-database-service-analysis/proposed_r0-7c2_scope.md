# Proposed R0-7C2 scope

## Preferred operational allowlist (max **2** files)

| File | Change | Mandatory? |
|------|--------|------------|
| `.github/workflows/ci.yml` | Quote `--health-cmd` in `database` job postgres service | **Yes** |
| `.github/workflows/accessibility.yml` | Same quote fix in `compliance-iso` job | **Yes** |

Optional (owner-approved only):

- Pin `image:` to `pgvector/pgvector@sha256:…` (digest from approved verification)
- Add post-healthy step validating `vector` extension availability

## Out of scope

- Promoting `packages/database`
- Prisma generate/migrate/seed
- Application source
- `deploy-backend.yml`
- Broader workflow redesign

## Rollback

Revert the one/two workflow commits restoring prior `options:` blocks.
