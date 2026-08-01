# Prisma and database-source boundary — R0-7C2

| Item | Status |
|------|--------|
| `packages/database` tracked-file count | `0` |
| Classification | `UNTRACKED_EXCLUDED` |
| OD-R07-2 | `DEFERRED` |
| Prisma commands added/changed by R0-7C2 | No |
| Schema / migration / SQL / seed files changed | No |
| Service boot requires tracked database source | No |

## Post-boot CI failure (expected residual)

First post-boot failure in both `database` and `compliance-iso` jobs:
missing `packages/database` (Prisma generate working-directory does not exist).

That failure belongs to **OD-R07-2 / R0-7E** and does **not** invalidate service boot.
