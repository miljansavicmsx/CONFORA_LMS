# Baseline rebaseline report — R0-1B1

The Canonical Development Baseline was promoted `PROMOTE_WITH_REBASELINE`. Change is **additive**: a new **§0 Repository State Rebaseline Addendum** was inserted immediately after the metadata block and before §1. No prior section was deleted; §2's legacy source list was reconciled by a note in §0.7 rather than rewritten.

## Required statements — coverage in §0

| Required statement | §0 location | Wording summary |
|--------------------|-------------|-----------------|
| NestJS is intended canonical backend | §0.1 | "NestJS (`apps/api`) is the intended canonical backend direction" |
| `apps/api` incomplete / not confirmed buildable | §0.1 | "currently incomplete and is not confirmed buildable" |
| OQ-3 remains open | §0.1 | "OQ-3 remains OPEN" |
| FastAPI not approved as canonical | §0.1 | "FastAPI (`backend/`) is not approved as the canonical backend" |
| FastAPI tracking only via separate frozen-legacy task | §0.1 | "separate approved frozen-legacy task — not this task" |
| `frontend-app` is current operational canonical frontend | §0.2 | "current operational canonical frontend" |
| ADR-001 contradicted; supersession in R0-1B2 | §0.2 | "ADR-001 remains contradicted … deferred to R0-1B2" |
| R0-3 merged and active with conditions | §0.3 | "R0-3 deployment containment is merged and active with conditions" |
| Production deployment unauthorized | §0.3 | "Production deployment remains unauthorized" |
| Allowlist temporary deny-all | §0.3 | "temporary deny-all control" |
| Administrator bypass temporary accepted risk | §0.3 | "temporary accepted risk (RA-R03-1)" |
| Tenant isolation and audit partially verified | §0.4 | "remain partially verified" |
| R0-7 required for CI reconstruction | §0.5 | "R0-7 remains required for CI reconstruction" |
| `.cursor/rules/**` outside task, belongs to R0-2 | §0.6 | "outside this task and belongs to R0-2" |
| No implementation claim merely from a requirement | §0 preamble | "A requirement stated in this Baseline is not evidence of implementation" |

## What was NOT changed

- No change to canonical stack sections (§4) beyond the §0 reconciliation note; §4.2 still states the NestJS *intent*, now correctly framed by §0.1 as not-yet-complete.
- No ADR edited; ADR-001 supersession explicitly deferred to R0-1B2.
- No retention, role, SoD, IAL, or workflow values changed.
