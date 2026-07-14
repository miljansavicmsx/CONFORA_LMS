# DPO-LEGAL-SIGNOFF-1 — Personal Data Inventory

**Task:** DPO-LEGAL-SIGNOFF-1  
**Date:** 2026-07-14  
**Status:** Inventory for DPO/legal review — **not approved**

**Legal basis column:** All entries marked `TO_BE_CONFIRMED_BY_DPO_LEGAL` unless draft register reference is cited. Draft references (LB-xx, R-xx) are **proposed workshop positions**, not signed legal conclusions.

---

## Inventory table

| Data category | Data subjects | Example fields | Purpose | Legal basis | System / module | Access roles | Storage location | Retention status | DSR impact | Transfer / processor impact | Risk level | Open decision |
|---------------|---------------|----------------|---------|-------------|-----------------|--------------|------------------|------------------|------------|----------------------------|------------|---------------|
| Learner account / profile | Learners, candidates | Name, email, locale, tenant membership, Keycloak subject ID | Account access, LMS, certification journey | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (draft LB-01: Art. 6(1)(b)) | Identity & Access; LMS; Dashboard | `learner`, self-service; staff read per RBAC | PostgreSQL (`users`, profiles); Keycloak realm | **PROPOSED** — account life + R-13 LMS progress 3y (unsigned) | Access, rectification, erasure (subject to cert/audit exceptions) | Keycloak (IdP); hosting DB | **Medium** | Controller/processor split per tenant (LEG-01) |
| Education enrollment / progress | Learners | Course enrollment, completion %, lesson progress, timestamps | Learning service delivery | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (draft LB-01) | Module 2 LMS / Education | `learner` (own); `edu_author`, `training_manager` | PostgreSQL LMS tables | **PROPOSED** R-13: 3y after last activity (unsigned) | Portability partial; erasure after retention minimum | Same as platform hosting | **Low–Medium** | Distinction cert vs non-cert retention |
| Certification application | Candidates | Application form data, attachments, status, reviewer notes | Accreditation workflow, eligibility | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (draft LB-02: Art. 6(1)(b)/(c)) | Module 4 Certification Application | `learner` (own); `cert_applicant`; staff review roles | PostgreSQL; object storage for attachments | **PROPOSED** R-14 abandoned drafts 2y; active per cert lifecycle (unsigned) | Access, rectification; erasure limited during accreditation period | Object storage processor TBD | **Medium–High** | National accreditation law mapping |
| Identity verification metadata | Candidates | Verification status, verifier ID, decision timestamp, IAL level, audit refs | Fraud prevention, accreditation ID evidence | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (draft LB-15: Art. 6(1)(c)/(f); possible Art. 9) | Identity evidence / B6 eligibility | `staff_id_verifier`, restricted staff | PostgreSQL verification records | **PROPOSED** R-02: 10y record; R-01 image 14d (unsigned) | Access; erasure conflicts with accreditation | IdP + storage | **High** | Art. 9 condition for ID copy (LB-15); G-EP-06 |
| ID document handling | Candidates | Government ID image/PDF, document type, upload metadata | Manual IAL-2 review (no biometrics MVP) | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (draft LB-15; Art. 9 unresolved) | Identity evidence upload | `staff_id_verifier` only; not learner post-review | Object storage (encrypted assumed); short-lived | **PROPOSED** R-01: 14d after verification (unsigned) | Erasure strongly requested — legal hold/appeal may extend | Object storage provider TBD | **High** | IAL-2 legal validation; retention sign-off; DPIA |
| Exam registration | Candidates | Session registration, slot, proctoring flags, consent flags | Exam scheduling and integrity | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (draft LB-04) | Module 3 Exam Engine | `learner`; exam staff roles | PostgreSQL | Linked to exam record retention (unsigned) | Access; restriction during active session | Platform hosting | **Medium** | Video proctoring lawful basis if enabled |
| Exam attempt / result | Candidates | Answers, scores, pass/fail, session metadata, anomaly logs | Assessment integrity, certification input | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (draft LB-04, LB-05) | Exam Engine | `learner` (own result summary); staff full | PostgreSQL; optional evidence store | **PROPOSED** R-05 answers 10y; R-06 scores 10y; R-03 video 60d; R-04 logs 1y (unsigned) | Access; erasure limited by accreditation | Evidence storage TBD | **Medium–High** | Exam content retention vs minimization |
| Certificate wallet | Certificate holders | Certificate UID, PDF, status, scheme, issue/expiry dates | Credential delivery and holder access | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (draft LB-07) | Certificate Designer / Wallet | `learner` (own); public fields per policy | PostgreSQL; PDF storage | **PROPOSED** R-11: permanent registry (unsigned) | Erasure **exception** likely (registry integrity) | PDF generator; storage | **Medium** | Permanent registry vs erasure (LEG-20) |
| Public certificate verification | Verifiers, public; data subject is holder | Lookup hash/cert ID, minimized holder name, status, dates; verifier IP/timestamp | Public trust, authenticity confirmation | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (draft LB-08: Art. 6(1)(f); LIA required) | Public Verification Portal | Unauthenticated public read; no PII mutation | PostgreSQL registry; verification audit log | **PROPOSED** R-16: IP/metadata 1y (unsigned) | Objection/restriction; limited erasure on public fields | CDN/hosting; hCaptcha if enabled | **Medium** | LIA sign-off (G-EP-11); scheme field exposure |
| Appeals | Appellants | Appeal text, attachments, decision, correspondence metadata | Dispute resolution, ISO 17024 appeals | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (draft LB-10) | Module 9 Appeals | Appellant; appeals committee staff | PostgreSQL | **PROPOSED** R-09: 10y (unsigned) | Access; erasure subject to legal hold | Platform hosting | **Medium** | Legal hold interaction |
| Complaints | Complainants | Complaint text, routing metadata, resolution | Dispute resolution | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (draft LB-11) | Module 9 Complaints / Contact | Complainant; staff handlers | PostgreSQL | **PROPOSED** R-10: 10y (unsigned) | Access; erasure subject to legal hold | Platform hosting | **Medium** | Separation from contact module |
| Audit logs | All subjects (metadata) | Actor ID, action, resource type, timestamp, redacted metadata, IP (security events) | Accountability Art. 5(2), ISO traceability | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (draft LB-14) | Audit service (`auditEvents`, legacy `auditLogs`) | `sys_admin` export; filtered admin read | PostgreSQL (append-only) | **PROPOSED** R-07: 10y minimum (unsigned); policy states permanent for ISO | Erasure **exception** — legal decision required | Platform hosting | **Low–Medium** | Audit erasure vs accountability (LEG-20) |
| Staff / admin accounts | Staff, verifiers, committee | Name, email, roles, MFA status, tenant membership | Platform administration, SoD | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (draft LB-01 variant) | Identity & Access; SysAdmin | Role-based; MFA enforced for external staff (STAFF-MFA-3) | Keycloak + PostgreSQL | Account lifecycle TBD — **TO_BE_CONFIRMED_BY_DPO_LEGAL** | Access, rectification; erasure on offboarding | Keycloak | **Medium** | Staff data retention policy unsigned |
| Notifications / email | All users | Email address, template refs, delivery status | Transactional comms, alerts | **TO_BE_CONFIRMED_BY_DPO_LEGAL** | Notification service | System; user preferences | PostgreSQL queue; email provider | **TO_BE_CONFIRMED_BY_DPO_LEGAL** | Unsubscribe/objection; erasure of logs | Email provider **TBD / DPA pending** | **Medium** | Email processor DPA (G-EP-10) |
| Support / contact requests | Data subjects, public | Message body, contact details, SLA metadata, CAPTCHA token refs | Communication routing (not cert core) | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (draft LB-12) | Module 5 Contact | Submitter; support staff | PostgreSQL | **PROPOSED** R-12: 3y (unsigned) | Access, erasure after retention | hCaptcha processor if enabled | **Low–Medium** | hCaptcha lawful basis; CAPTCHA skip forbidden external |
| Uploaded evidence / documents | Candidates, staff | Application attachments, appeal docs, export files, ID images | Workflow evidence, accreditation | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (varies by context) | Multiple modules | Uploader + governed staff roles | Object storage | Per R-01–R-14 category (unsigned) | Erasure varies; legal hold | Object storage **TBD** | **Medium–High** | Encryption at rest confirmation for hosted stack |
| Reports / export logs | Staff (subject metadata in exports) | Export metadata, report type, reason code, actor | Governance reporting, DSR demonstration | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (draft LB-13) | Module 10 Reports; audit export | Staff-only; reason gating | PostgreSQL | **PROPOSED** R-15: 10y (unsigned) | DSR export logging; third-party redaction | Platform hosting | **Medium** | DSR export E2E not proven (F5-5 residual) |
| AI-assisted workflow metadata | Staff, candidates (indirect) | Model ID, prompt hash, reviewer, approval status | AI governance, assistive workflows | **TO_BE_CONFIRMED_BY_DPO_LEGAL** | AI Gateway | Governed staff roles | PostgreSQL AI audit tables | Per AI governance policy — **TO_BE_CONFIRMED_BY_DPO_LEGAL** | Access via DSR; human review mandatory | AI provider **TBD if external** | **Medium** | External AI processor DPA if used in pilot |

---

## Summary statistics (for reviewer)

| Metric | Count |
|--------|------:|
| Data categories listed | 18 |
| Legal basis confirmed | 0 |
| Legal basis `TO_BE_CONFIRMED_BY_DPO_LEGAL` | 18 |
| Retention signed | 0 |
| Retention proposed (unsigned) | 16 |
| High-risk categories | 4 (ID document, identity metadata, exam attempt, uploaded evidence) |

---

## Explicit non-claims

- This inventory is **not** a signed Record of Processing Activities (RoPA).  
- No legal basis has been **approved** by counsel or DPO.  
- No retention period is **legally binding** until RETENTION_APPROVAL_REGISTER sign-off.  
- Real candidate personal data processing on external hosted environments is **not authorized**.
