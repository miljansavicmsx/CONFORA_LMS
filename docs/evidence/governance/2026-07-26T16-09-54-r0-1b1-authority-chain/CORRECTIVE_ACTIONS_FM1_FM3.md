# Corrective actions — F-M1, F-M2, F-M3 (R0-1B1 follow-up)

Corrective commit: `docs(governance): align authority precedence and risk review date`
Starting HEAD: `f4e2bd18bfba7c372c891135ac028ae3e620ce31`

---

## F-M1 — Baseline intent vs verified state / precedence

**Finding:** Baseline body (§1, §2, §4.1, §4.2, §20) could be read as verified current implementation and described the Baseline as highest/prevailing authority without acknowledging approved owner decisions.

**Affected file:** `docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md`

**Exact corrections:**
- **§1 Purpose** — added a **Precedence** paragraph: approved owner decisions (`OWNER_DECISION_REGISTER.md`) are highest per `GOVERNANCE_HIERARCHY.md`; Baseline is controlling but subordinate to owner decisions; ADRs may supersede a specific statement only where not conflicting with higher authority.
- **§2 Source hierarchy** — marked **superseded by `GOVERNANCE_HIERARCHY.md`**; legacy list demoted to historical/non-authoritative; added approved owner decisions as rank 1; retained note that untracked names are not proof of existence (§0.7).
- **§4.1 Frontend** — labelled as **approved target / intended canonical direction — not proof of current implementation**; explicit pointer to **§0.2**; states `frontend-app` is current operational canonical frontend pending R0-1B2 ADR supersession (OQ-4 OPEN).
- **§4.2 Backend** — labelled as **approved target / intended canonical direction**; explicit pointer to **§0.1**; states `apps/api` is incomplete and not confirmed buildable and **OQ-3 remains OPEN**; FastAPI not approved as canonical.
- **§20 Cursor / AI agent rule** — Baseline described as controlling **subordinate to approved owner decisions**, interpreted per `GOVERNANCE_HIERARCHY.md`; illustrative Cursor snippet's conflict rule rewritten to defer to the hierarchy; snippet marked illustrative (R0-2/OQ-2).

**Validation:** OQ-3 and OQ-4 remain OPEN; no backend/frontend selected or approved; §0 unchanged; only precedence/current-state ambiguity removed.

**Closure:** CLOSED.

---

## F-M2 — AGENTS.md authority wording

**Finding:** "Treat the Baseline as higher authority than any other project document" conflicted with Governance Hierarchy Level 1 (approved owner decisions above Baseline).

**Affected file:** `AGENTS.md`

**Exact correction (Canonical Authority section):**
- Added: "Approved owner decisions are the highest repository governance authority. The Canonical Development Baseline is the controlling development baseline, subordinate to approved owner decisions and interpreted according to `docs/governance/GOVERNANCE_HIERARCHY.md`."
- Replaced the agent instruction "Treat the Baseline as higher authority than any other project document" with "Treat the Baseline as the controlling development baseline, subordinate only to approved owner decisions, per `docs/governance/GOVERNANCE_HIERARCHY.md`".
- **Baseline path preserved** (`docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md`). No Cursor-rule content added; no duplication of governance.

**Closure:** CLOSED.

---

## F-M3 — RA-R03-1 review date in Owner Decision Register

**Finding:** OD-R03-1 lacked the verified review/expiry date present in R0-3 `RISK_ACCEPTANCE.md`.

**Affected file:** `docs/governance/OWNER_DECISION_REGISTER.md`

**Exact correction (OD-R03-1):**
- Added **Review / expiry date: 2026-08-26** (30 days, or on OQ-3 resolution / any attempt to enable production deployment — whichever first; lapses unless renewed).
- Status clarified as temporary RA-R03-1, **not permanent**.
- Exit criteria restated: disable `can_admins_bypass` **and** add independent release reviewer before production deployment is enabled.
- Added **Non-affected**: OQ-3 remains OPEN; production deployment remains unauthorized; no deployment authorization granted.

**Closure:** CLOSED.

---

## Cross-cutting validation
- Relative Markdown links in the normative corpus: re-checked, 0 broken.
- JSON files: parse OK.
- Excluded scope: unchanged (no app/CI/architecture/ADR/Cursor/schema/migration/runtime/compliance changes).
- R0-3 remains containment only; production deployment remains unauthorized.
