# CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md

**Document ID:** CON-ARCH-BASELINE-001  
**Version:** 1.0  
**Status:** CANONICAL DEVELOPMENT BASELINE  
**Date:** 2026-05-31  
**Owner:** CONFORA Architecture & Governance  
**Applies to:** all CONFORA development work, prompts, Cursor/AI agents, backend, frontend, database, infrastructure, documentation and tests

---

## 0. Repository State Rebaseline Addendum (R0-1B1)

**Added:** 2026-07-26 during R0-1B1 Authority Chain promotion.
**Status:** Normative. This addendum records the **verified current repository state** so the canonical direction below is not misread as a claim of completion. Where §4 and later sections describe canonical *intent*, this addendum records what is *actually verified today*.

> A requirement stated in this Baseline is **not** evidence of implementation. Implementation claims require repository evidence that distinguishes requirement, implementation, verification, and residual gap (see `STANDARDS_REFERENCE_POLICY.md`).

### 0.1 Backend (OQ-3 — CLOSED_ACCEPTED)

- **NestJS** (`apps/api`) is the **canonical backend**.
- Historical Baseline state that tracked `apps/api` was incomplete and not confirmed buildable is **superseded** by accepted BAR-P01..P08 recovery and OQ-3 formal closure (`CLOSED_ACCEPTED`).
- **OQ-3 is CLOSED_ACCEPTED** (formal package pending integration until merge; see Owner Decision Register OQ-3 and `docs/evidence/r0-7d-oq3-formal-closure/20260904123628/`).
- **FastAPI (`backend/`) is not approved as the canonical backend** (frozen-legacy only via a separate approved task; physical deletion not required for OQ-3 closure).
- Any future tracking of `backend/` (FastAPI) must occur through a **separate approved frozen-legacy task** — not this task.
- OQ-3 closure does **not** close R0-7D, authorize T026/C3-S9/DISP-A, authorize R0-7E, authorize deployment, or close pre-existing CI debt.

### 0.2 Frontend (OQ-4 — OPEN)

- `frontend-app` (Vite + React) is the **current operational canonical frontend** for the locked local release candidate.
- **ADR-001 remains contradicted** (it designates Next.js `apps/web` canonical and `frontend-app` frozen). This contradiction is preserved, not resolved here.
- Formal supersession of ADR-001 is deferred to **R0-1B2**. See `FRONTEND_CANONICALIZATION_GAP_NOTE.md`.

### 0.3 Deployment containment (OQ-6 — MERGED WITH CONDITIONS)

- **R0-3 deployment containment is merged and active with conditions.**
- **Production deployment remains unauthorized.**
- The production deployment branch allowlist remains a **temporary deny-all** control.
- Administrator bypass of the production Environment (`can_admins_bypass=true`) remains a **temporary accepted risk** (RA-R03-1) with a review date.

### 0.4 Tenant isolation and audit (OQ-7 — PARTIALLY VERIFIED)

- Tenant-isolation and audit controls are described as requirements below but remain **partially verified**; separate remediation is required.

### 0.5 CI reconstruction (R0-7)

- Several CI workflows reference untracked or invalid paths and remain broken on a fresh clone. **R0-7 remains required** for CI reconstruction. This task does not repair them.

### 0.6 Cursor rules (OQ-2 / R0-2)

- `.cursor/rules/**` remains **outside this task** and belongs to **R0-2**. Any reference to Cursor rules in this Baseline is advisory only until R0-2 tracks them under controlled change.

### 0.7 Source-hierarchy reconciliation

The legacy §2 source list predates the tracked governance corpus. The **authoritative precedence** is now defined in `GOVERNANCE_HIERARCHY.md`, with approved owner decisions (see `OWNER_DECISION_REGISTER.md`) at the top. Files named in §2 that are not yet tracked are aspirational references, not proof of existence.

---

## 1. Purpose

This document defines the canonical development baseline for CONFORA — Digital Competence & Certification Infrastructure Platform.

It is the controlling reference for future development decisions, AI prompts, architecture changes and implementation tasks.

**Precedence:** Approved owner decisions (see `OWNER_DECISION_REGISTER.md`) are the highest authority per `GOVERNANCE_HIERARCHY.md`. This Baseline is the controlling development baseline **subordinate to approved owner decisions**. Where an older document conflicts with this Baseline, this Baseline prevails over that older document; where this Baseline conflicts with an approved owner decision, the owner decision prevails. A formal ADR may supersede a specific Baseline statement only where it does not conflict with a higher authority.

