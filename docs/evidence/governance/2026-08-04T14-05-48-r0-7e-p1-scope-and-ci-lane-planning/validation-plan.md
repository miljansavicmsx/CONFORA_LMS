# Validation Plan

## P1 package validation

1. Reconfirm integration branch and PR #8 merge identity.
2. Parse summary.json with a strict JSON parser.
3. Compare changed-files.txt with Git's exact new-file list.
4. Assert all changed paths are under this package folder.
5. Assert existing-file, application-code, package-source, and workflow changes are zero.
6. Search for every required classification, non-claim, and owner decision.
7. Commit once with the authorized subject and verify parent f5e48ddb.
8. Push normally and verify local/remote equality, clean status, unchanged integration, and zero deployment.

## Future implementation validation

- Use a fresh clean clone at each approved tip.
- Run only commands whose complete inputs are tracked.
- Assert missing lanes block explicitly rather than disappear.
- Test compliance validators with negative overclaim fixtures.
- Preserve least privilege, immutable pins, redacted evidence, and zero deployment.
- Keep implementation, evidence, review, readiness, authorization, and merge separate.
