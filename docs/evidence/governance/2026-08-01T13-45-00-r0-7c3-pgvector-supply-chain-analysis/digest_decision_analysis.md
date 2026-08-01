# Digest decision analysis

## Option A — Multi-platform index digest (recommended)

Form:

`pgvector/pgvector:pg16@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b`

or equivalently:

`pgvector/pgvector@sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b`

| Criterion | Assessment |
|-----------|------------|
| GHA compatibility | High — runners resolve platform automatically |
| Platform selection | Runtime selects amd64/arm64 from index |
| Reproducibility | High for the index content at pin time |
| If platforms added to index | Index digest changes → pin must update deliberately |
| Auditability | Clear single registry identity for the tag snapshot |

**Recommendation:** Prefer Option A for R0-7C4 implementation **subject to owner approval**.

## Option B — linux/amd64 platform manifest digest

Form:

`pgvector/pgvector@sha256:84a355869251af1a3379cfc9fa7b4dbf962c03f642a4bb7b339a203925071c43`

| Criterion | Assessment |
|-----------|------------|
| Exact GHA `ubuntu-latest` fit | Strong |
| Reproducibility | Highest for amd64-only |
| Portability | Breaks/arm64 local or future arm runners |
| Developer ARM hosts | Poor unless separate pin |
| Auditability | Good, but narrower than index |

Use only if owner explicitly requires amd64-only lock.

## Option C — Retain mutable tag

| Criterion | Assessment |
|-----------|------------|
| Supply-chain exposure | Tag can be retargeted without workflow PR |
| Auditability | Weak — “pg16” is not immutable |
| Rollback ambiguity | High |
| Change detection | Requires external monitoring |
| Suitability | Temporary condition only (current R0-7C2 state) |

**Not recommended** as the enduring governance posture after R0-7C3.

## Owner decision required

Yes — select A, B, or temporary C continuation before any workflow pin is implemented (R0-7C4).
