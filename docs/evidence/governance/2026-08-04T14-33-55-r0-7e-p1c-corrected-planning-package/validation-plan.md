# Validation Plan

## Package creation validation

1. Verify local, upstream, planning, and integration identities.
2. Verify no planning PR and zero repository deployments.
3. Record the original package tree object at bf33e4a and compare it before commit, after commit, and after push.
4. Parse summary.json with a strict JSON parser.
5. Compare changed-files.txt to Git's exact 24-path status list.
6. Assert every change is an addition under the corrected package folder.
7. Assert zero workflow, source, manifest, lockfile, existing-file, or unauthorized changes.
8. Validate six lane identifiers and all required lane fields.
9. Validate sixteen unique risk IDs and all required risk fields.
10. Validate twenty-three acceptance criteria with method, evidence, pass, fail, gate, and blocking status.
11. Validate eleven work packages and every required package field.
12. Validate six artifact classes and a rollback for each.
13. Validate eight unresolved owner decisions and zero adopted decisions.
14. Search all 24 files for SHA, supersession, status, authorization, and non-claim contradictions.
15. Commit once with the exact authorized subject and parent; push once without force.
16. Reverify remote identity, no PR, no manual run for the correction head, zero deployments, and clean status.

## Future implementation validation

Future work uses a fresh clean clone, exact owner-approved paths, immutable tool
identities, deterministic commands, negative missing-authority tests, redacted
evidence, separate independent review, separate merge authorization, and zero
deployment. A proposed command remains PROPOSED — NOT IMPLEMENTATION VERIFIED
until independently reproduced against complete tracked inputs.
