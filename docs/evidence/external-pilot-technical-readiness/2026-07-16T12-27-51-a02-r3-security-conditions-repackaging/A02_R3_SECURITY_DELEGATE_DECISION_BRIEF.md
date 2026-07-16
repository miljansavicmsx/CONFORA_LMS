# A-02-R3 — Security Delegate Decision Brief

**Audience:** Authorized security delegate  
**Package status:** Technical conditions repackaged — **signature still required**  
**Does not approve external pilot by itself.**

## What changed since A-02 / A-02-R2

| Topic | At A-02 / A-02-R2 | Now (A-02-R3) |
|-------|-------------------|---------------|
| A-01-R4 OTP | 5/5 GO | Unchanged GO |
| Smoke attributes | Present / then cleaned in R1 | **Clean** (`[]`) |
| STAFF-MFA-3 | R1 PARTIAL; R2 fixed fixtures but package NO-GO | Technical **GO_PENDING_SECURITY_DELEGATE_SIGNOFF**; 5/5 OTP preserved |
| TD-085 / S17 | FAIL / privacy NO-GO mapping | **Local baseline restored**; S17 GO; TD-085 GO with transient infra note |
| Secret hygiene | Hardcoded password fallbacks in f5-3 | **Removed**; env-required |

## Recommended technical posture for review

Technical security conditions for MFA enrollment, STAFF-MFA-3 fixture integrity, public-verify privacy baseline, and ops secret hygiene are **ready for an actual security delegate decision**.

## Decision options (unchanged catalog)

1. **SIGN_INTERNAL_SECURITY_ACCEPTANCE_ONLY** — internal tech acceptance; external pilot still blocked pending DPO/legal + G-EP.
2. **SIGN_WITH_CONDITIONS_FOR_EXTERNAL_PILOT_REVIEW** — accept with written conditions (e.g. R-01 Keycloak direct-grant limitation accepted; staging validation required before cutover).
3. **DEFER_PENDING_ADDITIONAL_RECHECK** — if reviewer requires re-run of STAFF-MFA-3 / TD-085 under observed live stack.
4. **REJECT_PENDING_REMEDIATION** — if reviewer finds residual unacceptable.

## Conditions that remain after any security signature

- DPO/legal still unsigned.
- External pilot still not approved.
- Real personal data still not approved.
- Staging/production still not validated.

## What this brief is not

- Not a signature.
- Not external pilot approval.
- Not DPO/legal approval.
- Not production readiness.
