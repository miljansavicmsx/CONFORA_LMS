# CONFORA Owner Decision Register

**Document ID:** CON-GOV-ODR-001
**Status:** Normative (authored in R0-1B1)
**Owner:** Repository Owner
**Authority level:** Governance Hierarchy Level 1 (highest)
**Companion:** [OWNER_DECISION_PACKAGE.md](./OWNER_DECISION_PACKAGE.md)

This register records decisions that are **approved or formally recorded** as of this task. Provisional recommendations are **not** recorded as approved unless they were adopted as binding decisions. Open questions are marked **OPEN**.

Legend — Status: `ACCEPTED` / `ACCEPTED (DEFERRED)` / `OPEN` / `MERGED_WITH_CONDITIONS` / `DIRECTIONAL`.

---

## Part A — Open questions (OQ-1 … OQ-7)

### OQ-1 — Governance corpus tracking
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | ACCEPTED |
| Approved option | Track the authoritative governance/architecture corpus in Git |
| Owner | Repository Owner |
| Rationale | Close authority-chain break (C-01); enable fresh-clone governance |
| Scope | `docs/governance/**`, `docs/architecture/**` (phased via R0-1B1/B2/B3) |
| Residual risk | Phased promotion leaves some corpus untracked between waves |
| Dependencies | — |
| Exit criteria | Authority chain (R0-1B1) + architecture (R0-1B2) + compliance/templates (R0-1B3) tracked |
| Supersession | — |

### OQ-2 — Cursor rules tracking
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | ACCEPTED (DEFERRED) |
| Approved option | Track `.cursor/rules/**` later under a separate controlled **R0-2** task |
| Owner | Repository Owner |
| Rationale | Keep agent-rule tracking under dedicated change control |
| Scope | `.cursor/rules/**` — excluded from R0-1 |
| Residual risk | Rules remain gitignored/local until R0-2 |
| Dependencies | OQ-1 |
| Exit criteria | R0-2 executed |
| Supersession | — |

### OQ-3 — Canonical backend
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | OPEN |
| Approved option | NestJS intended canonical; recovery/reconstruction required; FastAPI later frozen-legacy only via approved task |
| Owner | Repository Owner |
| Rationale | Tracked `apps/api` incomplete/not confirmed buildable; FastAPI not approved canonical |
| Scope | `apps/api`, `backend/` |
| Residual risk | No confirmed buildable canonical backend today |
| Dependencies | Nest recovery discovery |
| Exit criteria | Buildable canonical backend confirmed; FastAPI disposition decided |
| Supersession | — |

### OQ-4 — Canonical frontend
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | OPEN |
| Approved option | `frontend-app` is current operational canonical frontend pending an ADR superseding ADR-001 |
| Owner | Repository Owner |
| Rationale | Pilot operational truth diverges from ADR-001; see Frontend Canonicalization Gap Note |
| Scope | `frontend-app`, `apps/web`, `apps/admin`, ADR-001 |
| Residual risk | ADR-001 contradiction remains until superseded |
| Dependencies | R0-1B2 ADR supersession |
| Exit criteria | Superseding ADR accepted; parity migration criteria met |
| Supersession | Pending (R0-1B2) |

### OQ-5 — Identity / RBAC / SoD
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | DIRECTIONAL |
| Approved option | Canonical identity/RBAC/SoD end-state in the canonical stack with a controlled transitional parity gate |
| Owner | Repository Owner |
| Rationale | Transitional surfaces exist; end-state must not fork identity truth |
| Scope | Identity & Access context |
| Residual risk | Transitional enforcement not equal to end-state |
| Dependencies | OQ-3 |
| Exit criteria | Canonical enforcement verified with evidence |
| Supersession | — |

### OQ-6 — Deployment containment
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | MERGED_WITH_CONDITIONS |
| Approved option | R0-3 deployment containment merged; production deployment unauthorized |
| Owner | Repository Owner |
| Rationale | Contain unsafe auto-deploy of untracked backend |
| Scope | `.github/workflows/deploy-backend.yml`, GitHub Environment `production` |
| Residual risk | Admin bypass (RA-R03-1); empty deny-all allowlist |
| Dependencies | OD-R03-1…OD-R03-5 |
| Exit criteria | See OD-R03-1 exit; independent release reviewer + bypass disabled before prod deploy |
| Supersession | — |

