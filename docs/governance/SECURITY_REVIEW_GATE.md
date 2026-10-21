# CONFORA – Security Review Gate

**Document ID:** CON-GOV-SEC-REVIEW-GATE-001
**Status:** Normative
**Date:** 2026-10-21
**Owner:** Miljan Savić, Repository Owner
**Authority:** Approved owner decision in [OWNER_DECISION_REGISTER.md](./OWNER_DECISION_REGISTER.md). This document restates that decision. It does not weaken it.

## Mandatory rule

Every PR that changes authentication, authorization, RBAC, tenant isolation, processing of sensitive data, or other security-critical functionality must pass an independent review before merge approval. The review covers:

1. Change analysis (security risks, regressions).
2. Access-control verification (authn, authz, tenant isolation).
3. Regression tests proving the fix and no breakage.
4. All relevant CI checks passing.
5. An independent reasoned GO/NO-GO tied to a specific commit SHA.

The reviewer must not be the author of the changes. Any later change to security-relevant code requires re-review of that part. Known tenant-isolation gaps block production use with real data until fixed.

## Application

- Merge approval is withheld until the independent reviewer records a reasoned GO for the exact commit SHA under review.
- A later commit that changes security-relevant code invalidates that GO for the changed part. That part is reviewed again.
- The author of the change cannot be the reviewer.
- A known tenant-isolation gap blocks production use with real data until the gap is fixed. Recording the gap does not authorize that use.
- Recording this gate does not grant merge of the pull request that introduced it. Merge authorization for that pull request is NOT_GRANTED.
