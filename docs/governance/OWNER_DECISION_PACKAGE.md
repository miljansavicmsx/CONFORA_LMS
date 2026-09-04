# CONFORA Owner Decision Package

**Document ID:** CON-GOV-ODP-001
**Status:** Normative (authored in R0-1B1)
**Owner:** Repository Owner
**Authority level:** Governance Hierarchy Level 1
**Companion:** [OWNER_DECISION_REGISTER.md](./OWNER_DECISION_REGISTER.md)

This package is the owner-facing entry point to CONFORA governance decisions. It summarises **what has been decided**, points to the authoritative register, and states the mandatory non-claims that all downstream work must preserve. The detailed, field-by-field record lives in the Owner Decision Register; this package must not contradict it.

---

## 1. How to read this package

- **Approved / recorded** decisions and **open questions** are enumerated in the [Owner Decision Register](./OWNER_DECISION_REGISTER.md).
- Precedence of documents is defined in [GOVERNANCE_HIERARCHY.md](./GOVERNANCE_HIERARCHY.md).
- Verified repository state is in the Baseline §0 addendum: [CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md](./CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md).
- Provisional recommendations inside evidence packages (including `PROPOSED_*.md`) are **not** approved decisions.

## 2. Decision index

| Group | IDs | Where recorded |
|-------|-----|----------------|
| Open questions | OQ-1 … OQ-7 | Register Part A |
| Deployment containment | OD-R03-1 … OD-R03-5 | Register Part B (+ R0-3 evidence) |
| Governance promotion | OD-R01-1 … OD-R01-10 | Register Part C |

## 3. Mandatory non-claims (must remain explicit downstream)

1. NestJS (`apps/api`) is the **canonical** backend; historical “incomplete / not confirmed buildable” and **OQ-3 OPEN** package claims are **superseded** by accepted BAR-P01..P08 recovery and OQ-3 formal closure (`CLOSED_ACCEPTED`). OQ-3 closure does not close R0-7D or authorize T026/C3-S9/R0-7E/deployment.
2. FastAPI (`backend/`) is **not** approved as canonical; any tracking is a **separate frozen-legacy task**.
3. `frontend-app` is the **current operational** canonical frontend; **ADR-001 is contradicted** and awaits supersession (R0-1B2); **OQ-4 is OPEN**.
4. R0-3 is **containment only**; **production deployment remains unauthorized**; allowlist is **temporary deny-all**; **administrator bypass is a temporary accepted risk (RA-R03-1)**.
5. Tenant-isolation and audit controls are **partially verified** (**OQ-7**).
6. **R0-7** remains required for CI reconstruction.
7. `.cursor/rules/**` is out of scope and belongs to **R0-2** (**OQ-2**).
8. A standards **mapping is not conformity**; implementation claims require repository evidence.

## 4. Signing status

The decisions in the Register are recorded as of 2026-07-26. Amendments follow [CHANGE_CONTROL.md](./CHANGE_CONTROL.md). Where the Repository Owner temporarily also acts as Architecture Lead, that role combination is recorded and material supersessions require independent review.
