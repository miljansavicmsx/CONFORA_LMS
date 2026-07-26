# Database / pgvector analysis (RC-R07-3, RC-R07-2)

## Service definition

Workflow: `.github/workflows/ci.yml` job `database` (mirrored in
`accessibility.yml` job `compliance-iso`).

| Field | Value |
|-------|-------|
| Image | `pgvector/pgvector:pg16` (mutable tag) |
| Env | POSTGRES_USER/PASSWORD/DB = confora / confora_dev_change_me / confora |
| Ports | 5432:5432 |
| Health | `--health-cmd pg_isready -U confora -d confora` (unquoted in YAML options) |

## Observed failure

GitHub Actions service container creation returns **exit code 125** before job
steps run. Failure occurs **before PostgreSQL readiness** and before Prisma
commands.

Likely configuration defect: unquoted `--health-cmd` value causes Docker to
treat `-U` / `-d` as `docker create` flags (classic Actions services pitfall).
Confirm in R0-7C by quoting:
`--health-cmd "pg_isready -U confora -d confora"`.

Architecture/runner compatibility and image pull failures remain secondary
hypotheses until quoting is tested.

## Tracked Prisma state

`packages/database` tracked file count: **0** (local tree exists but untracked).

Even after service recovery, clean-clone CI cannot:

- `prisma generate`
- `prisma migrate deploy`
- `pnpm run seed`
- database tests

This is a **missing tracked source** defect (RC-R07-2), distinct from the
service create failure.

## Production boundary

R0-7C must not start a production database, must not weaken R0-3, and must not
treat local untracked Prisma as clean-clone SoT without an owner promotion
decision.
