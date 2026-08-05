# CONFORA R0-7E Action and Artifact Pinning Policy

**Document ID:** CON-GOV-R07E-PIN-001
Status: PROPOSED NORMATIVE REPOSITORY PROMOTION — EFFECTIVE ONLY AFTER REVIEWED MERGE
**Owner:** CONFORA Architecture, Security, and Governance
**Authority level:** Governance Hierarchy Level 3

## Effectiveness and boundary

This policy becomes effective only after independent review and a separately
authorized true merge. It applies only when a future package is separately
authorized to touch a covered artifact. It authorizes no current workflow,
dependency, image, download, manifest, lockfile, or deployment change.

## Required controls

| Artifact class | Immutable identity | Provenance, integrity, and evidence | Rollback |
|----------------|--------------------|------------------------------------|----------|
| Third-party GitHub Actions | Full commit SHA; release tag only as annotation | Source repository, release mapping, maintainer provenance, permissions diff, prior/new SHA, and test evidence | Reviewed revert to the prior verified SHA |
| First-party GitHub Actions | Full commit SHA | Repository ownership, commit provenance, permissions, source review, tests, and approval | Reviewed revert to the prior verified SHA |
| Containers | Immutable image digest; version only as annotation | Registry provenance, signature or attestation where available, SBOM, vulnerability review, and tests | Restore the prior approved digest and revalidate |
| Downloaded binaries and archives | Fixed version plus trusted cryptographic checksum or signature | Trusted source URL, checksum or signature, verifier identity, command, output, and retained evidence | Reject on mismatch and restore the prior verified artifact |
| Package-manager dependencies | Declared bounded version and committed authoritative lockfile | Manifest/lock diff, registry provenance, audit/licence review, frozen clean install, and tests | Restore the prior manifest and lockfile through reviewed history |
| Generated lockfiles | Authorized generator and exact runtime version | Regenerate twice from clean inputs, compare hashes, and review dependency delta | Reject manual or non-reproducible output and restore prior inputs |

## Fail-closed and update rules

- Floating `latest` references, mutable security-sensitive tags, unverified
  remote execution, and curl-to-shell flows are prohibited.
- Verification failure is fail-closed.
- Updates require exact package authorization, documented provenance, integrity
  evidence, independent review, and rollback verification.
- Rollback uses reviewed forward history, normally a revert commit; history
  rewriting is not rollback.
- Evidence must exclude secrets, credentials, personal data, and unauthorized
  standards content.

Any exception requires a separate, time-bounded owner decision naming the exact
artifact, rationale, compensating controls, accountable owner, expiry, review,
and rollback.
