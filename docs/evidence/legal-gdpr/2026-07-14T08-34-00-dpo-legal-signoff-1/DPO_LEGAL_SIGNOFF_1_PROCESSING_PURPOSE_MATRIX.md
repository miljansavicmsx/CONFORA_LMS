# DPO-LEGAL-SIGNOFF-1 — Processing Purpose Matrix

**Task:** DPO-LEGAL-SIGNOFF-1  
**Date:** 2026-07-14  
**Status:** For DPO/legal review — **not approved**

**Controller/processor assumption:** Certification body tenant is **controller** for candidate data; CONFORA platform operator is **processor** for tenant-hosted processing — **draft assumption per `CONFORA_GDPR_POLICY.md` §11; confirm via DPA (LEG-01, LEG-27).**

---

## Matrix

| Processing activity | Purpose | Data subject | Controller / processor (assumption) | Legal basis (pending confirmation) | Necessity / minimization assessment | Retention need | Access control | Audit evidence | Residual legal question |
|---------------------|---------|--------------|-------------------------------------|--------------------------------------|-------------------------------------|----------------|----------------|----------------|-------------------------|
| Account registration & authentication | Provide secure platform access | Learners, staff | Controller: tenant CB; Processor: CONFORA + Keycloak | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (LB-01 Art. 6(1)(b)) | Email/name required for account; roles minimized per RBAC | Account life + inactive cleanup TBD | Keycloak MFA for staff (STAFF-MFA-3); learner auth | LOGIN_* audit events | Tenant controller identity in multi-tenant DPA |
| LMS enrollment & progress tracking | Deliver training content | Learners | Controller: tenant; Processor: CONFORA | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (LB-01) | Progress data limited to course scope; not cert decision input alone | R-13 proposed 3y (unsigned) | Learner own-data; edu staff RBAC | Learning events in audit where configured | Cert vs non-cert data separation |
| Certification application processing | Manage accreditation application workflow | Candidates | Controller: tenant CB | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (LB-02) | Fields limited to scheme requirements; attachments governed | Per cert lifecycle; R-14 drafts 2y abandoned | Applicant + review roles; SoD | APPLICATION_* audit actions | National law mapping for legal obligation |
| Eligibility / identity review | Verify candidate identity (IAL-2 manual) | Candidates | Controller: tenant CB | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (LB-15; Art. 9 TBD) | Manual review only; no biometrics MVP; 14d image delete proposed | R-01 14d image; R-02 10y decision record (unsigned) | `staff_id_verifier` restricted | Identity review audit events | Art. 9 basis; G-EP-06 IAL-2 validation |
| Examination delivery | Conduct secure assessments | Candidates | Controller: tenant CB | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (LB-04) | Session metadata required; answer content for integrity | R-05/R-06 10y proposed (unsigned) | Learner session; proctor staff | Exam submission audit | Video proctoring basis if enabled |
| Scoring & result recording | Record assessment outcomes | Candidates | Controller: tenant CB | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (LB-05) | Scores necessary for cert decision | R-06 10y proposed (unsigned) | Staff grading roles; learner summary | Exam result audit | Automated scoring disclosure if AI used |
| Certification decision | Formal certification determination | Candidates | Controller: tenant CB | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (LB-06) | Committee records for accreditation | Permanent decision record proposed | Committee roles; SoD enforced | CERTIFICATE_* / decision audit | Human review mandatory — no auto-certify |
| Certificate issuance & registry | Issue and maintain credentials | Certificate holders | Controller: tenant CB | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (LB-07) | Registry fields minimized per scheme | R-11 permanent proposed (unsigned) | Issuance staff; holder wallet | Certificate issuance audit | Erasure exception for public registry |
| Public verification lookup | Allow third parties to verify credential authenticity | Holders; verifiers (public) | Controller: tenant CB | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (LB-08; LIA required) | Read-only; no exam/ID exposure; field matrix LEG-22 | R-16 1y verify audit proposed | Unauthenticated read; rate limit + CAPTCHA | Verification attempt audit (S17 GO) | LIA sign-off before external URL (G-EP-11) |
| Recertification | Maintain ongoing certification | Certificate holders | Controller: tenant CB | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (LB-09) | Evidence limited to recert scheme | Per cert lifecycle (unsigned) | Holder + staff | Recert audit events | — |
| Appeals handling | Resolve certification disputes | Appellants | Controller: tenant CB | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (LB-10) | Separate from complaints; no auto cert mutation | R-09 10y proposed (unsigned) | Appeals committee; SoD | Appeal audit trail | Legal hold on erasure |
| Complaints handling | Resolve complaints | Complainants | Controller: tenant CB | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (LB-11) | Routing metadata; content access restricted | R-10 10y proposed (unsigned) | Complaint handlers RBAC | Complaint audit | Cross-module referral documentation |
| Contact / support | Route inquiries | Data subjects, public | Controller: tenant CB | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (LB-12) | Contact ≠ appeal; redaction F4-9 | R-12 3y proposed (unsigned) | Support staff | Contact audit metadata | hCaptcha processing basis |
| Governance reporting & export | Management review and compliance reporting | Staff (export may contain subject data) | Controller: tenant CB | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (LB-13) | Reason gating; PII redaction in audit API | R-15 10y export log proposed | Staff-only; sys_admin export | Export audit metadata | Staff export vs DSR export basis split |
| Audit logging | Demonstrate accountability | All (metadata) | Controller: tenant CB | **TO_BE_CONFIRMED_BY_DPO_LEGAL** (LB-14) | Redaction in API; append-only | R-07 10y+ proposed; ISO permanent domains | sys_admin export; filtered admin read | Immutable auditEvents | Erasure exception scope (LEG-20) |
| Staff administration | Manage users, roles, tenant config | Staff | Controller: tenant / platform per scope | **TO_BE_CONFIRMED_BY_DPO_LEGAL** | Least privilege RBAC; MFA for external staff | TBD | sys_admin; delegated admin | ROLE_*, ACCESS_* audit | Offboarding erasure procedure |
| Transactional notifications | Deliver service communications | All users | Controller: tenant; Processor: email provider TBD | **TO_BE_CONFIRMED_BY_DPO_LEGAL** | Transactional only for MVP | TBD | System triggered | Notification delivery logs | Email processor DPA |
| AI-assisted content / review (if used) | Assist staff workflows with human oversight | Staff; indirect candidate impact | Controller: tenant CB | **TO_BE_CONFIRMED_BY_DPO_LEGAL** | AI assistive only; no auto certification | AI audit log retention TBD | Governed staff roles | AI audit: model, prompt hash, reviewer | External AI processor DPA; DPIA depth |

---

## Cross-cutting controls (technical — not legal approval)

| Control | Evidence | Legal sign-off |
|---------|----------|----------------|
| Tenant isolation | F5-5 PASS; learner/admin acceptance | N/A — technical |
| RBAC / SoD | Admin-gov GO; F5-5 | N/A — technical |
| Audit immutability | F5-5 audit hardening PASS | Retention period unsigned |
| PII redaction in APIs | F5-5 learner/contact/reports PASS | DSR procedure unsigned |
| Public verify minimization | S17 GO; PUBLIC_VERIFICATION_POLICY | LIA unsigned |
| Staff MFA | STAFF-MFA-3 pending security delegate | G-EP-07 partial |

---

## Required DPO/legal outputs from this matrix

1. Confirm or revise legal basis for each LB-01–LB-15 activity.  
2. Resolve Art. 9 position for government ID images (LB-15).  
3. Approve or revise retention per R-01–R-16.  
4. Complete LIA for public verification (LB-08) or restrict external exposure.  
5. Confirm controller/processor/DPA structure per tenant deployment model.
