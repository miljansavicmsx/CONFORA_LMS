# Part A — Registry image identity

## Reference under analysis

`pgvector/pgvector:pg16`

| Field | Value | Class |
|-------|-------|-------|
| Registry | `docker.io` | tracked fact / registry inspect |
| Repository | `pgvector/pgvector` | registry inspect |
| Tag | `pg16` | workflow config |
| Tag mutability | **Mutable** | recommendation / known Hub behavior |
| Media type | `application/vnd.oci.image.index.v1+json` | registry inspect |

## Digest taxonomy (do not interchange)

| Kind | Digest | Notes |
|------|--------|-------|
| **Multi-platform index digest** | `sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b` | Preferred Option A pin target |
| **linux/amd64 platform manifest** | `sha256:84a355869251af1a3379cfc9fa7b4dbf962c03f642a4bb7b339a203925071c43` | Option B pin target; GHA `ubuntu-latest` |
| **linux/arm64 platform manifest** | `sha256:386f17b2364a613752d23b4e23c6e27b87b2997b3ac3ea23dac42df579670524` | Published |
| **amd64 image config digest** | `sha256:8e5355e9ff399a002fa46148399a1ac22fb3e9b2d390f857296e6da6b5559ba1` | From amd64 manifest `config.digest` |
| **Local Docker image ID** | `sha256:00ba258a66dac104fd5171074a0084462a64a1369d8513f3d0a634e2f24d15bc` | Local only; **NOT** a registry pin |
| Local `RepoDigests` observed | `pgvector/pgvector@sha256:00ba258a66dac104fd5171074a0084462a64a1369d8513f3d0a634e2f24d15bc` | Matches local ID; **must not** be treated as index digest |

### Prior R0-7C2 rejection validated

Local digest `sha256:00ba258a66dac104fd5171074a0084462a64a1369d8513f3d0a634e2f24d15bc` was correctly rejected for workflow pinning: it is **not**
the multi-platform index digest and is **not** the linux/amd64 platform manifest digest.

## Platforms

- `linux/amd64`
- `linux/arm64`
- Attestation manifests present (`vnd.docker.reference.type=attestation-manifest`)

## Local image metadata (observed)

| Field | Value |
|-------|-------|
| Created | `2026-05-15T14:24:05Z` |
| Architecture | `amd64` |
| OS | `linux` |
| Size (approx) | ~156 MB |
| Labels | `null` |
| PostgreSQL (runtime) | `16.14 (Debian 16.14-1.pgdg12+1)` |
| pgvector (control / available) | `0.8.2` |
| Base OS family | Debian (pgdg package path) |

## Upstream / provenance (public sources)

| Item | Finding |
|------|---------|
| Upstream project | https://github.com/pgvector/pgvector |
| Docker Hub | https://hub.docker.com/r/pgvector/pgvector |
| Relationship | Images published from upstream pgvector project extending official Postgres image |
| Publisher identity | Docker Hub namespace `pgvector` aligned with GitHub `pgvector/pgvector` |
| Signature / cosign | Not verified in this environment (`cosign` not installed; not installed per policy) |
| SBOM | Not retrieved; attestation-manifest entries exist on index — **not** treated as verified provenance |
| Tag replacement | Mutable tags (`pg16`) can move; versioned tags such as `0.8.6-pg16` exist upstream |

**Classification:** community/project-published image with public Dockerfile provenance —
**not** Docker Official Images library. Popularity alone is **not** treated as trust.


## R0-7C3A correction

pgvector extension version observed against the approved index digest on
**linux/amd64** is **`0.8.6`**, not `0.8.2`. Historical mentions of `0.8.2` in
this package are superseded; see `VERSION_RECONCILIATION.md`.
