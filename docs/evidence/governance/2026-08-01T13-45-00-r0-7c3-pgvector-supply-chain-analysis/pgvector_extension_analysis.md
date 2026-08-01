# Part B — pgvector binary availability and activation

## Method

Isolated ephemeral `docker run` of `pgvector/pgvector:pg16` with CI-equivalent
`POSTGRES_USER/PASSWORD/DB=confora`. No repository bind-mount. No Prisma.
Containers removed after tests.

## Availability (before `CREATE EXTENSION`)

```text
 name  | default_version | installed_version
--------+-----------------+-------------------
 vector | 0.8.2           | <null>
```

**Finding:** binaries/control files are present; extension is **available** but **not enabled** by image default.

## Control file / shared library

| Path | Present |
|------|---------|
| `/usr/share/postgresql/16/extension/vector.control` | Yes (`default_version = '0.8.2'`) |
| `/usr/lib/postgresql/16/lib/vector.so` | Yes |
| SQL upgrade scripts under `.../extension/vector--*.sql` | Yes |

## Privileges

`SELECT rolsuper FROM pg_roles WHERE rolname=current_user;` → `t` for `POSTGRES_USER=confora`.

**Finding:** default CI user can `CREATE EXTENSION vector` (superuser role created by official Postgres entrypoint pattern).

## Activation (ephemeral only)

```text
CREATE EXTENSION vector;  -- exit 0
installed_version = 0.8.2
```

Activation is **per-database**. Enabling in `confora` does not by itself enable in other databases.

## CI implication (planning)

Repository CI has **not** run this activation. Status remains `NOT_VERIFIED` for workflows
until an approved R0-7C4 validation step lands.

## Proposed R0-7C4 verification pattern (not implemented)

After service healthy, using runner `psql` (or ephemeral client container) to `127.0.0.1:5432`:

1. Query `pg_available_extensions` for `vector` (must show default_version, installed null/empty).
2. Optionally `CREATE EXTENSION vector` in ephemeral `confora` only.
3. Re-query `installed_version`.
4. Fail job if missing binaries or create fails.

Must **not**: Prisma, migrate, seed, mount `packages/database`, or touch production.
