# Version reconciliation — R0-7C3A

## Previous evidence value

`0.8.2` (recorded in original R0-7C3 evidence under commit `9981b73b8899f919d5e60fbff79ea19e4892fb22`)

## Repeated approved-digest value (corrected)

`0.8.6`

## Digests used for correction

| Kind | Digest |
|------|--------|
| Approved multi-platform OCI **index** | `sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b` |
| Approved **linux/amd64** platform manifest | `sha256:84a355869251af1a3379cfc9fa7b4dbf962c03f642a4bb7b339a203925071c43` |
| amd64 **config** (not for pin) | `sha256:8e5355e9ff399a002fa46148399a1ac22fb3e9b2d390f857296e6da6b5559ba1` |
| Local image ID (not for pin) | `sha256:00ba258a66dac104fd5171074a0084462a64a1369d8513f3d0a634e2f24d15bc` |

## Verification methods

1. `docker buildx imagetools inspect pgvector/pgvector:pg16` — index still `sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b` (obs `2026-08-01T17:23:42Z`).
2. Index lists amd64 manifest `sha256:84a355869251af1a3379cfc9fa7b4dbf962c03f642a4bb7b339a203925071c43` unchanged.
3. Ephemeral `docker run --platform linux/amd64` of  
   `pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b`
4. SQL:

```sql
SELECT name, default_version, installed_version
FROM pg_available_extensions
WHERE name = 'vector';

CREATE EXTENSION vector;

SELECT extversion FROM pg_extension WHERE extname = 'vector';
SELECT '[1,2,3]'::vector::text;
```

5. Control file: `/usr/share/postgresql/16/extension/vector.control` → `default_version = '0.8.6'`

## Discrepancy cause

**Not conclusively proven** from repository or command evidence which specific prior factor produced the `0.8.2` observation.

Classification: `PREVIOUS_VERSION_OBSERVATION_NOT_REPRODUCIBLE`

Do not treat unproven hypotheses (stale cache, other platform, other tag) as facts.

## Effect on R0-7C4

- Historical R0-7C3 files that mention `0.8.2` are **preserved** but **superseded** by this correction.
- Owner expected amd64 version for R0-7C4 is now **`0.8.6`**.
- Validation must fail on any version other than `0.8.6`.
- Digest pin remains Option A index `sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b` — unchanged.
