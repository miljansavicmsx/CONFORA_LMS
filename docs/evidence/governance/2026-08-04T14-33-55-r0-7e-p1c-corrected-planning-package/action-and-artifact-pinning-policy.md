# Proposed Action and Artifact Pinning Policy

This proposal applies only when a later package is separately authorized to
change a workflow, dependency, image, tool, or generated lockfile.

| Artifact class | Pinning mechanism | Verification | Update authorization | Required evidence | Failure behavior | Rollback |
|---|---|---|---|---|---|---|
| Third-party GitHub Actions | Full immutable commit SHA with reviewed release annotation | Source repository, maintainer history, release provenance, permissions, and SHA review | Separate workflow-scope owner authorization plus independent review | Prior/new SHA, source URL, release mapping, permissions diff, test run | Fail closed; action is not used when provenance or SHA cannot be verified | Restore prior reviewed SHA in a reviewed revert commit |
| First-party GitHub Actions | Full immutable commit SHA even when an organizational tag exists | Repository ownership, commit provenance, permissions, and expected source tree | Owning team approval, change-control record, independent workflow review | Repository/commit identity, provenance, test results, approval | Fail closed on missing provenance or unexpected source | Restore prior reviewed SHA and preserve incident evidence |
| Containers | Immutable image digest; human-readable version only as annotation | Registry provenance, signature/attestation where available, SBOM and vulnerability review | Platform and Security approval for digest change | Registry, digest, version, SBOM, scan, attestation, test results | Reject mutable tag-only reference or failed verification | Restore prior approved digest and rerun validation |
| Downloaded binaries and archives | Fixed version plus cryptographic checksum from a trusted channel | Verify checksum/signature before execution and record source TLS URL | Tool owner and Security approval | Version, source URL, checksum/signature, verifier command/output, retention location | Delete/reject artifact and fail closed on mismatch | Restore retained prior verified version/checksum through reviewed change |
| Package-manager dependencies | Declared bounded version policy plus committed authoritative lockfile and frozen install | Lockfile integrity, registry provenance, audit/license review, deterministic clean install | Package owner approval; security-sensitive updates require Security review | Manifest/lock diff, audit/license result, install/test logs, rationale | Frozen install failure or unexpected lock mutation fails the lane | Reviewed restoration of prior manifest and lockfile, then clean validation |
| Generated lockfiles | Authorized generator and exact generator/runtime version; no manual alteration | Regenerate twice from clean inputs and compare; review dependency delta | Package owner authorizes generator run; reviewer approves resulting diff | Generator/version, commands, input manifest, reproducibility hashes, reviewed diff | Non-reproducible or manually altered lockfile is rejected | Reviewed revert to prior lockfile and generator inputs |

No floating latest tag, mutable security-sensitive tag, unverified remote
script execution, or curl-to-shell flow is permitted. Verification failure is
fail-closed. Exceptions require a separately approved, time-bounded owner
decision with compensating controls and expiry.

artifact_class_count = 6
artifact_class_missing_rollback_count = 0
