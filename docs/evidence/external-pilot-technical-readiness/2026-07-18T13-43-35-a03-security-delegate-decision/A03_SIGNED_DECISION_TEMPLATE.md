# A-03 — Signed Decision Template

**Task:** `A03_SECURITY_DELEGATE_DECISION`  
**Package:** `docs/evidence/external-pilot-technical-readiness/2026-07-18T13-43-35-a03-security-delegate-decision/`  
**Status:** **UNSIGNED** — template only

**Do not treat this file as approval until completed by an authorized security delegate with a real signature and a recorded decision code.**

---

## Reviewer identification

| Field | Value |
|-------|-------|
| Security delegate name | **PENDING** |
| Role / title | **PENDING** |
| Organization | **PENDING** |
| Review date | **PENDING** |

---

## Package reviewed

| Artifact | Reviewed |
|----------|:--------:|
| A03_SECURITY_DELEGATE_EVIDENCE_INDEX.md | [ ] |
| A03_SECURITY_DELEGATE_REVIEW_RECORD.md | [ ] |
| A03_SECURITY_DELEGATE_DECISION.md | [ ] |
| A03_SECURITY_DELEGATE_CONDITIONS.md | [ ] |
| A03_REMAINING_EXTERNAL_PILOT_BLOCKERS.md | [ ] |
| Linked A-02-R3 package | [ ] |
| Linked A-01-R4 / STAFF-MFA-3 / TD-085 / S17-R1A evidence | [ ] |

---

## Technical acknowledgments

| Statement | Confirm |
|-----------|:------:|
| I acknowledge A-01-R4 evidence of 5/5 external-facing staff TOTP enrollment | [ ] |
| I acknowledge STAFF-MFA-3 technical GO pending security delegate signoff with OTP preserved | [ ] |
| I acknowledge TD-085/S17 local privacy baseline restored (no-auth, read-only, PII minimization) | [ ] |
| I acknowledge secret hygiene restored (password fallbacks removed) | [ ] |
| I acknowledge Keycloak direct-grant TOTP/amr limitation remains documented | [ ] |
| I acknowledge external pilot is **not** approved by this signature alone | [ ] |
| I acknowledge DPO/legal remains separate | [ ] |

---

## Decision (select exactly one)

| Option | Selected |
|--------|:--------:|
| `ACCEPT_SECURITY_CONDITIONS_FOR_INTERNAL_PILOT_CONTINUATION_ONLY` | [ ] |
| `ACCEPT_WITH_CONDITIONS_FOR_EXTERNAL_PILOT_GATE_REVIEW` | [ ] |
| `DEFER_PENDING_DPO_LEGAL_SIGNOFF` | [ ] |
| `DEFER_PENDING_ADDITIONAL_SECURITY_EVIDENCE` | [ ] |
| `REJECT_PENDING_REMEDIATION` | [ ] |

**Selected decision code:** **PENDING**

---

## Conditions (required if ACCEPT_WITH_CONDITIONS)

| # | Condition | Owner | Due | Status |
|---|-----------|-------|-----|--------|
| C-01 | _PENDING_ | _PENDING_ | _PENDING_ | [ ] |
| C-02 | _PENDING_ | _PENDING_ | _PENDING_ | [ ] |
| C-03 | _PENDING_ | _PENDING_ | _PENDING_ | [ ] |

---

## Explicit confirmations (expected defaults: No)

| Confirmation | Yes | No |
|--------------|:---:|:--:|
| External pilot with real candidate PII is authorized by this signature | [ ] | [ ] |
| DPO/legal approval is included in this signature | [ ] | [ ] |
| Staging environment is validated by this signature | [ ] | [ ] |
| Production readiness is claimed by this signature | [ ] | [ ] |

---

## Signature block

| Field | Value |
|-------|-------|
| Signature | **UNSIGNED** |
| Date | **PENDING** |
| Method (wet ink / digital cert / etc.) | **PENDING** |
| Artifact attachment path | **PENDING** (becomes `signed_artifact_path` in follow-up summary) |

---

## Post-signature instructions

1. Do not edit historical A-02-R3 summaries to pretend they were signed.
2. Create a follow-up evidence slice that copies the completed decision into `summary.json`.
3. Keep `external_pilot_approved`, `dpo_legal_signed`, and readiness claims false unless separate packages authorize them.
