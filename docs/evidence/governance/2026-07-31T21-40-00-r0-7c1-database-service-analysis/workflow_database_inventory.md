# Workflow database inventory

See `workflow_database_inventory.json`.

| Workflow | Job | Postgres service? | Same exit-125 defect? |
|----------|-----|-------------------|------------------------|
| `ci.yml` | `database` | Yes (`pgvector/pgvector:pg16`) | **Yes** |
| `accessibility.yml` | `compliance-iso` | Yes (same image/options) | **Yes** |
| `accessibility.yml` | `accessibility` | No GHA service | No |
| `confora-qa.yml` | unit-and-compliance | No service; filter `@confora/database` | No |
| `ci.yml` | `docker` | Depends on `database` | Skipped when DB fails |
| `deploy-backend.yml` | — | No GHA pgvector service | Out of R0-7C1 repair |

Both defective service blocks use identical unquoted `--health-cmd pg_isready -U ...`.
