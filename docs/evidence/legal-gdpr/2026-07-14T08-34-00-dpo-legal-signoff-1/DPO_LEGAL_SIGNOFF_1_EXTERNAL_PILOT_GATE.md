# DPO-LEGAL-SIGNOFF-1 — External Pilot Gate (DPO/Legal)

**Task:** DPO-LEGAL-SIGNOFF-1  
**Date:** 2026-07-14  
**Gate reference:** `docs/legal/gdpr/EXTERNAL_PILOT_PRIVACY_GATE.md` (L4-GDPR-EPG-001)  
**Authorization record:** `docs/legal/gdpr/L5_EXTERNAL_PILOT_DECISION_RECORD.md`

---

## Final gate status

| Metric | Value |
|--------|-------|
| **External pilot gate status** | **EXTERNAL_PILOT_NOT_APPROVED_DPO_LEGAL_PENDING** |
| **External pilot approved** | **NO** |
| **G-EP conditions met** | **0 / 11** |
| **DPO/legal sign-off** | **PENDING** |
| **Security delegate sign-off** | **PENDING** |

---

## Cross-gate matrix (DPO/legal perspective)

| Gate item | Status | Evidence / reference | DPO/legal notes |
|-----------|--------|----------------------|-----------------|
| Security delegate sign-off | **PENDING** | `docs/evidence/f5-pilot-readiness/2026-07-13T21-48-00-security-delegate-signoff-1/` | Package ready; not signed; G-EP-07 linked |
| DPO/legal sign-off | **PENDING** | This package | Template unsigned |
| Privacy notice | **PARTIAL** | `CONFORA_GDPR_POLICY.md` DRAFT; publication checklist P-01–P-09 open | G-EP-01 NOT MET — not published |
| DSR procedure | **PARTIAL** | `DSR_PROCEDURE.md` DRAFT | G-EP-04 NOT MET — not approved |
| Retention schedule | **PARTIAL** | `RETENTION_DECISION_REGISTER.md` PROPOSED | G-EP-03 NOT MET — not signed |
| DPIA | **PENDING decision** | `DPIA_SCOPING_NOTE.md`; `DPIA_FORMAL_ASSESSMENT.md` | G-EP-05 NOT MET |
| Processor agreements | **PARTIAL** | Draft register; DPAs PENDING/DEFERRED | G-EP-10 NOT MET |
| External participant consent/terms | **PARTIAL** | Scheme enrollment terms TBD; policy draft | No signed pilot participant terms |
| Incident notification procedure | **PARTIAL** | Referenced in DPIA_FORMAL_ASSESSMENT; breach procedure draft | Operational path not signed for external |
| Public verification privacy | **PARTIAL** | S17 GO technical; LIA unsigned; PUBLIC_VERIFICATION_PRIVACY_NOTE draft | G-EP-11 NOT MET; technical minimization PASS |
| Evidence minimization | **PARTIAL** | F5-5 identity evidence PARTIAL; R-01 14d proposed; no biometrics MVP | ID upload UI partial; hosted lifecycle unproven |

---

## Mandatory G-EP conditions (L4 gate — unchanged)

| # | Condition | Status | Sign-off |
|---|-----------|--------|----------|
| G-EP-01 | Signed GDPR policy (not DRAFT) | ☐ **NOT MET** | DPO ☐ Legal ☐ Director ☐ |
| G-EP-02 | Approved legal basis register LB-01–LB-15; Art. 9 resolved | ☐ **NOT MET** | Legal ☐ |
| G-EP-03 | Approved retention register R-01–R-16 | ☐ **NOT MET** | Legal ☐ DPO ☐ Director ☐ |
| G-EP-04 | DSR procedure approved | ☐ **NOT MET** | DPO ☐ Legal ☐ |
| G-EP-05 | DPIA completed OR DPO no-DPIA decision in writing | ☐ **NOT MET** | DPO ☐ |
| G-EP-06 | IAL-2 / manual ID review legally validated | ☐ **NOT MET** | Legal ☐ DPO ☐ |
| G-EP-07 | MFA implemented OR approved exception documented | ☐ **PARTIAL** — STAFF-MFA-3 technical GO; security delegate unsigned | Security ☐ DPO ☐ |
| G-EP-08 | hCaptcha configured; VERIFY_CAPTCHA_SKIP disabled | ☐ **NOT MET** | Security ☐ |
| G-EP-09 | Verifier / manual ID reviewer training delivered | ☐ **NOT MET** | Compliance ☐ |
| G-EP-10 | DPA / subprocessor review complete | ☐ **NOT MET** | Legal ☐ |
| G-EP-11 | LIA complete (if public verification externally exposed) | ☐ **NOT MET** | Legal ☐ DPO ☐ |

---

## Technical readiness vs legal clearance

| Domain | Technical evidence | Legal clearance |
|--------|-------------------|-----------------|
| Local synthetic pilot (CLRC) | TD_085_GO; local rollup GO | Separate from external gate — real PII not approved |
| Staff MFA | STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF | G-EP-07 partial |
| Public verify minimization | S17 GO | G-EP-11 blocked (LIA) |
| GDPR controls | F5_5 PARTIAL | DPO review PENDING |
| Retention enforcement | DOCUMENTED_ONLY | G-EP-03 blocked |

---

## Pre-flight checklist (external hosted — all open)

- [ ] All G-EP-01–G-EP-11 **COMPLETE**
- [ ] Privacy notice / transparency materials **published**
- [ ] Incident / breach contact path **operational and signed**
- [ ] Data residency and hosting DPA **in place**
- [ ] DPO/legal sign-off template **completed**
- [ ] Security delegate sign-off **completed**
- [ ] Real personal data use **explicitly authorized**
- [ ] Rollback plan if gate item regresses

---

## Explicit non-claims

| Claim | Value |
|-------|-------|
| External pilot approved | **FALSE** |
| Production ready | **FALSE** |
| Staging validated | **FALSE** (no signed staging validation evidence) |
| DPO/legal approved | **FALSE** |
| Security delegate approved | **FALSE** |
| Real candidate PII authorized | **FALSE** |

---

## Recommended sequence after DPO/legal review

1. DPO/legal completes sign-off template (this package).  
2. Security delegate completes SECURITY-DELEGATE-SIGNOFF-1.  
3. Close G-EP-01–G-EP-06, G-EP-08–G-EP-11 per action register.  
4. Re-run external pilot gate assessment with signed evidence.  
5. Update L5_EXTERNAL_PILOT_DECISION_RECORD only upon **signed** clearance.
