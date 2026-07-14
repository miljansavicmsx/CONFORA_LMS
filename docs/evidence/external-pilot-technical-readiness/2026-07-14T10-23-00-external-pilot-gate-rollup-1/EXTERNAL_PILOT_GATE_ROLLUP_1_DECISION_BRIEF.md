# EXTERNAL-PILOT-GATE-ROLLUP-1 — Decision Brief

**Task:** EXTERNAL-PILOT-GATE-ROLLUP-1  
**Date:** 2026-07-14  
**Audience:** Program governance, security delegate, DPO/legal, platform leadership

---

## Decision today

| Decision | Value |
|----------|-------|
| **External pilot** | **NO-GO** |
| **Real personal data** | **NOT AUTHORIZED** |
| **Production** | **NOT READY** |
| **Staging** | **NOT VALIDATED** |
| **Local/synthetic pilot** | **SUPPORTED** (CLRC conditions) |

**Final verdict:** `EXTERNAL_PILOT_GATE_ROLLUP_1_NO_GO_PENDING_SECURITY_DPO_LEGAL_AND_PRIVACY_GATES`

---

## Reason

Required **human sign-offs** and **privacy/legal conditions** are pending. Technical local baseline is strong, but external hosted pilot with real candidates requires G-EP 11/11 (or documented waivers) — currently **0/11 met**.

---

## What the evidence supports

| Claim | Supported? | Basis |
|-------|:----------:|-------|
| Local sequential baseline healthy | **Yes** | TD-085 2026-07-13 — 6/6 PASS |
| Staff MFA backend enforcement | **Yes (conditional)** | STAFF-MFA-3 — 403 without MFA |
| Public verification technical controls | **Yes** | S17 GO — minimization probed |
| Admin/learner flows locally | **Yes** | 15/15 + 11/11 acceptance |
| Security controls (local) | **Yes** | F5-5 security PASS |
| Audit immutability | **Yes** | F5-5 audit PASS |
| External pilot authorized | **No** | L5 BLOCKED; all packages unsigned |
| Privacy/legal clearance | **No** | DPO package unsigned; G-EP 0/11 |
| Real PII on external host | **No** | Explicit block |

---

## Internal/local synthetic pilot

Local CLRC synthetic pilot is **supported** by consolidated evidence:

- TD-085 GO (2026-07-13)  
- Admin-gov + learner acceptance GO  
- S17 public verify GO  
- Local pilot rollup GO with residual external gates  

**This is not equivalent to external pilot approval.** CLRC rules prohibit real candidate PII unless separately authorized.

---

## External pilot with real candidates

**BLOCKED** until:

1. Security delegate sign-off (B-EP-01)  
2. DPO/legal sign-off (B-EP-02)  
3. DPIA decision (B-EP-03)  
4. Signed retention, DSR, privacy notice, legal basis (B-EP-05, 06, 11, 12)  
5. Processor DPAs (B-EP-07)  
6. Manual TOTP enrollment (B-EP-08)  
7. Staging validation if hosted (B-EP-09)  
8. F5-5 residuals addressed or formally accepted (B-EP-10)  
9. Explicit real PII authorization (B-EP-04)  
10. Formal L5 external pilot decision update  

---

## Required sequence

| Step | Action | Owner |
|------|--------|-------|
| 1 | Complete manual TOTP enrollment for external-facing staff | Security + IT/IdP |
| 2 | Security delegate review and sign-off | Security delegate |
| 3 | DPO/legal review and sign-off | DPO + Legal |
| 4 | DPIA decision (execute or document no-DPIA) | DPO |
| 5 | Approve DSR, retention, privacy notice, legal basis | DPO + Legal + Director |
| 6 | Resolve processor/DPA status for hosted stack | Legal |
| 7 | Configure hCaptcha; sign LIA if external public URL | Security + Legal |
| 8 | Validate staging/production (if external hosted) | Platform + Ops |
| 9 | Issue final external pilot approval decision | Program governance |

Steps 2–3 may proceed in parallel after step 1 begins. Step 9 is **last** and requires signed evidence.

---

## Sign-off package status

| Package | Status | Verdict |
|---------|--------|---------|
| SECURITY-DELEGATE-SIGNOFF-1 | Created, committed | READY_FOR_REVIEW_NOT_SIGNED |
| DPO-LEGAL-SIGNOFF-1 | Created, committed | READY_FOR_REVIEW_NOT_SIGNED |

Both packages are ready for human review. Neither constitutes approval.

---

## Explicit non-claims

- External pilot approved: **FALSE**  
- DPO/legal approved: **FALSE**  
- Security delegate approved: **FALSE**  
- Real personal data approved: **FALSE**  
- Production/staging ready: **FALSE**  
- GDPR compliance: **FALSE**
