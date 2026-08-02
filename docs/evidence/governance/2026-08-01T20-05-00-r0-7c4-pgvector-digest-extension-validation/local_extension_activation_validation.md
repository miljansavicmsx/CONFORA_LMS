# Local extension activation validation

| Check | Result |
|-------|--------|
| available default_version | `0.8.6` |
| CREATE EXTENSION vector | exit 0 |
| installed extversion | `0.8.6` |
| cast `[1,2,3]::vector::text` | `[1,2,3]` |
| Classification | `PGVECTOR_EXTENSION_ACTIVATION_VERIFIED` (local) |
| Temps cleaned | Yes |
