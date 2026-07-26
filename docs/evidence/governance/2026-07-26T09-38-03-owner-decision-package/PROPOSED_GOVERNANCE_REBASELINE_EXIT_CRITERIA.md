# GOVERNANCE_REBASELINE_EXIT_CRITERIA

**Proposed path:** `docs/governance/GOVERNANCE_REBASELINE_EXIT_CRITERIA.md`  
**Status:** PROPOSED  
**Purpose:** Define GO/NO-GO conditions for completing the CONFORA governance rebaseline (task R2) after owner decisions and remediation.

**Upstream evidence verdict:** READY WITH CONDITIONS  
**This decision-package verdict:** READY FOR OWNER DECISIONS

---

## 1. Exit criteria — owner decisions

| ID | Criterion | Required |
|----|-----------|:--------:|
| E-D1 | OQ-1 through OQ-7 recorded in Owner Decision Register with status ≠ blank | Yes |
| E-D2 | Every `ACCEPTED` decision has Repository Owner signature + date | Yes |
| E-D3 | Role-required co-signatures present (Security, Compliance, Architecture, Ops, DPO as specified per OQ) | Yes |
| E-D4 | All OPEN waivers have owner, justification, and **expiry date** | Yes |
| E-D5 | Decision evidence copy filed under `docs/evidence/governance/` | Yes |

**NO-GO if any required OQ is `DEFERRED` without an explicit remediation blocker waiver.**

---

## 2. Exit criteria — authority chain (OQ-1 / OQ-2)

| ID | Criterion | Required if |
|----|-----------|-------------|
| E-A1 | Path cited by `AGENTS.md` for Baseline exists in a **fresh clone** | OQ-1 = A or B |
| E-A2 | ADRs required by Register are tracked | OQ-1 = A or B |
| E-A3 | `.cursor/rules/*.mdc` required by Register are tracked; `.gitignore` exception verified | OQ-2 = A or C |
| E-A4 | If OQ-1 = C: `AGENTS.md` updated to cite external SoR URI and clone checklist documents offline retrieval | OQ-1 = C |
| E-A5 | No rule or AGENTS text cites a path that is absent from the chosen SoR | Always |

---

## 3. Exit criteria — deployment and CI (OQ-6 / R0-3 / R0-7)

| ID | Criterion | Required |
|----|-----------|:--------:|
| E-C1 | No workflow auto-deploys production on push without manual approval / environment protection | Yes |
| E-C2 | `deploy-backend.yml` disposition matches Register (disabled / dispatch-only / deleted) | Yes |
| E-C3 | Every **enabled** CI job references only **tracked** paths | Yes |
| E-C4 | Fresh-clone CI: enabled jobs pass or explicitly skip with documented reason | Yes |
| E-C5 | Rollback procedure for production deploy exists and is linked from Register | Yes |
| E-C6 | Lint/typecheck/husky chain still functional | Yes |

---

## 4. Exit criteria — canonical applications (OQ-3 / OQ-4)

| ID | Criterion | Required |
|----|-----------|:--------:|
| E-S1 | Written canonical backend statement matches Registry + ADR (or superseding ADR) | Yes |
| E-S2 | Nest buildability definition from Register is met **or** interim thin profile approved and documented | Yes |
| E-S3 | FastAPI disposition implemented (freeze-tracked / freeze-untracked / archived) as decided | Yes |
| E-S4 | Superseding frontend ADR Accepted (or ADR-001 reaffirmed with CI moved to match) | Yes |
| E-S5 | Canonical Component Registry labels match operational / target / legacy reality | Yes |
| E-S6 | Frontend CI target matches Register | Yes |

---

## 5. Exit criteria — identity / RBAC / SoD (OQ-5 / R0-6)

| ID | Criterion | Required |
|----|-----------|:--------:|
| E-I1 | Named runtime SoR for authZ/SoD | Yes |
| E-I2 | Named target SoR and parity gate (if transitional) | Yes |
| E-I3 | IdP canonical + legacy retirement criteria written | Yes |
| E-I4 | Role vocabulary single or mapped; mapping document tracked if dual | Yes |
| E-I5 | Minimum SoD negative tests tracked and runnable for current SoR | Yes |
| E-I6 | Nest certification decision routes **not** enabled without parity gate pass | Yes |

---

## 6. Exit criteria — data / tenant / audit (OQ-7 / R1)

| ID | Criterion | Required |
|----|-----------|:--------:|
| E-T1 | Tenant context fail-closed **or** Register waiver with expiry | Yes |
| E-T2 | Update/delete tenant gap remediated **or** waiver with expiry | Yes |
| E-T3 | Platform-scope bypass policy documented and auditable | Yes |
| E-T4 | Audit append-only control present in tracked migrations **or** verified applied + documented | Yes |
| E-T5 | Audit RLS decision applied; no false claim of RLS if absent | Yes |
| E-T6 | Write-path PII redaction implemented **or** waiver with expiry | Yes |
| E-T7 | Evidence corpus append-only rule published; retention statement present | Yes |
| E-T8 | audit-client vs `packages/audit` conflict resolved in tracked governance text | Yes |
| E-T9 | Tests named in Register for retained controls are tracked | Yes |

---

## 7. Exit criteria — hygiene (R1-3)

| ID | Criterion | Required |
|----|-----------|:--------:|
| E-H1 | `.gitattributes` (or equivalent) addresses CRLF phantom-dirty **or** documented deferred with owner | Recommended |
| E-H2 | `packages/ai-client` generated src artifacts ignored | Recommended (RH48B) |
| E-H3 | `.terraform/` ignored | Recommended |
| E-H4 | Zero tracked generated artifacts in dist/node_modules/.turbo/coverage | Yes |

---

## 8. Exit criteria — honesty constraints (always)

The rebaseline **must not**:

1. Mark tenant isolation, SoD, Nest RBAC, or audit redaction as “implemented” if still PARTIALLY VERIFIED / NOT FOUND without waiver.  
2. Claim production, external pilot, DPO/legal, security-delegate, or accreditation approval.  
3. Treat untracked working-tree code as git-enforced.  
4. Leave C-01 (authority chain) or C-03 (armed deploy) class defects open without signed waiver.

---

## 9. Final verdict options for R2

| Verdict | When to use |
|---------|-------------|
| **READY FOR GOVERNANCE REBASELINE** | All required E-* criteria met; no open critical waivers |
| **READY WITH CONDITIONS** | Required criteria met except time-boxed waivers listed in Register with owners/expiries |
| **NOT READY** | Any of E-D1–E-D5, E-C1–E-C3, E-A5, or honesty constraints fail |

---

## 10. Minimum path to “decisions complete” (pre-remediation)

Before any remediation except audit-only evidence:

1. Sign **OQ-6** (deployment containment) — unblocks R0-3.  
2. Sign **OQ-1** and **OQ-2** — unblocks authority chain.  
3. Sign **OQ-3**, **OQ-4**, **OQ-5**, **OQ-7** — unblocks R0-4+.

**Package-level verdict now:** **READY FOR OWNER DECISIONS** — analysis complete; Register blank; no decisions auto-applied.
