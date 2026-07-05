# DPO-LEGAL-1 Identity Evidence / Manual ID Review

## Operational status: **PARTIAL**

| Aspect | Status |
|--------|--------|
| API module | `apps/api/src/identity-review/` — queue + PATCH |
| Staff UI | `IdentityReviewPage` — F5-UI-4 |
| RBAC | Read: STAFF_ID_VERIFIER, STAFF_DIR; Write: STAFF_ID_VERIFIER only |
| Storage category | PostgreSQL `IdentityVerification` + encrypted URL refs; blobs in object storage |
| Learner upload UI | **Partial** — pilot uses synthetic evidence |
| Public exposure | **None** — not in public verify or standard exports |
| Standard report export | **None** — evidenceRefs forbidden in export rules |
| Biometrics | **NOT IMPLEMENTED** — no biometric processing claimed |
| Automated decision | **None** — human review required |

## If external pilot proceeds (conditions)

- DPO must approve identity document categories processed.
- Retention and deletion schedule for `docUrlEnc` / `selfieUrlEnc` blobs — **placeholder pending**.
- Presigned staff preview URLs must remain audited and time-limited.

## If deferred

Not applicable — module exists but full operational enrollment is **not claimed** for external pilot.

**No operational external-pilot claim for identity evidence without DPO approval.**
