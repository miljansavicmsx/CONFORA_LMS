# Proposed R0-1B2 promotion boundary

**Maximum normative changed files:** 20  
**Proposed count:** 15 (≤20)  
**Execution:** separate owner-approved R0-1B2 task — **not** this planning commit

## In scope (normative targets)

| # | Target path | Source | Action |
|---|-------------|--------|--------|
| 1 | docs/architecture/ARCHITECTURE.md | STRUCTURE.md | Rename/rebaseline |
| 2 | docs/architecture/CANONICAL_COMPONENT_REGISTRY.md | same | Rebaseline |
| 3 | docs/architecture/LEGACY_DEPRECATION_MATRIX.md | same | Rebaseline |
| 4 | docs/architecture/MULTI_TENANCY_STANDARD.md | docs/MULTI_TENANCY_STANDARD.md | Move+rebaseline |
| 5 | docs/architecture/SHARED_KERNEL_STANDARD.md | docs/SHARED_KERNEL_STANDARD.md | Move+rebaseline |
| 6 | docs/architecture/LEGACY_STRANGLER_RETIREMENT_CRITERIA.md | governance copy | Move+rebaseline |
| 7 | docs/architecture/adrs/README.md | decisions/README | Move+rebaseline |
| 8 | docs/architecture/adrs/ADR-001-frontend.md | decisions/ADR-001 | Supersession |
| 9–14 | docs/architecture/adrs/ADR-002 … ADR-007 | decisions/* | Rebaseline |
| 15 | docs/architecture/ARCHITECTURE_OPEN_QUESTIONS.md | new/optional | OQ-3/OQ-4 pointer if needed |

Optionally keep #15 out if Baseline §0 + Gap Note suffice → **14 files**.

## Explicit exclusions

- G3–G6 analysis docs as normative architecture
- Compliance mappings (R0-1B3)
- Security-document merges (R0-1B3)
- Cursor rules (R0-2)
- Application / CI / schema / migration / runtime changes
- FastAPI tracking
- Generated files / root binaries / standards PDFs
- Modification of R0-1B1 authority-chain governance docs (except future ADR cross-links that do not alter Level-1 decisions)

## Already tracked — leave as-is in R0-1B2A

- docs/governance/FRONTEND_CANONICALIZATION_GAP_NOTE.md (PROMOTE_AS_IS — already promoted)