### OQ-7 — Tenant isolation and audit
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | OPEN |
| Approved option | Treat tenant isolation and audit controls as partially verified; separate remediation required |
| Owner | Repository Owner |
| Rationale | Controls exist as requirements; verification incomplete |
| Scope | Multi-tenancy standard, audit ledger |
| Residual risk | Cross-tenant/audit gaps until remediated |
| Dependencies | — |
| Exit criteria | Remediation with isolation/audit evidence |
| Supersession | — |

---

## Part B — R0-3 deployment decisions (OD-R03-1 … OD-R03-5)

Recorded in the R0-3 evidence package `docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/OWNER_DECISIONS.md`.

### OD-R03-1 — Administrator bypass
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | ACCEPTED (temporary risk — RA-R03-1; **not permanent**) |
| Approved option | Preferred `can_admins_bypass=false` not applied in that task; `can_admins_bypass: true` accepted **temporarily** as RA-R03-1 |
| Owner | Repository Owner |
| Rationale | Single-maintainer; layered fail-closed controls prevent deploy today |
| Scope | GitHub Environment `production` |
| Residual risk | Admin can bypass reviewer gate on a future run |
| Review / expiry date | **2026-08-26** (30 days), or immediately upon OQ-3 resolution or any attempt to enable production deployment — whichever comes first. Acceptance lapses at the review date unless explicitly renewed in evidence. |
| Dependencies | Independent release reviewer |
| Exit criteria | Disable administrator bypass (`can_admins_bypass=false`) **and** add an independent release reviewer distinct from the deploying admin, both **before** production deployment is enabled |
| Non-affected | OQ-3 remains OPEN; production deployment remains unauthorized; this acceptance grants no deployment authorization |
| Supersession | — |

### OD-R03-2 — Deployment branch policy
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | ACCEPTED |
| Approved option | Keep empty custom allowlist as intentional temporary deny-all |
| Owner | Repository Owner |
| Rationale | No legitimate production source until OQ-3 resolved |
| Scope | Environment `production` branch policy |
| Residual risk | Legitimate deploys blocked until populated (intended) |
| Dependencies | OQ-3 |
| Exit criteria | OQ-3 resolved; tracked source approved; branch/tag pattern decided; policy independently reviewed |
| Supersession | — |

### OD-R03-3 — Canonical backend (deploy view)
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | ACCEPTED |
| Approved option | OQ-3 remains open; R0-3 selects no canonical backend, approves no `backend/`, authorizes no deployment |
| Owner | Repository Owner |
| Rationale | Containment must not smuggle architecture decisions |
| Scope | Deploy pipeline |
| Residual risk | Untracked `backend/` persists (blocked from pipeline) |
| Dependencies | OQ-3 |
| Exit criteria | OQ-3 decision |
| Supersession | — |

### OD-R03-4 — CI remediation
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | ACCEPTED |
| Approved option | R0-7 remains the approved task for repairing other CI workflows |
| Owner | Repository Owner |
| Rationale | Keep R0-3 single-purpose |
| Scope | Non-deploy CI workflows |
| Residual risk | Broken CI on fresh clone until R0-7 |
| Dependencies | — |
| Exit criteria | R0-7 completion |
| Supersession | — |

### OD-R03-5 — Merge interpretation
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | ACCEPTED |
| Approved option | PR #1 merged as containment control only |
| Owner | Repository Owner |
| Rationale | Merge is not readiness/go-live/OQ-3 closure/backend approval/accreditation |
| Scope | PR #1 (merged `1f141fe1`) |
| Residual risk | Misinterpretation (mitigated by record) |
| Dependencies | — |
| Exit criteria | Standing interpretation rule |
| Supersession | — |

---

## Part C — R0-1 promotion decisions (OD-R01-1 … OD-R01-10)

Approved for this R0-1 governance promotion sequence.

### OD-R01-1 — Wave split
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | ACCEPTED |
| Approved option | Reject monolithic 26-item Wave A; split into R0-1B1 (authority chain), R0-1B2 (architecture), R0-1B3 (compliance/templates) |
| Owner | Repository Owner |
| Rationale | Controlled, reviewable promotion |
| Scope | R0-1 promotion sequencing |
| Residual risk | Corpus partially tracked between waves |
| Dependencies | OQ-1 |
| Exit criteria | B1+B2+B3 complete |
| Supersession | Supersedes R0-1A single-Wave-A proposal |

