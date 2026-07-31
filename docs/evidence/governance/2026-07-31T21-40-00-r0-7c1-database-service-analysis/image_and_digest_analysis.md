# Image and digest analysis

| Field | Value |
|-------|--------|
| Repository | `pgvector/pgvector` |
| Tag | `pg16` (**mutable**) |
| Observed local Id/Digest | `sha256:00ba258a66dac104fd5171074a0084462a64a1369d8513f3d0a634e2f24d15bc` |
| OS/Arch | linux / amd64 |
| PostgreSQL | 16.14 (Debian) |
| Pull on GHA | Succeeds (logs show image pull before create failure) |
| Default user/db | Created via `POSTGRES_*` env (standard image contract) |

## R0-7C2 options (owner choose)

| Option | Notes |
|--------|-------|
| A. Keep image; fix quoting only | Minimum change; tag remains mutable |
| B. Keep image; fix quoting + pin digest | Stronger supply-chain pin |
| C. Different approved pgvector image | Requires owner approval |
| D. Official Postgres + install extension | Broader redesign; not preferred for R0-7C2 |

**Do not silently replace the image.**
