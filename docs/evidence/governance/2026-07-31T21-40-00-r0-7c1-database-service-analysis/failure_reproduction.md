# Failure reproduction

## Environment

| Item | Value |
|------|--------|
| Docker | 29.3.1 (client/server) |
| Host | Windows; engine linux/amd64 images |
| Integration tip | `da5d8c197d1b2b20b526486cd06aef45b6e898a0` |

## Broken command (matches GHA)

```text
docker create ... --health-cmd pg_isready -U confora -d confora ... pgvector/pgvector:pg16
```

Result: **exit 125**, `unknown shorthand flag: 'U' in -U`. Container not created.

## Fixed command

```text
docker create ... --health-cmd "pg_isready -U confora -d confora" ... pgvector/pgvector:pg16
```

Result: create **exit 0**; start succeeds; health reaches **healthy**; `pg_isready` exit 0.

Temporary containers removed after analysis.
