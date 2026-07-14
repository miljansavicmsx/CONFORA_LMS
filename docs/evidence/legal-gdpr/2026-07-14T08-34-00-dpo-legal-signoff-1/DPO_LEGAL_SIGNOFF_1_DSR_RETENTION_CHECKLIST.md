# DPO-LEGAL-SIGNOFF-1 — DSR and Retention Checklist

**Task:** DPO-LEGAL-SIGNOFF-1  
**Date:** 2026-07-14  
**Reference procedure:** `docs/legal/gdpr/DSR_PROCEDURE.md` (DRAFT — not approved)  
**Reference retention:** `docs/legal/gdpr/RETENTION_DECISION_REGISTER.md` (PROPOSED — not signed)

**Legend:** PASS = technical/policy draft sufficient for review item; PARTIAL = controls exist but legal sign-off missing; BLOCKED = cannot proceed for external pilot; NOT_APPLICABLE = out of scope for current gate.

---

## Data Subject Rights (DSR) checklist

| # | DSR right / capability | Technical control status | Legal policy status | Overall status | Notes / open decision |
|---|------------------------|--------------------------|---------------------|----------------|----------------------|
| DSR-01 | **Access request** — compile subject data | **PARTIAL** — learner read-own; staff APIs; export paths exist | **BLOCKED** — DSR procedure DRAFT (G-EP-04) | **PARTIAL** | Identity verification standard unresolved (LEG-19) |
| DSR-02 | **Rectification** — correct inaccurate data | **PARTIAL** — governed update workflows; audit on change | **BLOCKED** — procedure not signed | **PARTIAL** | Certificate public field changes need scheme rules |
| DSR-03 | **Erasure / deletion** — remove personal data | **PARTIAL** — disposal concepts in retention register draft | **BLOCKED** — exceptions not legally signed (LEG-20) | **PARTIAL** | Certificate registry and audit log erasure exceptions TBD |
| DSR-04 | **Restriction of processing** | **PARTIAL** — legal hold flag in retention service | **BLOCKED** — procedure not signed | **PARTIAL** | Technical legal_hold exists; policy unsigned |
| DSR-05 | **Portability / export** | **PARTIAL** — admin audit export; learner data APIs | **BLOCKED** — DSR export E2E not proven (F5-5) | **PARTIAL** | R-15 export log retention proposed not approved |
| DSR-06 | **Objection** | **NOT_APPLICABLE** (MVP) / **PARTIAL** | **BLOCKED** — procedure not signed | **PARTIAL** | Public verification LI objection path needs LIA |
| DSR-07 | **Automated decision-making** Art. 22 | **PASS** (MVP) — human review for cert decisions | **PARTIAL** — policy draft states no auto-certify | **PASS** | AI assistive only; no auto certification |
| DSR-08 | **DSR intake channel** | **PARTIAL** — email placeholder `privacy@{tenant-domain}` | **BLOCKED** — DPO assign pending | **PARTIAL** | In-app DSR portal future (L4+) |
| DSR-09 | **DSR acknowledgment SLA** (5 business days proposed) | **NOT_APPLICABLE** — operational | **BLOCKED** — DPO confirm pending | **BLOCKED** | Requires signed procedure |
| DSR-10 | **DSR response SLA** (30 calendar days proposed) | **NOT_APPLICABLE** — operational | **BLOCKED** — DPO/Legal confirm pending | **BLOCKED** | Requires signed procedure |
| DSR-11 | **DSR case logging** (R-15) | **PARTIAL** — audit infrastructure | **BLOCKED** — retention unsigned | **PARTIAL** | 10y proposed for DSR logs |

---

## Retention and disposal checklist

