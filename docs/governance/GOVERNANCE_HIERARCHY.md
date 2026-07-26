# CONFORA Governance Hierarchy

**Document ID:** CON-GOV-HIERARCHY-001
**Status:** Active (rebaselined in R0-1B1)
**Owner:** CONFORA Architecture & Governance

This document defines the precedence order for CONFORA governance, architecture, and implementation authority. When documents conflict, **higher levels prevail**. Conflicts must be **recorded and escalated**, not silently resolved by an agent. Only a formal Architecture Decision Record (ADR) approved at the appropriate level, or an approved owner decision, may supersede a lower-authority statement.

Evidence packages **never** override normative governance.

---

## Order of authority

### Level 1 — Approved owner decisions

Signed owner decisions are the highest authority.

| Document | Path |
|----------|------|
| Owner Decision Register | [OWNER_DECISION_REGISTER.md](./OWNER_DECISION_REGISTER.md) |
| Owner Decision Package | [OWNER_DECISION_PACKAGE.md](./OWNER_DECISION_PACKAGE.md) |

Covers OQ-1…OQ-7, OD-R03-1…OD-R03-5, OD-R01-1…OD-R01-10.

### Level 2 — Canonical Development Baseline

| Document | Path |
|----------|------|
| Canonical Development Baseline | [CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md](./CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md) |

Controls architecture direction, security, ISO alignment, GDPR retention, AI governance, roles, SoD, multi-tenancy, and auditability. Its §0 Rebaseline Addendum records verified repository state.

### Level 3 — Engineering Constitution and Change Control

| Document | Path |
|----------|------|
| Engineering Constitution | [ENGINEERING_CONSTITUTION.md](./ENGINEERING_CONSTITUTION.md) |
| Change Control | [CHANGE_CONTROL.md](./CHANGE_CONTROL.md) |
| Standards Reference Policy | [STANDARDS_REFERENCE_POLICY.md](./STANDARDS_REFERENCE_POLICY.md) |

### Level 4 — Accepted ADRs

Accepted Architecture Decision Records that do **not** conflict with higher authority. ADRs are not yet tracked in the authoritative corpus; they are scheduled for promotion in **R0-1B2** under `docs/architecture/adrs/`. Until then, ADR content is referenced but ADR-001 is known to be contradicted (see Level 2 §0.2 and the Frontend Canonicalization Gap Note below).

### Level 5 — Canonical architecture standards

Canonical component registry, legacy deprecation matrix, multi-tenancy standard, shared-kernel standard, and security architecture. These are scheduled for promotion in **R0-1B2/B3** and are not yet part of the tracked authoritative corpus.

### Level 6 — Module and task specifications

Module specifications, task specifications, and templates (task/prompt/review). Templates are scheduled for **R0-1B3**.

### Level 7 — Implementation evidence and reviews

Evidence packages under `docs/evidence/**`, independent reviews, and delivery artifacts. **Lowest authority.** Evidence records what happened; it does not set policy and cannot override Levels 1–6.

---

## Companion normative documents (Level 2 scope)

| Document | Path | Note |
|----------|------|------|
| Frontend Canonicalization Gap Note | [FRONTEND_CANONICALIZATION_GAP_NOTE.md](./FRONTEND_CANONICALIZATION_GAP_NOTE.md) | Preserves OQ-4 contradiction |
| AI Agent Instructions | [../../AGENTS.md](../../AGENTS.md) | Must comply with Levels 1–2 |

`.cursor/rules/**` and `AGENTS.md` operational rules remain governed by **R0-2** (OQ-2) and are not tracked as normative governance in this task.

---

## Conflict resolution procedure

1. **Detect** — a contributor or AI agent identifies inconsistency with an owner decision, the Baseline, the Constitution, Change Control, ISO 17024, SoD, or tenant isolation.
2. **Stop** — do not merge conflicting implementation without governance review.
3. **Record** — log the conflict (governance ticket or dated evidence package).
4. **Escalate** — route to the roles named in `CHANGE_CONTROL.md`.
5. **Resolve** — update the lower-authority document, remediate code, or approve an ADR/owner decision that explicitly supersedes the specific statement, with expiry where a waiver is involved.

Silent resolution by an agent is prohibited.
