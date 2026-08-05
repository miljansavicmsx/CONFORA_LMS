# CONFORA R0-7E Action and Artifact Pinning Policy

**Document ID:** CON-GOV-R07E-PIN-001
**Status:** PROPOSED NORMATIVE REPOSITORY PROMOTION — EFFECTIVE ONLY AFTER REVIEWED MERGE
**Owner:** CONFORA Architecture & Governance
**Authority level:** Governance Hierarchy Level 3
**Owner decision:** OD-R07E-8

## Purpose and authority

This policy applies when a later package is separately authorized to change a
workflow, dependency, image, downloaded tool, or generated lockfile. It does not
authorize any such change.

Until this document is integrated by a separately reviewed and authorized
merge into the authoritative integration branch, it has no normative effect.

## Mandatory controls

| Artifact class | Required identity | Verification and evidence | Failure and rollback |
|----------------|-------------------|---------------------------|----------------------|
| Third-party GitHub Actions | Full immutable commit SHA; release tag only as annotation | Source, release provenance, permissions, prior/new SHA, and review | Fail closed; restore prior reviewed SHA in a reviewed revert |
| First-party GitHub Actions | Full immutable commit SHA | Ownership, provenance, permissions, tests, and approval | Fail closed on missing provenance; restore prior reviewed SHA |
| Containers | Immutable image digest; version only as annotation | Registry provenance, signature or attestation where available, SBOM, scan, and tests | Reject mutable tag-only use; restore prior approved digest |
| Downloaded binaries and archives | Fixed version plus trusted checksum or signature | Source URL, checksum or signature, verifier command and output | Reject and do not execute on mismatch; restore prior verified artifact |
| Package-manager dependencies | Declared bounded version plus committed authoritative lockfile | Manifest and lock diff, provenance, audit or licence review, frozen clean install, and tests | Frozen-install or unexpected lock mutation fails; restore prior manifest and lockfile |
| Generated lockfiles | Authorized generator and exact generator/runtime version | Regenerate twice from clean inputs, compare hashes, and review dependency delta | Reject manual or non-reproducible output; restore prior lockfile and inputs |

## General requirements

1. Floating `latest` references, mutable security-sensitive tags, unverified
   remote script execution, and curl-to-shell flows are prohibited.
2. Verification failure is fail-closed.
3. Updates require package-specific owner authorization, bounded path scope,
   independent review, and evidence before merge.
4. Rollback must use reviewed forward history, normally a revert commit; history
   rewriting is not a rollback mechanism.
5. Secrets, credentials, personal data, and proprietary standards content must
   not be captured in evidence.

## Exceptions

An exception requires a separate owner decision that names the artifact, scope,
rationale, compensating controls, accountable owner, expiry, review evidence,
and rollback. An exception does not authorize deployment or waive higher-level
security, privacy, tenant-isolation, audit, or segregation-of-duties controls.

## Non-claims

This policy does not assert that existing actions or artifacts satisfy these
controls, that repository CI is healthy, or that any implementation is secure,
compliant, production-ready, or authorized for deployment.
