# R0-7C1 — PostgreSQL/pgvector CI Service Boot Analysis

## Status

Read-only analysis. **No workflow, Docker, schema, or source files were modified.**

## Identity

| Item | Value |
|------|--------|
| Branch | `governance/r0-7c1-database-service-analysis` |
| Integration tip | `da5d8c197d1b2b20b526486cd06aef45b6e898a0` |
| R0-7B2 | MERGED — DETERMINISTIC PNPM INSTALLATION ACTIVE |

## Headline root cause

GitHub Actions `services.postgres.options` uses folded YAML:

```yaml
options: >-
  --health-cmd pg_isready -U confora -d confora
  ...
```

Docker `create` receives **unquoted** tokens. `-U` is parsed as a **docker create**
flag → `unknown shorthand flag: 'U'` → **exit 125** — **before** the container starts.

Quoted form succeeds locally:

`--health-cmd "pg_isready -U confora -d confora"`

## Scope boundary

R0-7C1 covers items **1–5** (create → extension availability).  
Prisma / migrate / app integration (**6–8**) remain deferred under OD-R07-2.
