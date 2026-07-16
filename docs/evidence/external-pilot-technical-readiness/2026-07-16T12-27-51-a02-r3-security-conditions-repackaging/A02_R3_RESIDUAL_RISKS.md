# A-02-R3 — Residual Risks

## Accepted / documented technical residuals

| ID | Risk | Status | Notes |
|----|------|--------|-------|
| R-01 | Keycloak direct-grant TOTP / `amr` claim limitation | **DOCUMENTED** | Privileged-with-MFA route proof remains PARTIAL under password-grant; browser/OTP enrollment path is the intended external control |
| R-02 | TD-085 transient infra notes (`admin-gov`, `f4-9`) | **DOCUMENTED** | Overall `TD_085_GO_WITH_TRANSIENT_INFRA_NOTE`; not mapped as privacy/RBAC regression after S17-R1 |
| R-03 | Local-only validation environment | **DOCUMENTED** | Staging/production not validated |

## Organizational / governance residuals (blockers)

| ID | Risk | Status | Blocks |
|----|------|--------|--------|
| G-01 | Security delegate actual decision unsigned | **PENDING** | External pilot security gate |
| G-02 | DPO/legal unsigned | **PENDING** | External pilot legal gate |
| G-03 | External pilot not approved | **NOT APPROVED** | Cutover |
| G-04 | Real personal data not approved | **NOT APPROVED** | Pilot with real PII |

## Controls not weakened

Privacy, RBAC, tenant isolation, MFA, audit, and governance boundaries are recorded as **not weakened** across A-01-R4 → R1A evidence packages.

## Explicit non-claims

- Security delegate has **not** signed.
- External pilot is **not** approved.
- DPO/legal has **not** signed.
- Staging/production are **not** validated.