### OD-R01-2 — Evidence tracking
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | ACCEPTED |
| Approved option | Track three governance evidence packages as **evidence only** (non-normative) |
| Owner | Repository Owner |
| Rationale | Auditability without making PROPOSED_* normative |
| Scope | rebaseline, owner-decision, R0-1A inventory packages |
| Residual risk | Evidence misread as normative (mitigated by status notices) |
| Dependencies | — |
| Exit criteria | Packages tracked with notices |
| Supersession | — |

### OD-R01-3 — Path/naming and AI merges
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | ACCEPTED (DEFERRED to R0-1B2) |
| Approved option | ADR path move and architecture renames deferred to R0-1B2; AI companion merging deferred to R0-1B2 |
| Owner | Repository Owner |
| Rationale | Keep R0-1B1 to authority chain |
| Scope | ADRs, `STRUCTURE.md`, AI companion docs |
| Residual risk | Dual paths until B2 |
| Dependencies | R0-1B2 |
| Exit criteria | B2 executes moves/merges |
| Supersession | — |

### OD-R01-4 — Compliance/security merges
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | ACCEPTED (DEFERRED to R0-1B3) |
| Approved option | Defer compliance and security document merges to R0-1B3 |
| Owner | Repository Owner |
| Rationale | Merges require copyright scan and consolidation |
| Scope | ISO mappings, traceability, security cluster |
| Residual risk | Duplicates remain untracked until B3 |
| Dependencies | R0-1B3 |
| Exit criteria | B3 executes merges |
| Supersession | — |

### OD-R01-5 — Author missing authority-chain docs
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | ACCEPTED |
| Approved option | Author minimum missing authority-chain documents in R0-1B1 |
| Owner | Repository Owner |
| Rationale | Self-contained authority chain requires constitution, change control, register/package, standards policy |
| Scope | `docs/governance/*` authored files |
| Residual risk | Newly authored text must avoid overclaiming |
| Dependencies | OD-R01-9 |
| Exit criteria | Files authored and validated |
| Supersession | — |

### OD-R01-6 — G3–G6 exclusion
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | ACCEPTED |
| Approved option | Exclude G3–G6 analysis documents from the authoritative corpus |
| Owner | Repository Owner |
| Rationale | Analysis/report material, not Baseline-class SoR |
| Scope | `docs/architecture/G*.md` |
| Residual risk | Analysis remains local/untracked |
| Dependencies | — |
| Exit criteria | — |
| Supersession | — |

### OD-R01-7 — Root reference markdown
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | ACCEPTED |
| Approved option | Root `CONFORA_*.md` reference files remain untracked |
| Owner | Repository Owner |
| Rationale | Non-normative product context; potential conflicts |
| Scope | Root `CONFORA_*.md` |
| Residual risk | Context remains local-only |
| Dependencies | — |
| Exit criteria | — |
| Supersession | — |

### OD-R01-8 — Root binaries
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | ACCEPTED |
| Approved option | Root PDF/DOCX remain DO_NOT_TRACK; no full copyrighted standard PDFs without verified rights |
| Owner | Repository Owner |
| Rationale | Avoid binary SoR and licence risk |
| Scope | Root `*.pdf`, `*.docx` |
| Residual risk | Requirements trapped in binaries until extracted |
| Dependencies | Standards Reference Policy |
| Exit criteria | Optional later markdown extraction |
| Supersession | — |

### OD-R01-9 — Non-claims acknowledgement
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | ACCEPTED |
| Approved option | All mandatory non-claims remain explicit in promoted governance |
| Owner | Repository Owner |
| Rationale | Prevent false completion/compliance claims |
| Scope | All rebaselined governance |
| Residual risk | None if enforced |
| Dependencies | — |
| Exit criteria | Non-claims validated (see `non_claims_validation.md`) |
| Supersession | — |

### OD-R01-10 — Change-control roles
| Field | Value |
|-------|-------|
| Date | 2026-07-26 |
| Status | ACCEPTED |
| Approved option | Document governance change-control roles (Baseline: Owner+Architecture; ADR supersession: Architecture draft + Owner approval; compliance: Compliance+Architecture) |
| Owner | Repository Owner |
| Rationale | Controlled edits after tracking |
| Scope | `CHANGE_CONTROL.md` |
| Residual risk | Role-combination requires recorded independent review |
| Dependencies | — |
| Exit criteria | Roles documented in Change Control |
| Supersession | — |

---

## Maintenance

New decisions are appended here with the same fields. Provisional recommendations from evidence packages are **not** owner decisions until recorded in this register.
