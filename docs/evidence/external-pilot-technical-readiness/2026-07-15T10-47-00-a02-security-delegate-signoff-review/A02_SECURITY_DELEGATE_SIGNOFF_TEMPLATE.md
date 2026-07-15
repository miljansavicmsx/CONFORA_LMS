# A-02 — Security Delegate Sign-off Template

**Task:** A02_SECURITY_DELEGATE_SIGNOFF_REVIEW  
**Package:** `docs/evidence/external-pilot-technical-readiness/2026-07-15T10-47-00-a02-security-delegate-signoff-review/`  
**Status:** **UNSIGNED** — template only

**Do not treat this file as approval until completed by an authorized security delegate with a real signature.**

---

## Reviewer identification

| Field | Value |
|-------|-------|
| **Security delegate name** | **PENDING** |
| **Role / title** | **PENDING** |
| **Organization** | **PENDING** |
| **Review date** | **PENDING** |

---

## Package reviewed

| Artifact | Reviewed ☐ |
|----------|:----------:|
| A02_SECURITY_DELEGATE_EVIDENCE_INDEX.md | ☐ |
| A02_SECURITY_DELEGATE_MFA_REVIEW.md | ☐ |
| A02_SECURITY_DELEGATE_RISK_REVIEW.md | ☐ |
| A02_SECURITY_DELEGATE_DECISION_BRIEF.md | ☐ |
| A-01-R4 evidence package (5/5 OTP) | ☐ |
| Prior SECURITY-DELEGATE-SIGNOFF-1 package | ☐ |
| STAFF-MFA-3 / R1 / TD-085 linked evidence | ☐ |

---

## A-01-R4 acknowledgment

| Statement | Confirm ☐ |
|-----------|:---------:|
| I acknowledge live Keycloak evidence of **5/5** real OTP credentials for the A-01 cohort | ☐ |
| I acknowledge no secrets/QR/tokens/passwords were committed in A-01-R4 | ☐ |
| I acknowledge external pilot remains **not** approved by A-01-R4 | ☐ |

---

## Decision (select one)

| Option | Selected ☐ |
|--------|:----------:|
| **SIGN_INTERNAL_SECURITY_ACCEPTANCE_ONLY** | ☐ |
| **SIGN_WITH_CONDITIONS_FOR_EXTERNAL_PILOT_REVIEW** | ☐ |
| **DEFER_PENDING_STAFF_MFA_3_RERUN** | ☐ |
| **DEFER_PENDING_SMOKE_ATTRIBUTE_CLEANUP** | ☐ |
| **REJECT_PENDING_REMEDIATION** | ☐ |

**Selected decision:** **PENDING**

---

## Conditions (if signing with conditions)

| # | Condition | Owner | Due | Status |
|---|-----------|-------|-----|--------|
| C-01 | _PENDING_ | _PENDING_ | _PENDING_ | ☐ |
| C-02 | _PENDING_ | _PENDING_ | _PENDING_ | ☐ |
| C-03 | _PENDING_ | _PENDING_ | _PENDING_ | ☐ |

Suggested conditions (optional for reviewer):

1. Remove smoke attributes on manager/staff/director before external cutover.  
2. Re-run STAFF-MFA-3 when API available.  
3. External pilot still requires DPO/legal + G-EP clearance.

---

## Explicit confirmations

| Confirmation | Yes ☐ | No ☐ |
|--------------|:-----:|:----:|
| External pilot with real candidate PII is authorized by this signature | ☐ | ☐ |
| Production deployment is authorized by this signature | ☐ | ☐ |
| Staging with real PII is authorized by this signature | ☐ | ☐ |
| DPO/legal approval is implied by this signature | ☐ | ☐ |

**Expected default until signed:** all **No**.

---

## Signature block

| Field | Value |
|-------|-------|
| **Signature** | **PENDING** |
| **Printed name** | **PENDING** |
| **Date (YYYY-MM-DD)** | **PENDING** |

---

## Post-sign-off actions

Upon **real** signed decision:

1. Store signed copy in this evidence folder (do not invent signature into this template).  
2. Update `summary.json` in a **separate** evidence commit with:
   - `security_delegate_signed: true`
   - `security_delegate_decision: <selected option>`
   - appropriate `final_verdict`
3. Do **not** set `external_pilot_approved: true` from security signature alone.