---

## 2. Source hierarchy

> **Superseded by `GOVERNANCE_HIERARCHY.md` (R0-1B1).** The authoritative order of precedence is defined in `GOVERNANCE_HIERARCHY.md`, in which **approved owner decisions (`OWNER_DECISION_REGISTER.md`) rank above this Baseline**. The legacy list below is retained for historical reference only and does **not** override the governance hierarchy. Some documents named below are not yet tracked; an untracked name is not proof of existence (see §0.7).

Legacy interpretation list (historical, non-authoritative):

1. **Approved owner decisions — `OWNER_DECISION_REGISTER.md`** (highest, per `GOVERNANCE_HIERARCHY.md`)
2. **This document — CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md**
3. **CONFORA_GDPR_POLICY.md v2.0**
4. **AGENTS.md**
5. **TECH_DEBT.md** — canonical register at `docs/governance/TECH_DEBT.md`
6. **architecture.md**
7. **auth-architecture.md**
8. **CONFORA_WORKFLOWS.md**
9. **CONFORA_SCHEMES_CATALOG.md**
10. **iso17024-mapping.md**
11. **CONFORA_SPEC_ANALIZA.md**
12. **CONFORA_FULL_SPEC.md**

For any conflict, apply `GOVERNANCE_HIERARCHY.md`; a lower-authority document never overrides a higher-authority one.

---

## 3. Non-negotiable principles

CONFORA development shall always preserve:

- auditability;
- traceability;
- security;
- multilingual support;
- accessibility;
- tenant isolation;
- human oversight;
- separation of duties;
- immutable evidence;
- AI transparency.

The system shall never implement:

- fake compliance;
- fake audit trails;
- hidden AI decisions;
- uncontrolled administrator access;
- architecture-breaking shortcuts;
- certification decisions made solely by AI;
- deletion of certification evidence without retention/legal review.

---

## 4. Canonical technology stack

### 4.1 Frontend

> **Approved target / intended canonical direction — not proof of current implementation. See §0.2.** `frontend-app` (Vite + React) is the **current operational canonical frontend** for the locked local release candidate. ADR-001 remains contradicted; formal supersession toward the target stack below is deferred to **R0-1B2** (OQ-4 OPEN). Presence of `apps/web`/`apps/admin` in the repository is not evidence of pilot parity.

Target (intended canonical) frontend stack:

- **Next.js 14+**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **apps/web** for public, learner and candidate portal
- **apps/admin** for administrative, committee, governance and quality portals

Frontend must not contain certification decision logic. Frontend may display workflow states but all authoritative decisions must be enforced server-side.

### 4.2 Backend

> **Canonical backend (OQ-3 CLOSED_ACCEPTED).** See §0.1. NestJS `apps/api` is the canonical backend; buildability confirmed via accepted BAR-P01..P08 and OQ-3 CR1. Historical “incomplete / not confirmed buildable / OQ-3 OPEN” Baseline wording is superseded. FastAPI (`backend/`) is not approved as canonical and may only be tracked later via a separate frozen-legacy task. OQ-3 closure does not authorize R0-7E, deployment, T026, C3-S9, or CI-debt closure.

Target (canonical) backend stack:

- **NestJS**
- **REST + optional GraphQL**
- **apps/api** as canonical API gateway
- **apps/worker** for background processing
- clear modular domain structure aligned with DDD bounded contexts

No new FastAPI backend shall be introduced for core CONFORA modules.

### 4.3 Database

Canonical database stack:

- **PostgreSQL 16+**
- **Prisma ORM**
- **Row-Level Security where applicable**
- **pgvector** for vector search and standards/learning embeddings

The database must support:

- tenant isolation;
- immutable audit events;
- hash-chained audit log;
- certification records retention;
- GDPR-compliant deletion/anonymization workflows.

### 4.4 Object storage

Canonical object storage:

- S3-compatible storage;
- MinIO or LocalStack for local development;
- AWS S3 or equivalent for production.

Object storage shall be used for:

- ID documents;
- evidence files;
- exam recordings where applicable;
- certificates;
- uploaded learning resources;
- audit evidence packages.

Retention rules must be enforced according to GDPR policy.

### 4.5 Vector database

Canonical vector database:

- **pgvector inside PostgreSQL** for MVP.

Qdrant may be considered later only through ADR.

### 4.6 Authentication provider

Canonical authentication provider:

- **Keycloak OIDC** for MVP and production architecture.

