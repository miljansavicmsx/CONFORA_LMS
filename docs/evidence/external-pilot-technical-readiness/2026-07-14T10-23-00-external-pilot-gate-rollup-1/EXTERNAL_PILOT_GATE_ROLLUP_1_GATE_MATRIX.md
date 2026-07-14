# EXTERNAL-PILOT-GATE-ROLLUP-1 — Gate Matrix

**Task:** EXTERNAL-PILOT-GATE-ROLLUP-1  
**Date:** 2026-07-14  
**Legend:** PASS / PARTIAL / BLOCKED / NOT_APPLICABLE

---

## Consolidated gate matrix

| # | Gate | Status | Evidence | Notes |
|---|------|--------|----------|-------|
| G-01 | **Local baseline TD-085** | **PASS** | `td-085-sequential-regression/2026-07-13T14-26-35-td-085/` | 6/6 commands; local only |
| G-02 | **STAFF-MFA-3 technical enforcement** | **PARTIAL** | STAFF-MFA-3 closure + R1 | 403 without MFA proven; delegate sign-off + manual enrollment pending |
| G-03 | **Security delegate sign-off** | **BLOCKED** | `security-delegate-signoff-1/` | Package ready; **not signed** |
| G-04 | **DPO/legal sign-off** | **BLOCKED** | `dpo-legal-signoff-1/` | Package ready; **not signed** |
| G-05 | **DPIA decision** | **BLOCKED** | `DPIA_SCOPING_NOTE.md`; DPO package | `PENDING_DPO_DECISION`; G-EP-05 NOT MET |
| G-06 | **DSR procedure** | **PARTIAL** | `DSR_PROCEDURE.md` DRAFT | Technical paths partial; procedure unsigned (G-EP-04) |
| G-07 | **Retention schedule** | **PARTIAL** | `RETENTION_DECISION_REGISTER.md` | R-01–R-16 proposed; DOCUMENTED_ONLY in F5-5 |
| G-08 | **Privacy notice** | **PARTIAL** | `CONFORA_GDPR_POLICY.md` DRAFT | Not published; G-EP-01 NOT MET |
| G-09 | **Processor/DPA status** | **PARTIAL** | DPO processors doc; GDPR sign-off log | DPAs PENDING/DEFERRED; G-EP-10 NOT MET |
| G-10 | **Real personal data approval** | **BLOCKED** | L5 decision record; DPO package | Explicitly NOT authorized |
| G-11 | **Public verification privacy** | **PARTIAL** | S17 GO; LIA unsigned | Technical minimization PASS; legal LIA pending (G-EP-11) |
| G-12 | **Admin governance acceptance** | **PASS** | `admin-gov-final-acceptance-1/` | 15/15 local Playwright |
| G-13 | **Learner acceptance** | **PASS** | `learner-final-acceptance-1r/` | 11/11 local Playwright |
| G-14 | **F5-5 residual security/GDPR risks** | **PARTIAL** | F5-5 2026-07-08 | Security/audit PASS; GDPR PARTIAL; open risks |
| G-15 | **Staging validation** | **BLOCKED** | No signed staging evidence | `staging_validated_claimed: false` |
| G-16 | **Production readiness** | **BLOCKED** | All packages | `production_ready_claimed: false` |
| G-17 | **Manual TOTP enrollment** | **PARTIAL** | STAFF-MFA-3; security delegate package | Enforcement yes; enrollment for external staff pending |
| G-18 | **Incident/rollback readiness** | **PARTIAL** | F5-6 runbooks (linked in prior packages) | Incident procedure not signed for external hosted |
| G-19 | **External participant onboarding/terms** | **BLOCKED** | No signed pilot participant terms | Privacy notice + terms pending |
| G-20 | **Evidence minimization** | **PARTIAL** | F5-5; R-01 14d proposed; no biometrics MVP | ID upload UI partial; hosted lifecycle unproven |

---

## Summary counts

| Status | Count (of 20 gates) |
|--------|--------------------:|
| PASS | 3 |
| PARTIAL | 9 |
| BLOCKED | 8 |
| NOT_APPLICABLE | 0 |

---

## G-EP external pilot privacy gate (L4 — unchanged)

| Metric | Value |
|--------|-------|
| Conditions total | 11 |
| Conditions met | **0** |
| Gate cleared | **NO** |

Reference: `docs/legal/gdpr/EXTERNAL_PILOT_PRIVACY_GATE.md`

---

## Cross-gate dependency view

```
Local technical PASS (G-01, G-12, G-13, S17)
        │
        ▼
STAFF-MFA-3 PARTIAL (G-02, G-17) ──► Security delegate BLOCKED (G-03)
        │
        ▼
DPO/legal BLOCKED (G-04) + Privacy gates PARTIAL/BLOCKED (G-05–G-11, G-19, G-20)
        │
        ▼
Real PII BLOCKED (G-10) + Staging/Prod BLOCKED (G-15, G-16)
        │
        ▼
EXTERNAL PILOT: NO-GO
```

---

## Explicit non-claims

No gate marked PASS or PARTIAL constitutes external pilot approval. BLOCKED gates remain blocking until signed evidence closes them.
