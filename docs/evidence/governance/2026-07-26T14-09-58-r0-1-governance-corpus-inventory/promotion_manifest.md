# Promotion manifest — R0-1A (PROPOSED)

**Status:** Awaiting owner approval. **Do not execute in R0-1A.**  
Machine-readable: `promotion_manifest.json`.

## Guardrails

- No promotion commit in this task.
- Exclude `.cursor/rules/**` (OQ-2 / R0-2).
- Do not modify application code, workflows, schemas, migrations, runtime config.
- Do not claim Nest complete/buildable; preserve OQ-4 frontend contradiction; keep OQ-3 open.
- Do not commit full copyrighted ISO/BAS PDFs.
- Do not populate production deployment allowlist or trigger deploy workflows.

## Wave A — Authority chain (recommended minimum)

Promote (with rebaseline where noted) to close C-01:

1. All current `docs/governance/*.md` (12 files) — Baseline **WITH_REBASELINE**; Gap Note **AS_IS**; Role matrix **WITH_REBASELINE** (optional rename).
2. `CANONICAL_COMPONENT_REGISTRY.md`, `LEGACY_DEPRECATION_MATRIX.md`, `STRUCTURE.md`→`ARCHITECTURE.md` — **WITH_REBASELINE**.
3. ADR-001…007 + README — move to `docs/architecture/adrs/`; ADR-001/002/005/007 **WITH_REBASELINE**.
4. `MULTI_TENANCY_STANDARD.md`, `SHARED_KERNEL_STANDARD.md` — move under architecture/.
5. `AI_GOVERNANCE_MODEL.md` → `AI_GOVERNANCE.md` — **WITH_REBASELINE** (merge companions if owner approves).

**Wave A count in JSON:** 26 items.

## Wave B — Evidence packages

Track (git add) currently untracked evidence folders:

- `docs/evidence/governance/2026-07-26T08-43-21-repository-rules-rebaseline/`
- `docs/evidence/governance/2026-07-26T09-38-03-owner-decision-package/`
- this R0-1A folder after owner accepts inventory

R0-3 evidence already tracked — do not rewrite.

## Wave C — Compliance / security merges

Execute only after owner decisions in `owner_decisions_required.md`:

- ISO 17024 mapping merge
- Traceability model merge → `STANDARDS_TRACEABILITY_MATRIX.md`
- Security docs merge → `SECURITY_ARCHITECTURE.md`
- AI companion merge (optional)
- Role/SoD companion merge (optional)

## Wave D — Author missing artefacts

Create (content, not empty stubs without owner scope):

- ENGINEERING_CONSTITUTION.md
- CHANGE_CONTROL.md
- STANDARDS_REFERENCE_POLICY.md (may promote the R0-1A policy text)
- Signed OWNER_DECISION_REGISTER.md / PACKAGE reflecting OQ-1…OQ-7
- ISO_21001_CONTROL_MAPPING.md / ISO_27001_CONTROL_MAPPING.md (clause refs only)
- TASK_TEMPLATE.md, CURSOR_IMPLEMENTATION_PROMPT_TEMPLATE.md, INDEPENDENT_REVIEW_TEMPLATE.md

## Wave E — Optional G3–G6

Default: leave untracked or evidence-only. Owner may upgrade entire G-series to `PROMOTE_AS_IS` under `docs/architecture/`.

## Owner approval checkbox (for R0-1B gate)

- [ ] Wave A approved (list exceptions)
- [ ] Wave B approved
- [ ] Wave C merge decisions recorded
- [ ] Wave D authoring scope approved
- [ ] Wave E included / excluded
- [ ] Rebaseline non-claims acknowledged (Nest incomplete; frontend-app operational; OQ-3 open; no prod deploy)
- [ ] Copyright policy acknowledged
- [ ] R0-2 still deferred for Cursor rules

## Explicit non-claims embedded in any R0-1B commit message body

Must restate: containment-only history remains; OQ-3 open; production deployment unauthorized; empty allowlist deny-all; RA-R03-1 active; R0-7 open.
