# DPO-LEGAL-SIGNOFF-1 — DPIA Decision Brief

**Task:** DPO-LEGAL-SIGNOFF-1  
**Date:** 2026-07-14  
**Status:** Decision brief for DPO — **not a completed DPIA**

---

## Executive summary

| Field | Value |
|-------|-------|
| **DPIA required?** | **PENDING_DPO_DECISION** |
| **Completed DPIA on file?** | **NO** |
| **DPO written no-DPIA decision on file?** | **NO** |
| **External pilot impact** | External hosted pilot with **real candidate PII** remains **BLOCKED** until G-EP-05 satisfied |

**Do not conclude "DPIA not required"** — no signed DPO decision exists. L3 scoping note recommends DPIA before external hosted pilot unless DPO documents otherwise in writing.

---

## Reasons supporting DPIA review

| # | Factor | Source | Assessment |
|---|--------|--------|------------|
| 1 | Certification / accreditation processing affecting individuals | DPIA_SCOPING_NOTE §2 | **High** — ISO 17024 high-impact decisions |
| 2 | Identity evidence — government ID images, manual IAL-2 review | LB-15; IAL2 note | **High** — potential Art. 9; minimization proposed |
| 3 | Examination records — answers, scores, optional video | LB-04, LB-05; R-03–R-06 | **Medium–High** |
| 4 | Public verification — minimized fields, IP logging | LB-08; S17 GO | **Medium** — LIA also required |
| 5 | Multi-tenant isolation | F5-5 tenant isolation PASS | **Medium** — cross-tenant breach impact |
| 6 | Large-scale processing | Volume at external launch | **TBD** — depends on pilot cohort size |
| 7 | Systematic monitoring | Audit logs, exam anomaly logs | **Medium** — accountability vs privacy |
| 8 | AI-assisted workflows (if enabled in pilot) | AI governance rules | **Medium** — human oversight mandatory |

---

## High-risk factors (Art. 35 indicators — for DPO assessment)

| Indicator | Present? | Notes |
|-----------|----------|-------|
| Special category data (Art. 9) | **Possible** | Government ID copies — counsel position unresolved |
| Systematic monitoring | **Partial** | Audit, exam security logs |
| Automated decision with legal effect | **No (MVP)** | Human certification decisions |
| Large-scale processing | **TBD** | Pilot scale to be defined |
| Vulnerable data subjects | **Low–Medium** | Professional certification context |
| Innovative technology | **Partial** | AI assistive; no biometrics MVP |
| Data matching / combining | **Partial** | Cert + exam + identity workflows |

---

## Safeguards already implemented (technical — not DPIA substitute)

| Safeguard | Evidence | Legal sign-off |
|-----------|----------|----------------|
| No biometrics / selfie MVP | EXTERNAL_PILOT_PRIVACY_GATE exclusions | **Yes (scope rule)** |
| Manual ID review only | IAL2 note draft | Pending G-EP-06 |
| 14-day ID image retention proposed | R-01 draft | Unsigned |
| RBAC + tenant isolation | F5-5, admin/learner acceptance | Technical |
| Append-only audit with redaction | F5-5 audit PASS | Retention unsigned |
| Public verify read-only + minimization | S17 GO; PUBLIC_VERIFICATION_POLICY | LIA unsigned |
| Staff MFA enforcement | STAFF-MFA-3 | Security delegate pending |
| AI human oversight requirement | Baseline + AI governance rules | Policy unsigned |
| DSR procedure drafted | DSR_PROCEDURE.md | Not approved |
| hCaptcha abuse prevention (when configured) | G-EP-08 NOT MET | External pilot blocked |

---

## Unresolved questions for DPO/legal

| # | Question | Owner | Gate ref |
|---|----------|-------|----------|
| Q1 | Is formal DPIA required before **any** external hosted pilot with real candidates? | DPO | G-EP-05 |
| Q2 | If DPIA required, scope: full platform vs pilot subset? | DPO + Legal | G-EP-05 |
| Q3 | Art. 9 position for government ID images — condition of law vs explicit consent? | Legal + DPO | G-EP-02, LB-15 |
| Q4 | Public verification LIA outcome — proceed, restrict fields, or defer external URL? | Legal + DPO | G-EP-11 |
| Q5 | Video/screen exam evidence — include in DPIA depth if enabled? | DPO | LB-04 |
| Q6 | DSR export E2E — sufficient for DPIA residual risk closure? | DPO | F5-5 residual |
| Q7 | Hosted subprocessors — transfer impact on DPIA? | Legal | G-EP-10 |

---

## Required DPO/legal decision

The DPO must record **one** of the following in writing (with date and signature):

1. **Execute formal DPIA** per `DPIA_FORMAL_ASSESSMENT.md` before external hosted pilot; OR  
2. **Document no-DPIA decision** with rationale per Art. 35(1) assessment (if applicable); OR  
3. **Approve internal/local synthetic pilot only** without DPIA (consistent with scoping note for CLRC).

**No option above has been signed.**

---

## Impact on external pilot

| Scenario | External pilot status |
|----------|----------------------|
| DPIA not completed and no signed no-DPIA decision | **BLOCKED** (G-EP-05 NOT MET) |
| DPIA completed with residual high risks unmitigated | **BLOCKED** until remediation or conditional approval with documented conditions |
| DPO approves internal synthetic pilot only | External real-candidate pilot remains **BLOCKED** |

---

## Related documents

| Document | Path | Status |
|----------|------|--------|
| DPIA scoping note | `docs/legal/gdpr/DPIA_SCOPING_NOTE.md` | Scoping complete; DPO review PENDING |
| Formal DPIA assessment | `docs/legal/gdpr/DPIA_FORMAL_ASSESSMENT.md` | L4 — §12 sign-off pending |
| LIA public verification | `docs/legal/gdpr/LIA_PUBLIC_VERIFICATION_ASSESSMENT.md` | §9 pending |
| External pilot gate | `docs/legal/gdpr/EXTERNAL_PILOT_PRIVACY_GATE.md` | 0/11 conditions met |

---

## Explicit non-claims

- DPIA is **not** completed.  
- DPIA is **not** waived in writing.  
- This brief does **not** constitute a Data Protection Impact Assessment under Art. 35 GDPR.
