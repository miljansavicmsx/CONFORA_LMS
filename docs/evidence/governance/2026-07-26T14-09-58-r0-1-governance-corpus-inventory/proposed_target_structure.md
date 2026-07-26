# Proposed target structure — R0-1A

Refined from the task brief against **actual repository evidence**.

## Adopted tree (proposed)

```text
docs/
  governance/
    CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md    # from existing (rebaseline)
    ENGINEERING_CONSTITUTION.md                  # MISSING — author R0-1B
    OWNER_DECISION_REGISTER.md                   # from PROPOSED_* after signing
    OWNER_DECISION_PACKAGE.md                    # from PROPOSED_* after signing
    REPOSITORY_REMEDIATION_SEQUENCE.md           # from PROPOSED_*
    GOVERNANCE_REBASELINE_EXIT_CRITERIA.md       # from PROPOSED_*
    CHANGE_CONTROL.md                            # MISSING — author R0-1B
    AI_GOVERNANCE.md                             # from AI_GOVERNANCE_MODEL (+ merges)
    ROLE_AND_SOD_MATRIX.md                       # rename from CONFORA_ROLE_FUNCTION_PERMISSION_MATRIX
    STANDARDS_REFERENCE_POLICY.md                # MISSING — seed from this evidence package
    GOVERNANCE_HIERARCHY.md
    FRONTEND_CANONICALIZATION_GAP_NOTE.md        # preserve OQ-4 contradiction
    ADR_ALIGNMENT_NOTE.md
    CONFLICT_ANALYSIS_REPORT.md
    GOVERNANCE_INTEGRATION_REPORT.md
    TECH_DEBT.md
    LEGAL_PRIVACY_PRECONDITIONS.md
    CLOUD_STAGING_PRECONDITIONS.md
    LOCAL_RELEASE_CANDIDATE_LOCK.md

  architecture/
    ARCHITECTURE.md                              # from STRUCTURE.md (+ expand)
    CANONICAL_COMPONENT_REGISTRY.md              # rebaseline OQ-3/OQ-4 notes
    LEGACY_DEPRECATION_MATRIX.md                 # rebaseline OQ-3
    LEGACY_STRANGLER_RETIREMENT_CRITERIA.md      # move from governance/
    MULTI_TENANCY_STANDARD.md                    # move from docs/
    SHARED_KERNEL_STANDARD.md                    # move from docs/
    SECURITY_ARCHITECTURE.md                     # MISSING filename — merge from SECURITY*.md
    adrs/                                        # move from decisions/
      README.md
      ADR-001-frontend.md                        # rebaseline OQ-4
      ADR-002-backend.md                         # rebaseline OQ-3
      ADR-003-database.md
      ADR-004-vector-search.md
      ADR-005-authentication.md                  # rebaseline OQ-5
      ADR-006-ai-governance.md
      ADR-007-audit-architecture.md              # rebaseline OQ-7
    # Optional Tier E (owner upgrade):
    # G3_*.md G4_*.md G5_*.md G6_*.md

  compliance/
    STANDARDS_TRACEABILITY_MATRIX.md             # merge CLAUSE/COMPLIANCE/GOVERNANCE_TRACEABILITY
    ISO_17024_CONTROL_MAPPING.md                 # merge ISO_17024_MAPPING + iso17024-mapping
    ISO_21001_CONTROL_MAPPING.md                 # MISSING — author (clause refs only)
    ISO_27001_CONTROL_MAPPING.md                 # MISSING — author (clause refs only)
    ISO17024_PRISMA_MIGRATION_NOTES.md
    ISO17024_SEED_ADJUSTMENTS.md

  tasks/
    TASK_TEMPLATE.md                             # MISSING — author R0-1B

  prompts/
    CURSOR_IMPLEMENTATION_PROMPT_TEMPLATE.md     # MISSING — author R0-1B

  reviews/
    INDEPENDENT_REVIEW_TEMPLATE.md               # MISSING — seed from R0-3 INDEPENDENT_REVIEW.md

  evidence/governance/                           # already used; track missing packages
    2026-07-26T08-43-21-repository-rules-rebaseline/
    2026-07-26T09-38-03-owner-decision-package/
    2026-07-26T10-05-37-r0-3-deploy-containment/ # already tracked
    2026-07-26T14-09-58-r0-1-governance-corpus-inventory/
```

## Explicitly out of R0-1 tree

```text
.cursor/rules/**          # OQ-2 → R0-2 only
backend/**                # OQ-3 — not approved for track-as-frozen in this task
*.docx / standards PDFs   # DO_NOT_TRACK without licence (see copyright findings)
```

## Path-move notes

| From | To | Why |
|------|----|-----|
| `docs/architecture/decisions/` | `docs/architecture/adrs/` | Match proposed structure; leave redirect note in old path only if owner wants transitional stub (default: move in one commit) |
| `docs/MULTI_TENANCY_STANDARD.md` | `docs/architecture/` | Architecture standard |
| `docs/SHARED_KERNEL_STANDARD.md` | `docs/architecture/` | Architecture standard |
| `docs/AI_GOVERNANCE_MODEL.md` | `docs/governance/AI_GOVERNANCE.md` | Governance SoR name |
| `STRUCTURE.md` | `ARCHITECTURE.md` | Broader architecture entrypoint |

## Differences from the brief’s sketch

1. Retained several existing governance reports (conflict/integration/preconditions/tech debt/gap note) — not in the brief’s minimal list but required to preserve OQ-4 and auditability.
2. Added compliance implementation notes (Prisma/seed) under `compliance/`.
3. Marked G3–G6 as **optional** Tier E, not mandatory Wave A.
4. Recorded missing files explicitly rather than inventing content in R0-1A.
