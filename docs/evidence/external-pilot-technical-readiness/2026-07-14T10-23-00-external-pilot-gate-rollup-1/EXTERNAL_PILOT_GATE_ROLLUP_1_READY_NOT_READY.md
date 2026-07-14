# EXTERNAL-PILOT-GATE-ROLLUP-1 — Ready / Not Ready

**Task:** EXTERNAL-PILOT-GATE-ROLLUP-1  
**Date:** 2026-07-14

---

## 1. What is technically ready?

### Technically ready (local scope)

| Item | Status | Evidence |
|------|--------|----------|
| **Local baseline TD-085** | **Ready** | `TD_085_GO_LOCAL_BASELINE_CONFIRMED` — 6/6 sequential regression 2026-07-13 |
| **Public verification (technical)** | **Ready** | `S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED` — no-auth, read-only, PII minimization |
| **Admin governance acceptance** | **Ready** | `ADMIN_GOV_FINAL_ACCEPTANCE_GO` — 15/15 Playwright |
| **Learner acceptance** | **Ready** | `LEARNER_FINAL_ACCEPTANCE_1R_GO` — 11/11 Playwright |
| **MFA backend enforcement** | **Ready (with conditions)** | STAFF-MFA-3 — 403 without MFA; pending enrollment + delegate sign-off |
| **Audit hardening** | **Ready** | F5-5 audit hardening PASS; append-only model |
| **RBAC / tenant isolation** | **Ready** | F5-5, admin-gov, learner acceptance |
| **Security read posture (local)** | **Ready** | F5-5 security_readiness_status PASS |

### Conditionally ready

| Item | Condition | Evidence |
|------|-----------|----------|
| **Local/synthetic pilot** | CLRC rules; no real PII | Local pilot rollup GO; L5 excludes CLRC from external gate |
| **Staff MFA gate (internal)** | Smoke bypass users only for local automation | STAFF-MFA-3 closure |
| **Public verification (external URL)** | LIA signed; hCaptcha configured | S17 GO locally; G-EP-08/11 open |
| **Identity evidence flow** | Manual IAL-2 only; synthetic refs in local pilot | F5-5 identity PARTIAL |

---

## 2. What is not signed?

| Sign-off | Status | Package |
|----------|--------|---------|
| Security delegate | **NOT SIGNED** | `security-delegate-signoff-1/` |
| DPO/legal | **NOT SIGNED** | `dpo-legal-signoff-1/` |
| GDPR policy publication | **NOT SIGNED** | G-EP-01 |
| Legal basis register (LB-01–LB-15) | **NOT SIGNED** | G-EP-02 |
| Retention register (R-01–R-16) | **NOT SIGNED** | G-EP-03 |
| DSR procedure | **NOT SIGNED** | G-EP-04 |
| DPIA / no-DPIA decision | **NOT SIGNED** | G-EP-05 |
| IAL-2 legal validation | **NOT SIGNED** | G-EP-06 |
| LIA public verification | **NOT SIGNED** | G-EP-11 |
| Processor DPAs | **NOT SIGNED** | G-EP-10 |
| External pilot authorization (L5) | **NOT SIGNED** | L5 BLOCKED |

---

## 3. What remains blocked?

| Blocker category | Detail |
|------------------|--------|
| **Governance sign-offs** | Security delegate + DPO/legal both pending |
| **Privacy/legal gates** | G-EP 0/11; DPIA, DSR, retention, privacy notice, legal basis |
| **Real personal data** | Not authorized for external hosted use |
| **External hosted deployment** | Staging/production not validated |
| **Operational readiness** | Manual TOTP enrollment for external-facing staff |
| **Participant-facing legal** | External participant terms + published privacy notice |
| **Subprocessors** | DPAs pending/deferred for hosted stack |
| **Program decision** | External pilot explicitly NO-GO |

---

## 4. What must happen before external pilot with real users or real personal data?

1. **Complete manual TOTP enrollment** for all external-facing staff (remove dependency on smoke bypass).  
2. **Security delegate** reviews and signs SECURITY-DELEGATE-SIGNOFF-1 with explicit MFA decision.  
3. **DPO/legal** reviews and signs DPO-LEGAL-SIGNOFF-1 with explicit privacy/legal decision.  
4. **DPIA decision** — execute formal DPIA or documented no-DPIA decision in writing.  
5. **Approve and publish** privacy notice (GDPR policy not DRAFT).  
6. **Sign** legal basis register, retention schedule, and DSR procedure.  
7. **Resolve** processor/DPA status for actual hosted stack including transfer mechanisms.  
8. **Complete** IAL-2 legal validation, verifier training (G-EP-06, G-EP-09).  
9. **Configure** hCaptcha; disable `VERIFY_CAPTCHA_SKIP` on external URLs (G-EP-08).  
10. **Sign LIA** for public verification if externally exposed (G-EP-11).  
11. **Validate staging/production** if external hosted pilot is intended.  
12. **Issue formal external pilot approval** — update L5 decision record only with signed evidence (11/11 G-EP or documented waivers).  
13. **Explicitly authorize** real personal data processing in writing.

**Until all applicable steps complete:** external hosted pilot with real candidates remains **BLOCKED**.

---

## 5. Final gate verdict today

**EXTERNAL_PILOT_GATE_ROLLUP_1_NO_GO_PENDING_SECURITY_DPO_LEGAL_AND_PRIVACY_GATES**

| Question | Answer |
|----------|--------|
| External pilot approved? | **NO** |
| Real personal data approved? | **NO** |
| Local/synthetic pilot supported? | **YES** (with CLRC conditions) |
| Ready for sign-off review? | **YES** — both packages prepared |
| Ready for external launch? | **NO** |

---

## Explicit non-claims

- Production ready: **FALSE**  
- Staging validated: **FALSE**  
- GDPR compliance claimed: **FALSE**  
- Zero residual risk: **FALSE**
