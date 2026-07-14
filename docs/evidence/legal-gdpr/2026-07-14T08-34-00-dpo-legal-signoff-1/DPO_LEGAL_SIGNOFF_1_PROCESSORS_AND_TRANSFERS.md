# DPO-LEGAL-SIGNOFF-1 — Processors and Transfers

**Task:** DPO-LEGAL-SIGNOFF-1  
**Date:** 2026-07-14  
**Status:** Inventory for DPO/legal review — **DPAs not signed**

**Reference:** `docs/legal/gdpr/CONFORA_GDPR_POLICY.md` §14; `GDPR_SIGNOFF_DECISION_LOG.md` §8; G-EP-10.

---

## Processor / subprocessor register (draft)

| # | Processor / service | Role | Personal data handled | Hosting / location | DPA status | Transfer mechanism | Cross-border status | Open legal decision |
|---|---------------------|------|----------------------|-------------------|------------|-------------------|---------------------|---------------------|
| P-01 | **Keycloak** (identity provider) | Authentication processor / IdP | Email, name, roles, MFA secrets, session tokens, Keycloak subject ID | Self-hosted (local pilot); **hosted location TBD** for external pilot | **PENDING — TBD** | N/A if same jurisdiction; **TBD** if cloud | **TBD** — depends on deployment | Confirm processor vs joint controller; realm DPA; G-EP-07 MFA |
| P-02 | **PostgreSQL** (primary database) | Data store (under platform) | All application personal data | Self-hosted local; **cloud TBD** (Neon/RDS/etc.) | **PENDING** | SCCs / adequacy **TBD** | **TBD** | Data residency requirement for external pilot |
| P-03 | **Object storage** (S3-compatible / blob) | Evidence, ID images, PDFs, attachments | ID documents, application files, certificate PDFs | **TBD** — not finalized for hosted stack | **PENDING / DEFERRED** | **TBD** | **TBD** | Encryption at rest; R-01 lifecycle on hosted |
| P-04 | **Email provider** (transactional) | Notification delivery | Email addresses, message metadata | **TBD** — provider not finalized | **PENDING** | **TBD** | **TBD** | Select provider; sign DPA before external pilot |
| P-05 | **Hosting / cloud platform** (Vercel/AWS/etc.) | Infrastructure processor | All data at rest and in transit on hosted environment | **DEFERRED** — cloud preconditions per GDPR_SIGNOFF_DECISION_LOG | **DEFERRED** | **TBD** | **TBD** | G-EP-10; production privacy gate G-PR-03 |
| P-06 | **hCaptcha** (if enabled) | Abuse prevention on public/contact surfaces | IP, browser signals, CAPTCHA response tokens | Third-party US/international likely | **PENDING** | SCCs / adequacy **TBD** | **Likely cross-border** | Lawful basis for CAPTCHA processing (LB-12); G-EP-08 |
| P-07 | **AI service provider** (if external models used) | AI inference processor | Prompts, context (may include personal data if misused) | **TBD** — local vs external gateway | **PENDING** | **TBD** | **TBD** | Prefer no real PII in pilot AI calls; DPA if external |
| P-08 | **Payment / billing** (if enabled) | Payment processor | Billing identity, transaction metadata | **NOT APPLICABLE (MVP pilot)** — not in scope | **N/A** | N/A | N/A | Confirm if pilot includes paid enrollment |
| P-09 | **Analytics / telemetry** (if enabled) | Usage analytics | Pseudonymous usage events | **TBD** | **PENDING** | **TBD** | **TBD** | Minimize; consent if non-essential cookies |
| P-10 | **CDN / edge** (if public verification externally exposed) | Content delivery | IP, request metadata | **TBD** | **PENDING** | **TBD** | **TBD** | Public verify external URL dependency |
| P-11 | **PDF generator / signing service** | Certificate PDF generation | Holder name, cert metadata | Platform-internal or **TBD** external | **PENDING** | **TBD** | **TBD** | Signing key custody |

---

## Controller / processor relationship

| Relationship | Draft assumption | Status | Decision required |
|--------------|------------------|--------|-------------------|
| Certification body tenant → candidate data | **Controller** | Draft per CONFORA_GDPR_POLICY | Confirm per deployment contract |
| CONFORA platform operator → tenant-hosted data | **Processor** | Draft — **confirm DPA** | LEG-01; tenant DPA template **PENDING** |
| CONFORA as controller for platform ops data | Staff accounts, platform logs | **TBD** | Split RoPA for operator vs tenant |

---

## International transfer assessment

| Transfer path | Status | Notes |
|---------------|--------|-------|
| EU/EEA-only deployment | **NOT CONFIRMED** | Hosting stack not finalized |
| UK adequacy | **NOT ASSESSED** | — |
| US transfers (hCaptcha, cloud, email) | **LIKELY IF ENABLED** | SCCs + TIA **PENDING** |
| Transfer Impact Assessment (TIA) | **NOT COMPLETED** | Required before external hosted pilot if cross-border |

---

## DPA / subprocessor review status (G-EP-10)

| Item | Status | Evidence |
|------|--------|----------|
| Subprocessor register complete | **PARTIAL** — draft in policy L1/L2 | `L1_GDPR_POLICY_V2_WORKPLAN.md` §15 |
| DPA templates approved | **PENDING** | `GDPR_SIGNOFF_DECISION_LOG.md` §8 |
| Cloud/hosting DPAs | **DEFERRED** | Cloud preconditions not met |
| Keycloak DPA | **PENDING** | Self-hosted — operator responsibility |
| Email provider DPA | **PENDING** | Provider not selected |
| hCaptcha DPA | **PENDING** | G-EP-08 not met |
| Signed DPAs for hosted stack | **NO** | 0 signed |

**Overall processor agreements status for summary.json:** `PARTIAL`

---

## Local pilot vs external hosted pilot

| Environment | Processor risk | DPA requirement |
|-------------|----------------|-----------------|
| Local CLRC synthetic pilot | Lower — no real PII; local stack | DPA review **recommended** but gate not blocking CLRC |
| External hosted pilot with real candidates | **High** — all P-01–P-11 relevant | **Mandatory** — G-EP-10 NOT MET |

---

## Required DPO/legal actions

1. Confirm data residency requirements for external pilot jurisdiction.  
2. Complete subprocessor register for **actual** hosted stack (not assumptions).  
3. Execute DPAs with all subprocessors processing personal data on external pilot.  
4. Document transfer mechanisms (SCCs, adequacy, or derogations).  
5. Complete Transfer Impact Assessments where cross-border.  
6. Record hCaptcha and email provider in RoPA with lawful basis.

---

## Explicit non-claims

- No DPA is **signed** as of this package date.  
- No cross-border transfer mechanism is **approved**.  
- Cloud hosting processor list is **not finalized**.
