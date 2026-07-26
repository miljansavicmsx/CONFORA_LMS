# Owner decisions required before R0-1B2 execution

| ID | Question | Options | Recommendation |
|----|----------|---------|----------------|
| OD-R01B2-1 | Approve proposed ≤15-file R0-1B2 normative scope? | Approve / Amend / Defer | Approve with optional drop of ARCHITECTURE_OPEN_QUESTIONS if redundant |
| OD-R01B2-2 | ADR-001 instrument? | Supersede with new ADR / Amend in place / Defer | **Supersede** (retain Next target; operational frontend-app) |
| OD-R01B2-3 | Move decisions/ → drs/? | Move / Keep decisions/ / Defer | **Move** with link retarget + rollback plan |
| OD-R01B2-4 | Rename STRUCTURE.md → ARCHITECTURE.md? | Rename / Keep STRUCTURE / Defer | **Rename** as architecture root |
| OD-R01B2-5 | Messaging ADR alignment? | Amend ADR-002 to RabbitMQ MVP / New ADR-009 / Defer | **Amend ADR-002** (+ ADR-007 fan-out note) |
| OD-R01B2-6 | OQ-3 recovery option selection? | A recover / B rebuild / C dual-stack+frozen FastAPI track / D hybrid / Defer | **Defer** — list options only; do not decide in R0-1B2 docs promotion |
| OD-R01B2-7 | G3–G6 + Architecture Bible handling? | Evidence-only / Promote subset / Discard | **Evidence-only / DO_NOT_TRACK** for Bible in this wave |
| OD-R01B2-8 | Promote strangler criteria under docs/architecture/? | Move / Keep under governance untracked / Defer | **Move + rebaseline** |
| OD-R01B2-9 | Registry legend expansion? | Approve expanded classes / Keep 4-class / Defer | **Approve expanded classes** |

## Non-decisions (explicit)

- No production deployment authorization
- No FastAPI canonical approval
- No OQ-3/4/7 closure
- No CI repair (R0-7)
