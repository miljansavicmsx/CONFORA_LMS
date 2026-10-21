# CONFORA AI Agent Instructions

# Canonical Authority

Approved owner decisions are the highest repository governance authority.

The Canonical Development Baseline is the controlling development baseline,
subordinate to approved owner decisions and interpreted according to
`docs/governance/GOVERNANCE_HIERARCHY.md`:

**docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md**

All AI agents SHALL:

- Read and follow the Baseline before implementation
- Treat the Baseline as the controlling development baseline, subordinate only
  to approved owner decisions, per `docs/governance/GOVERNANCE_HIERARCHY.md`
- Report specification conflicts
- Refuse implementations that violate governance requirements

Mandatory compliance:

- ISO/IEC 17024
- ISO 21001
- ISO/IEC 27001
- GDPR
- AI Governance
- Segregation of Duties
- Multi-Tenant Isolation
- Immutable Audit Trail
- Evidence Preservation

When conflicts are detected:
**STOP implementation and report them.**

---

You are working on CONFORA:

Digital Competence & Certification Infrastructure Platform.

The system combines:

- learning,
- assessment,
- certification,
- standards intelligence,
- AI governance,
- conformity assessment,
- digital trust.

# Primary Standards

- ISO/IEC 17024
- ISO 21001
- ISO/IEC 19788
- ISO/IEC 8808
- ISO/IEC 27001
- WCAG 2.2

# Architecture Principles

- Domain-driven design
- Enterprise modularity
- Separation of duties
- Immutable auditability
- AI transparency
- Human oversight

# Mandatory Requirements

Always preserve:

- auditability,
- traceability,
- security,
- multilingual support,
- accessibility,
- tenant isolation.

# CONFORA – Security Review Gate

Mandatory owner decision, 2026-10-21. Normative restatement:
`docs/governance/SECURITY_REVIEW_GATE.md`.

Every PR that changes authentication, authorization, RBAC, tenant isolation,
processing of sensitive data, or other security-critical functionality must
pass an independent review before merge approval. The review covers:

1. Change analysis (security risks, regressions).
2. Access-control verification (authn, authz, tenant isolation).
3. Regression tests proving the fix and no breakage.
4. All relevant CI checks passing.
5. An independent reasoned GO/NO-GO tied to a specific commit SHA.

The reviewer must not be the author of the changes. Any later change to
security-relevant code requires re-review of that part. Known tenant-isolation
gaps block production use with real data until fixed.

Do not treat a green CI run, or an author-written summary, as that review.
Do not approve merge without the independent GO for the reviewed SHA.

# Never

Never generate:

- fake compliance,
- fake audit trails,
- hidden AI decisions,
- uncontrolled admin access,
- architecture-breaking shortcuts.

# AI Usage

AI is assistive only.

Certification decisions require human review.

All AI-generated outputs must support:

- audit logs,
- reviewer approval,
- traceability,
- disclosure.

# Code Quality

Generate:

- explicit types,
- clean architecture,
- reusable modules,
- testable services,
- secure APIs,
- production-ready code.

Avoid:

- spaghetti code,
- temporary hacks,
- duplicate logic,
- unclear naming.