A custom auth-service may exist only as a transitional/legacy component and must not become a second source of identity truth.

### 4.7 Queue/event backbone

Canonical event backbone for MVP:

- **RabbitMQ**.

Kafka may be considered post-MVP only through ADR.

---

## 5. Canonical bounded contexts

CONFORA shall be developed using domain-driven design.

Canonical bounded contexts:

1. Identity & Access
2. Learning
3. Knowledge & Metadata
4. Assessment & Exam
5. Certification
6. Governance & Impartiality
7. Trust & Digital Credentials
8. Appeals, Complaints & Ethics
9. Quality, Risk & Compliance
10. System Administration & Security
11. AI Governance
12. Finance & Billing
13. Reporting & Analytics

Each bounded context must own its entities, services and invariants. Cross-context operations must use application services, domain events or approved API contracts.

---

## 6. Canonical role model

Canonical roles shall be maintained in `roles.md` and implemented in shared types.

Minimum canonical roles:

| Code | Role |
|---|---|
| `USR_CAND` | Candidate |
| `USR_CERT` | Certified person |
| `STAFF_DIR` | Director |
| `STAFF_SYSADM` | System administrator |
| `STAFF_TRAINADM` | Training administrator |
| `QUALITY_MANAGER` | Quality manager |
| `AI_SECURITY_MANAGER` | AI Governance and Security Manager |
| `COM_TECH` | Technical committee |
| `COM_CERT` | Certification committee |
| `COM_IMP` | Impartiality committee |
| `COM_APP` | Appeals committee |
| `STAFF_AUD` | Internal auditor |
| `SME` | Subject-matter expert |
| `EXAMINER` | Examiner |
| `INVIGILATOR` | Invigilator |

All staff, committee and privileged roles require MFA.

---

## 7. Separation of Duties baseline

The following SoD rules are mandatory:

1. A person involved in training delivery for a candidate shall not participate in certification decision for the same candidate/application.
2. A certification committee member shall not decide an appeal against their own decision.
3. A candidate shall not hold committee roles in relation to their own certification process.
4. Director may monitor governance and KPIs but shall not perform operational certification decisions.
5. System administrator shall not override certification outcomes.
6. AI-generated outputs shall not bypass human review where ISO/IEC 17024 requires certification body responsibility.

SoD must be enforced server-side, not only in UI.

---

## 8. Identity Assurance Level baseline

MVP supports only:

### IAL-1

- verified email;
- MFA;
- candidate self-declaration.

Allowed for:

- public browsing;
- learning without certification;
- non-certification training.

### IAL-2

- IAL-1 requirements;
- government-issued ID upload;
- manual human review;
- immutable audit record;
- verifier decision: VERIFIED / REJECTED / ADDITIONAL_EVIDENCE_REQUESTED.

Required for:

- certification applications;
- official certification examinations;
- certification decision process.

### IAL-3

IAL-3 is **not part of MVP**.

Live video verification, biometric matching, facial recognition or similar high-assurance verification shall not be implemented in MVP.

Any future IAL-3 implementation requires:

- ADR;
- DPIA;
- GDPR legal review;
- provider assessment;
- updated retention policy;
- updated candidate consent and privacy notices.

---

## 9. GDPR and retention baseline

The following retention rules are mandatory for MVP:

| Data category | Retention | Disposal |
|---|---:|---|
| KYC ID document image | 14 days after verification | Hard delete |
| KYC verification record | 10 years | Retain / anonymize where legally required |
| Exam video/screen evidence | 60 days unless appeal/legal hold | Hard delete |
| Exam behavioral/anomaly logs | 1 year | Hard delete |
| Examination answers | 10 years | Anonymize after retention where applicable |
| Examination scores | 10 years | Anonymize after retention where applicable |
| Audit logs | 10 years minimum | Immutable retain |
| COI records | 10 years | Retain |
| Complaint/appeal records | 10 years | Retain |
| Certificate records | Permanent | Public registry record retained |
| Support tickets | 3 years | Hard delete |

CONFORA shall not intentionally process biometric data in MVP.

---

## 10. MVP certification schemes baseline

MVP may include the following schemes as seed data:

