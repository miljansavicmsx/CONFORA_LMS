# Owner decisions required — R0-1A → R0-1B gate

Preserved OQ-1…OQ-7 are assumed binding for inventory honesty. The following **additional** decisions are required before executing promotion.

## OD-R01-1 — Approve Wave A authority-chain list

Approve, modify, or reject the Wave A file list in `promotion_manifest.md`.  
Record exceptions (files to exclude or reclassify).

## OD-R01-2 — Approve Wave B evidence tracking

Approve tracking of currently untracked packages:

- `2026-07-26T08-43-21-repository-rules-rebaseline/`
- `2026-07-26T09-38-03-owner-decision-package/`
- this R0-1A inventory folder

## OD-R01-3 — Path and naming choices

| Topic | Options |
|-------|---------|
| ADR directory | Keep `decisions/` vs move to `adrs/` |
| Role matrix filename | Keep long name vs `ROLE_AND_SOD_MATRIX.md` |
| `STRUCTURE.md` | Rename to `ARCHITECTURE.md` vs keep both |
| AI companions | Merge into `AI_GOVERNANCE.md` vs promote separately |

## OD-R01-4 — Wave C merges

Approve merge plans for:

- ISO 17024 dual mapping files
- Three traceability models → one matrix
- Security doc cluster → `SECURITY_ARCHITECTURE.md`
- ISO_ROLE_MODEL / ISO_SOD_ENFORCEMENT into role matrix (yes/no)

## OD-R01-5 — Wave D authoring

Authorize creation of missing: ENGINEERING_CONSTITUTION, CHANGE_CONTROL, STANDARDS_REFERENCE_POLICY, signed OWNER_DECISION_REGISTER/PACKAGE (reflecting OQ-1…OQ-7 + R0-3), ISO 21001/27001 mappings (clause refs only), task/prompt/review templates.

## OD-R01-6 — Wave E G3–G6

**Include** all G-series under `docs/architecture/` **or** leave untracked / evidence-only (recommended default).

## OD-R01-7 — Root reference markdown

Disposition of `CONFORA_Current_State_v1.md`, `CONFORA_Development_Prompts_1.md`, `CONFORA_SCHEMES_CATALOG.md`, `CONFORA_SPEC_ANALIZA.md`: promote under `docs/reference/` vs leave untracked.

## OD-R01-8 — Root binaries

Confirm **DO_NOT_TRACK** default for PDF/docx set, or specify conversion tasks.

## OD-R01-9 — Rebaseline non-claims acknowledgement

Explicit acknowledgement that R0-1B rebaseline edits will:

- not claim Nest `apps/api` complete/buildable;
- not omit ADR-001 vs `frontend-app` contradiction;
- not close OQ-3;
- not authorize production deployment;
- not track `.cursor/rules/**`.

## OD-R01-10 — Change control for Baseline after promotion

Name the roles allowed to edit Baseline / ADRs after they become tracked (feeds CHANGE_CONTROL.md).

---

**Gate:** R0-1B must not start until OD-R01-1, OD-R01-2, and OD-R01-9 are recorded as accepted (others may be deferred with explicit defer notes).
