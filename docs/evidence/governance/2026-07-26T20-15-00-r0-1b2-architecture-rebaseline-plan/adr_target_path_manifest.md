# ADR target path manifest

## Proposed move

docs/architecture/decisions/** → docs/architecture/adrs/**

**Not executed in R0-1B2A.**

## Source-to-target

| Source | Target |
|--------|--------|
| docs/architecture/decisions/README.md | docs/architecture/adrs/README.md |
| docs/architecture/decisions/ADR-001-frontend.md | docs/architecture/adrs/ADR-001-frontend.md |
| docs/architecture/decisions/ADR-002-backend.md | docs/architecture/adrs/ADR-002-backend.md |
| docs/architecture/decisions/ADR-003-database.md | docs/architecture/adrs/ADR-003-database.md |
| docs/architecture/decisions/ADR-004-vector-search.md | docs/architecture/adrs/ADR-004-vector-search.md |
| docs/architecture/decisions/ADR-005-authentication.md | docs/architecture/adrs/ADR-005-authentication.md |
| docs/architecture/decisions/ADR-006-ai-governance.md | docs/architecture/adrs/ADR-006-ai-governance.md |
| docs/architecture/decisions/ADR-007-audit-architecture.md | docs/architecture/adrs/ADR-007-audit-architecture.md |

## Link-impact analysis

| Reference class | Examples | Required update in R0-1B2 execution |
|-----------------|----------|-------------------------------------|
| Baseline | §18 docs/adr/ alias; links to decisions/ | Update to docs/architecture/adrs/ + keep alias note |
| Gap Note / strangler / registry | relative links ./decisions/ | Retarget |
| ADR_ALIGNMENT_NOTE | states decisions/ SoT | Merge/update to adrs/ |
| Cursor rules / AGENTS | may mention docs/adr | R0-2 / careful grep |
| Evidence packs | historical paths | Leave historical; add note "path superseded" |

## Duplicate numbering

None detected among ADR-001..007.

## Rollback procedure

1. If PR not merged: delete branch / revert commit adding drs/.
2. If merged: restore decisions/ paths via revert merge; re-point links; record in CHANGE_CONTROL.
3. Never leave both trees with divergent ADR bodies.
