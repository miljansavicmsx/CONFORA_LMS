# Independent extension reproduction

| Field | Value |
|-------|-------|
| Approved image | `pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b` |
| Current tag resolution | same approved index digest `sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b` |
| Digest drift | `NO` |
| Observed time | `2026-08-01T20:20:54Z` |
| Recorded linux/amd64 manifest | `sha256:84a355869251af1a3379cfc9fa7b4dbf962c03f642a4bb7b339a203925071c43` |
| `.Config.Image` exact match | `PASS` |
| Exact matching-container count | `1` |
| Available extension version | `0.8.6` |
| `CREATE EXTENSION vector` | `PASS` |
| Installed version | `0.8.6` |
| Vector cast | `[1,2,3]` |
| Classification | `PGVECTOR_EXTENSION_ACTIVATION_VERIFIED` |

This classification is based on **isolated Docker reproduction** and does **not**
yet prove GitHub-hosted job execution.