| Code | Scheme | Process | MVP IAL |
|---|---|---|---|
| `CFR-27001-FD` | ISO/IEC 27001 Foundation | Fast-Track | IAL-2 |
| `CFR-27001-TR` | ISO/IEC 27001 Transition | Fast-Track | IAL-2 |
| `CFR-17025-FD` | ISO/IEC 17025 Foundation | Fast-Track | IAL-2 |
| `CFR-27001-LA` | ISO/IEC 27001 Lead Auditor | Standard | IAL-2 |
| `CFR-27001-LI` | ISO/IEC 27001 Lead Implementer | Standard | IAL-2 |
| `CFR-9001-LA` | ISO 9001 Lead Auditor | Standard | IAL-2 |
| `CFR-17025-LI` | ISO/IEC 17025 Lead Implementer | Standard | IAL-2 |
| `CFR-17025-LA` | ISO/IEC 17025 Lead Assessor | Standard | IAL-2 |

Any previous IAL-3 mapping in scheme catalogues is suspended for MVP.

---

## 11. Workflow baseline

### 11.1 Fast-Track certification workflow

Used for Foundation and Transition schemes.

Required gates:

1. Candidate enrolled;
2. Payment confirmed where applicable;
3. Required learning completed where applicable;
4. IAL-2 verified;
5. Exam passed;
6. Ethics declaration signed;
7. Certificate auto-generated;
8. Certificate entered into public verification registry;
9. Audit event emitted.

Fast-Track does not require committee vote unless scheme owner explicitly requires it.

### 11.2 Standard certification workflow

Used for Lead Auditor, Lead Implementer and other higher-stakes schemes.

Required gates:

1. Application submitted;
2. IAL-2 verified;
3. Eligibility review;
4. Evidence upload;
5. Exam passed;
6. Ethics declaration signed;
7. COI declaration by decision participants;
8. SoD guard pass;
9. Certification committee decision;
10. Candidate notification;
11. Certificate issuance if approved;
12. Public verification entry;
13. Audit event emitted.

---

## 12. AI governance baseline

AI in CONFORA is assistive only.

Allowed MVP AI use cases:

- AI tutor for learning support;
- learning content drafting;
- exam question drafting;
- metadata suggestions;
- risk suggestion drafting;
- standards intelligence summarization where copyright rules permit.

Mandatory controls:

1. AI output must be labelled as AI-generated.
2. AI output must be reviewed where used in official certification, assessment or governance process.
3. Prompt hash, model ID, input references and output hash must be logged.
4. AI shall not make certification decisions.
5. AI shall not create hidden evidence.
6. AI shall not reproduce copyrighted standards content beyond licensed/allowed use.
7. AI use must support auditability and traceability.

---

## 13. Standards and copyright baseline

CONFORA may reference standards and clauses for traceability, competence mapping and internal licensed use.

CONFORA shall not publicly reproduce protected ISO/BAS standard content unless licensing permits it.

Recommended approach:

- store standard identifiers;
- store clause numbers and short internal references where legally allowed;
- use abstracted competence statements;
- avoid copying full clause text into public pages;
- keep copyrighted standards in controlled internal evidence/knowledge repositories;
- implement access control and logging for standards-based RAG.

---

## 14. Accessibility and multilingual baseline

CONFORA must support:

- minimum languages: `bs-BA` and `en-US`;
- later expansion to `sr-Cyrl-BA`, `sr-Latn-BA`, `hr-BA` if required;
- WCAG 2.2 AA target;
- accessible exam accommodations;
- accessible public verification pages;
- localized notifications and certificates.

All new UI components must be accessibility-reviewed.

---

## 15. Tenant isolation baseline

CONFORA is multi-tenant by design.

Mandatory requirements:

1. Every tenant-scoped table must include `tenantId` or equivalent.
2. Queries must be tenant-scoped by default.
3. Platform-scope access must be explicit and audited.
4. Raw SQL must be reviewed and registered.
5. Tenant isolation tests are mandatory for sensitive modules.
6. Cross-tenant data visibility is a security incident unless explicitly authorized and audited.

---

## 16. Audit and evidence baseline

All critical actions must emit immutable audit events.

Mandatory audit areas:

- login and MFA events;
- role and permission changes;
- IAL verification actions;
- course publication;
- exam session lifecycle;
- question bank approval;
- AI generation and review;
- certification decisions;
- certificate issuance, suspension, withdrawal and revocation;
- appeals and complaints;
- COI declarations;
- SoD blocks;
- policy publication;
- GDPR deletion/anonymization actions.

Audit events must be append-only and hash-chained.

---

## 17. Technical debt governance

`TECH_DEBT.md` is the single source of truth for known accepted technical debt.

**Canonical location:** `docs/governance/TECH_DEBT.md` (synced F6-LOCAL-2; see also `LOCAL_RELEASE_CANDIDATE_LOCK.md`).

