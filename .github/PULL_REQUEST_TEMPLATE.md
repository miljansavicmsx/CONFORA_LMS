## Summary

<!-- What changed and why. -->

## Security Review Gate

Owner decision, 2026-10-21 (`docs/governance/SECURITY_REVIEW_GATE.md`).

If this pull request changes authentication, authorization, RBAC, tenant isolation, processing of sensitive data, or other security-critical functionality, an independent reviewer who is not the author must complete the review before merge approval. Check the first box only when none of those areas change.

- [ ] This pull request does not change authentication, authorization, RBAC, tenant isolation, processing of sensitive data, or other security-critical functionality.
- [ ] 1. Change analysis is recorded (security risks and regressions).
- [ ] 2. Access-control verification is recorded (authn, authz, tenant isolation).
- [ ] 3. Regression tests prove the fix and show no breakage.
- [ ] 4. All relevant CI checks are passing.
- [ ] 5. Independent reasoned GO/NO-GO is tied to commit SHA: `________________`
- [ ] The reviewer is not the author of the changes.
- [ ] Any later change to security-relevant code will be re-reviewed for that part.
- [ ] Known tenant-isolation gaps block production use with real data until fixed.

Merge authorization: **NOT_GRANTED** until an independent reviewer records a reasoned GO for the exact commit SHA under review.
