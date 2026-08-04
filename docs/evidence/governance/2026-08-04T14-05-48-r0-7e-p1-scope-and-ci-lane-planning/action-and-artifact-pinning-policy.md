# Proposed Action and Artifact Pinning Policy

Future workflow modifications should:

1. Pin GitHub Actions to immutable commit SHAs and annotate release versions.
2. Pin tools and container images by approved version and checksum or digest.
3. Reject unverified remote-script execution and curl-to-shell patterns.
4. Avoid floating latest and mutable tags for security-sensitive tooling.
5. Fail closed when checksum, signature, provenance, or digest verification fails.
6. Record source URL, version, digest, update rationale, and independent review.
7. Test update automation in a non-production context before adoption.
8. Preserve least-privilege workflow permissions and retention limits.

Each update requires reproducible checksum evidence. This is a planning proposal
only and changes no workflow.