| # | Retention domain | Proposed period (unsigned) | Technical implementation | Legal approval | Overall status | Notes |
|---|------------------|---------------------------|--------------------------|----------------|----------------|-------|
| RET-01 | KYC ID document image (R-01) | 14 days after verification | Object storage lifecycle TBD hosted | **NOT SIGNED** | **PARTIAL** | Minimization measure; Art. 9 unresolved |
| RET-02 | KYC verification record (R-02) | 10 years | PostgreSQL | **NOT SIGNED** | **PARTIAL** | Decision record without image |
| RET-03 | Exam video/screen evidence (R-03) | 60 days (unless hold) | Evidence store | **NOT SIGNED** | **PARTIAL** | Appeal hold may extend |
| RET-04 | Exam behavioral/anomaly logs (R-04) | 1 year | PostgreSQL | **NOT SIGNED** | **PARTIAL** | Security monitoring |
| RET-05 | Examination answers (R-05) | 10 years | PostgreSQL | **NOT SIGNED** | **PARTIAL** | Accreditation assessment record |
| RET-06 | Examination scores (R-06) | 10 years | PostgreSQL | **NOT SIGNED** | **PARTIAL** | Certification input |
| RET-07 | Audit logs (R-07) | 10 years minimum | Append-only PostgreSQL | **NOT SIGNED** | **PARTIAL** | Policy also states permanent ISO domains |
| RET-08 | COI records (R-08) | 10 years | PostgreSQL | **NOT SIGNED** | **PARTIAL** | Governance |
| RET-09 | Appeal records (R-09) | 10 years | PostgreSQL | **NOT SIGNED** | **PARTIAL** | Legal hold interaction |
| RET-10 | Complaint records (R-10) | 10 years | PostgreSQL | **NOT SIGNED** | **PARTIAL** | Legal hold interaction |
| RET-11 | Certificate records (R-11) | Permanent | Registry + wallet | **NOT SIGNED** | **PARTIAL** | Erasure exception expected |
| RET-12 | Contact/support (R-12) | 3 years | PostgreSQL | **NOT SIGNED** | **PARTIAL** | Non-cert core |
| RET-13 | LMS progress non-cert (R-13) | 3 years after last activity | PostgreSQL | **NOT SIGNED** | **PARTIAL** | Training only |
| RET-14 | Abandoned application drafts (R-14) | 2 years after last update | PostgreSQL | **NOT SIGNED** | **PARTIAL** | Stale PII reduction |
| RET-15 | Export/DSR request logs (R-15) | 10 years | PostgreSQL | **NOT SIGNED** | **PARTIAL** | Accountability |
| RET-16 | Public verification audit (R-16) | 1 year | PostgreSQL | **NOT SIGNED** | **PARTIAL** | IP/metadata abuse detection |
| RET-17 | Local pilot synthetic data (R-17) | N/A | Local CLRC | **N/A** | **NOT_APPLICABLE** | No real PII |

---

## Special retention / DSR interaction checklist

| # | Topic | Status | Notes |
|---|-------|--------|-------|
| SP-01 | **Legal hold** — suspend disposal for appeal/litigation | **PARTIAL** | `legalHold` flag in retention service; policy draft unsigned |
| SP-02 | **Certificate/public registry erasure limitation** | **PARTIAL** | Draft exception in RETENTION_DECISION_REGISTER §Erasure; LEG-20 unresolved |
| SP-03 | **Audit log erasure limitation** | **PARTIAL** | Append-only technical control; legal exception scope requires DPO decision |
| SP-04 | **Identity verification document retention** | **PARTIAL** | 14d proposed; hosted lifecycle automation not proven |
| SP-05 | **Exam record retention vs erasure request** | **PARTIAL** | 10y proposed for accreditation; erasure conflict unresolved |
| SP-06 | **Certificate lifecycle retention** | **PARTIAL** | Permanent proposed; public verify fields may persist after holder erasure |
| SP-07 | **Deletion / anonymization approach defined** | **PARTIAL** | Hard delete / anonymize / retain / legal hold defined in register draft |
| SP-08 | **Automated retention enforcement in production** | **BLOCKED** | DOCUMENTED_ONLY per F5-5; cleanup jobs not validated hosted |
| SP-09 | **Backup retention alignment** | **BLOCKED** | Hosted backup disposal not documented in signed policy |
| SP-10 | **Real personal data approved for external pilot** | **BLOCKED** | Explicitly NOT approved |

---

## Summary counts

| Status | DSR items (11) | Retention items (17) | Special items (10) |
|--------|---------------:|---------------------:|-------------------:|
| PASS | 1 | 0 | 0 |
| PARTIAL | 8 | 16 | 6 |
| BLOCKED | 2 | 0 | 4 |
| NOT_APPLICABLE | 0 | 1 | 0 |

---

## DPO/legal decisions required

1. Sign `DSR_PROCEDURE.md` or provide revised procedure (G-EP-04).  
2. Sign `RETENTION_APPROVAL_REGISTER.md` / R-01–R-16 (G-EP-03).  
3. Resolve erasure exceptions for certificates (R-11) and audit logs (R-07).  
4. Confirm ID document 14-day disposal enforceability on hosted stack.  
5. Approve DSR identity verification standard (LEG-19).

**Overall DSR procedure status for summary.json:** `PARTIAL`  
**Overall retention schedule status for summary.json:** `PARTIAL`
