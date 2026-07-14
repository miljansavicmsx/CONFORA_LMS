# EXTERNAL-PILOT-GATE-ROLLUP-1 — Next Action Plan

**Task:** EXTERNAL-PILOT-GATE-ROLLUP-1  
**Date:** 2026-07-14  
**Priority:** P0 = blocks external pilot; P1 = required before external hosted; P2 = ongoing improvement

---

## Action plan

| Action ID | Action | Owner | Input evidence | Expected artifact | Priority | Blocks |
|-----------|--------|-------|----------------|-------------------|----------|--------|
| A-01 | Enroll all external-facing staff in Keycloak TOTP; verify no smoke bypass on external users | Security + IT/IdP | STAFF-MFA-3 closure; SD-R01 | TOTP enrollment log per user | **P0** | B-EP-08, R-EP-12 |
| A-02 | Security delegate reviews SECURITY-DELEGATE-SIGNOFF-1 and completes sign-off template | Security delegate | `security-delegate-signoff-1/` | Signed SECURITY_DELEGATE_SIGNOFF_1_SIGNOFF_TEMPLATE | **P0** | B-EP-01, R-EP-01 |
| A-03 | DPO/legal reviews DPO-LEGAL-SIGNOFF-1 and completes sign-off template | DPO + Legal | `dpo-legal-signoff-1/` | Signed DPO_LEGAL_SIGNOFF_1_SIGNOFF_TEMPLATE | **P0** | B-EP-02, R-EP-02 |
| A-04 | DPO records DPIA decision — execute formal DPIA or document no-DPIA in writing | DPO | DPIA_SCOPING_NOTE; DPIA_FORMAL_ASSESSMENT | Signed DPIA or no-DPIA decision record | **P0** | B-EP-03, R-EP-05, G-EP-05 |
| A-05 | Legal counsel signs legal basis register LB-01–LB-15; resolve Art. 9 for ID images | Legal counsel | LEGAL_BASIS_REGISTER.md | Signed register; LB-15 resolution | **P0** | B-EP-12, R-EP-09, G-EP-02 |
| A-06 | Sign retention approval register R-01–R-16 | Legal + DPO + Director | RETENTION_DECISION_REGISTER.md | Signed RETENTION_APPROVAL_REGISTER | **P0** | B-EP-05, R-EP-06, G-EP-03 |
| A-07 | Approve DSR procedure; prove E2E export workflow | DPO + Legal + Engineering | DSR_PROCEDURE.md; F5-5 residual | Signed DSR procedure; export test evidence | **P0** | B-EP-06, R-EP-07, G-EP-04 |
| A-08 | Complete subprocessor register and sign DPAs for hosted stack | Legal + Procurement | DPO processors doc; GDPR sign-off log | Signed DPAs; transfer mechanism docs | **P0** | B-EP-07, R-EP-08, G-EP-10 |
| A-09 | Approve and publish GDPR policy / privacy notice | DPO + Legal + Director | CONFORA_GDPR_POLICY.md; publication checklist | Published policy; G-EP-01 COMPLETE | **P0** | B-EP-11, R-EP-10 |
| A-10 | Sign IAL-2 manual ID review legal validation note | Legal + DPO | IAL2_MANUAL_ID_REVIEW_LEGAL_VALIDATION_NOTE.md | Signed validation note | **P0** | R-EP-11, G-EP-06 |
| A-11 | Deliver verifier / ID reviewer training; record attendance | Compliance | manual-id-review-training/ | Training attendance log | **P1** | R-EP-20, G-EP-09 |
| A-12 | Configure hCaptcha; set VERIFY_CAPTCHA_SKIP=false on external URLs | Security | G-EP-08 | Env audit evidence | **P1** | B-EP-14, R-EP-17 |
| A-13 | Complete and sign LIA for public verification | Legal + DPO | LIA_PUBLIC_VERIFICATION_ASSESSMENT.md | Signed LIA §9 | **P1** | B-EP-13, R-EP-16, G-EP-11 |
| A-14 | Validate staging environment per STG-001 (if external hosted pilot) | Platform + Ops | STG-001 decisions; no current staging evidence | Staging validation evidence folder | **P1** | B-EP-09, R-EP-13 |
| A-15 | Draft and approve external pilot participant terms / consent | Legal + DPO | L5 decision record | Signed participant terms | **P0** | B-EP-11 |
| A-16 | Close or formally accept F5-5 residual risks | DPO + Engineering | F5-5 open risks register | Updated risks.json; corrective action closure | **P1** | B-EP-10, R-EP-14 |
| A-17 | Explicit written authorization for real personal data on external host | DPO + Legal + Director | L5 decision record | Signed real-PII authorization | **P0** | B-EP-04, R-EP-04 |
| A-18 | Update L5 EXTERNAL_PILOT_DECISION_RECORD upon 11/11 G-EP (or waivers) | Program governance | All signed artifacts | L5 status CLEARED with evidence folder ref | **P0** | R-EP-03 — **final step** |
| A-19 | Investigate wrong-tenant staff probe HTTP 200 on reports overview | Engineering | SD-R10; F5-3 boundary tests | Fix or documented risk acceptance | **P2** | R-EP-23 |
| A-20 | Re-run TD-085 after any production-impacting change | Engineering | TD-085 script | Fresh td-085 evidence folder | **P2** | Local baseline maintenance |

---

## Critical path (external hosted pilot with real candidates)

```
A-01 (TOTP)
    ├── A-02 (Security delegate) ──┐
    └── A-03 (DPO/legal) ──────────┼── A-04..A-10, A-15 (Privacy bundle)
                                    │
                    A-12, A-13 (Public controls)
                                    │
                    A-14 (Staging — if hosted)
                                    │
                    A-17 (Real PII authorization)
                                    │
                    A-18 (L5 final approval) ◄── LAST
```

---

## Parallel workstreams

| Workstream | Actions | Can start now? |
|------------|---------|----------------|
| **Security** | A-01, A-02, A-12 | Yes |
| **DPO/Legal** | A-03, A-04, A-05, A-06, A-07, A-09, A-10, A-13, A-15 | Yes (review packages) |
| **Legal/Procurement** | A-08 | After hosted stack finalized |
| **Platform/Ops** | A-14 | After hosting decision |
| **Engineering** | A-16, A-19, A-20 | Ongoing |

---

## Blocking relationships

| Action | Directly unblocks |
|--------|-------------------|
| A-02 | G-EP-07 closure (with A-01) |
| A-03 | DPO/legal gate; enables privacy decisions |
| A-04–A-10, A-15 | G-EP-01–06, 10–11 |
| A-17 | Real PII processing authorization |
| A-18 | External pilot program GO (only after all P0 complete) |

---

## Explicit non-claims

Completing this action plan is **not** implied by creating this rollup. No action marked complete unless evidence exists.
