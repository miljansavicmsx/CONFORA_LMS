# Owner decision update — R0-7C3A

| Decision | Value |
|----------|-------|
| Digest strategy | Option A — multi-platform OCI index |
| Approved index digest | `sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b` |
| Digest substitution | **Forbidden** (no platform/config/local ID / other tag) |
| Expected extension version (`linux/amd64`) | **`0.8.6`** |
| Previous `0.8.2` expectation | **Superseded** |
| Alternative image to retain `0.8.2` | **`NOT_APPROVED`** |
| Version mismatch vs expected | **Blocking** for R0-7C4 |
| `linux/arm64` version parity | **`NOT_VERIFIED`** — not claimed |
| Signed-image policy | `DEFERRED` |
| Prisma / migrations / seed | `NOT_RUN` |
| `packages/database` | `UNTRACKED_EXCLUDED` |
| Production access / deploy auth | `NONE` / `false` |

## Continuation gate

R0-7C4 may continue only after this evidence correction is committed and
independently inspectable on `governance/r0-7c3-pgvector-supply-chain-analysis`.
