# amd64 extension version verification — R0-7C3A

| Field | Value |
|-------|-------|
| Platform | `linux/amd64` |
| Index digest | `sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b` |
| Selected manifest digest | `sha256:84a355869251af1a3379cfc9fa7b4dbf962c03f642a4bb7b339a203925071c43` |
| Config digest (not pin) | `sha256:8e5355e9ff399a002fa46148399a1ac22fb3e9b2d390f857296e6da6b5559ba1` |
| Image reference used | `pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b` |
| Available `vector` default_version | `0.8.6` |
| Control-file default_version | `0.8.6` |
| Installed before CREATE | empty / null |
| `CREATE EXTENSION vector` | exit `0` |
| Installed `extversion` | `0.8.6` |
| Vector cast `SELECT '[1,2,3]'::vector::text` | `[1,2,3]` PASS |
| Host repo bind-mount | none |
| Persistent named volume retained | none (pruned) |
| Prisma / migrations / seed | not run |
| Production access | `NONE` |
| Temporary resources | removed |

Observation UTC: `2026-08-01T17:23:42Z` (digest re-resolve); activation run completed same session.