Rules:

1. Do not fix technical debt opportunistically inside unrelated feature work.
2. Each technical debt item requires its own focused task, commit and review.
3. Security and ISO/IEC 17024 compliance debt has priority.
4. Any newly discovered debt must be added to `TECH_DEBT.md` with a TD-ID.
5. Closed items must include evidence of resolution.

---

## 18. Architecture decision records

All material architecture changes require ADR.

ADR is mandatory for changes involving:

- authentication provider;
- queue/event backbone;
- database engine;
- vector database;
- AI model/provider;
- biometric or IAL-3 verification;
- retention periods;
- public verification trust model;
- certification decision logic;
- tenant isolation model;
- audit log immutability model.

ADR location:

```text
docs/architecture/decisions/
```

> **Cross-reference (F6-LOCAL-2):** Baseline v1.0 listed `docs/adr/` — treat as alias only. Canonical ADRs live under `docs/architecture/decisions/` per `docs/governance/ADR_ALIGNMENT_NOTE.md`. Do not duplicate ADR files.

ADR filename format:

```text
ADR-YYYY-MM-DD-short-title.md
```

---

## 19. Repository placement

This document shall be placed at:

```text
docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md
```

A short pointer shall also be added to:

```text
README.md
AGENTS.md
.cursor/rules/confora-baseline.mdc
```

---

## 20. Cursor / AI agent rule

Every AI coding agent working on CONFORA must treat this document as the controlling development baseline, **subordinate to approved owner decisions** (`OWNER_DECISION_REGISTER.md`) and interpreted according to `GOVERNANCE_HIERARCHY.md`.

Suggested Cursor rule text (illustrative only; `.cursor/rules/**` is governed by R0-2, OQ-2):

```md
# CONFORA Canonical Development Baseline

Before generating or changing code for CONFORA, read and apply:

- docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md
- docs/governance/AGENTS.md
- docs/governance/TECH_DEBT.md

Do not introduce architecture-breaking shortcuts.
Do not bypass auditability, tenant isolation, SoD, GDPR retention, AI transparency or human review.
When documents conflict, apply GOVERNANCE_HIERARCHY.md: approved owner decisions rank above this Baseline, which prevails over lower-authority documents unless an approved ADR supersedes a specific statement without conflicting with a higher authority.
```

---

## 21. Immediate implementation actions

The following actions should be performed before new feature development:

1. Create `docs/governance/` folder if missing.
2. Move or copy `AGENTS.md`, `CONFORA_GDPR_POLICY.md`, `TECH_DEBT.md` into `docs/governance/`.
3. Place this document in `docs/governance/`.
4. Add README pointer to this document.
5. Add Cursor rule pointing to this baseline.
6. Update `roles.md` to include `QUALITY_MANAGER` and `AI_SECURITY_MANAGER`.
7. Update scheme seed data so MVP uses IAL-2 only.
8. Open ADR confirming Keycloak as canonical auth provider.
9. Open ADR confirming RabbitMQ as MVP event backbone.
10. Review all retention values in older specs and align with GDPR policy.

---

## 22. Approval

This baseline becomes effective when committed to the repository and referenced by README/AGENTS/Cursor rules.

Any deviation requires documented ADR approval.

---

## 23. Governance registry cross-references (F6-LOCAL-2)

The following documents govern the **controlled local release candidate** without weakening baseline rules. They do not claim production or cloud readiness.

| Document | Purpose |
|----------|---------|
| `docs/governance/TECH_DEBT.md` | Canonical technical debt register (21 F6 items) |
| `docs/governance/LOCAL_RELEASE_CANDIDATE_LOCK.md` | CLRC scope, evidence, freeze rules |
| `docs/governance/CLOUD_STAGING_PRECONDITIONS.md` | AWS/staging deferrals and minimum preconditions |
| `docs/governance/LEGAL_PRIVACY_PRECONDITIONS.md` | GDPR v2.0, retention, IAL-2 legal gates |
| `docs/governance/LEGACY_STRANGLER_RETIREMENT_CRITERIA.md` | FastAPI coexistence and retirement proof |
| `docs/governance/FRONTEND_CANONICALIZATION_GAP_NOTE.md` | `frontend-app` vs `apps/web`/`apps/admin` |
| `docs/governance/ADR_ALIGNMENT_NOTE.md` | ADR path and RabbitMQ/Kafka position |

Evidence: `docs/evidence/f6-local-governance-sync/2026-06-18T16-02-38/`
