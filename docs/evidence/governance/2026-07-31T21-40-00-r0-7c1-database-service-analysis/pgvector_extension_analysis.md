# pgvector extension analysis

## Image vs database enablement

| Layer | Finding |
|-------|---------|
| Extension **binaries** available | Yes — `pg_available_extensions` lists `vector` default `0.8.2` |
| Extension **enabled** by default in DB | **No** — `installed_version` empty until `CREATE EXTENSION` |
| `CREATE EXTENSION vector` in ephemeral DB | Succeeded locally after healthy boot |

**Do not claim pgvector is operational merely because the image name contains `pgvector`.**

## R0-7C2 recommendation

1. Health = `pg_isready` only (boot).
2. Optional separate step (owner-approved): query available extensions and/or
   `CREATE EXTENSION vector` in the ephemeral CI database.
