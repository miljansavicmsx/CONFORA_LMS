# Independent supply-chain assessment

| Finding | Status |
|---------|--------|
| Both services use approved immutable OCI index digest | Yes — `sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b` |
| Platform-specific / config / local ID substituted | No |
| Mutable-only service references removed | Yes |
| Current tag resolution matches pinned index | Yes (`NO` drift at review time) |
| Signed-image verification | `DEFERRED` |
| arm64 version parity | `NOT_VERIFIED` |

Digest pinning improves reproducibility but is **not** equivalent to signature
or provenance verification.
