# Duplicate and supersession analysis — R0-1A

## Confirmed duplicate / overlap clusters

### 1. Multi-tenancy

| Artefact | Role | Recommendation |
|----------|------|----------------|
| `docs/MULTI_TENANCY_STANDARD.md` | Full standard (~17KB) | **Authoritative** → promote to `docs/architecture/MULTI_TENANCY_STANDARD.md` |
| `docs/MULTI_TENANT.md` | Stub (~0.5KB) | **MERGE_WITH_OTHER** then drop |

### 2. Legacy deprecation

| Artefact | Role | Recommendation |
|----------|------|----------------|
| `docs/architecture/LEGACY_DEPRECATION_MATRIX.md` | Matrix SoR | **Authoritative** (with OQ-3 annotations) |
| `docs/LEGACY_DEPRECATION_PLAN.md` | Longer plan | **MERGE** unique phasing notes into matrix, then SUPERSEDE or retain as historical appendix |
| `docs/governance/LEGACY_STRANGLER_RETIREMENT_CRITERIA.md` | Retirement gates | Keep separate; move under architecture/ |

### 3. ISO/IEC 17024 mappings

| Artefact | Recommendation |
|----------|----------------|
| `docs/ISO_17024_MAPPING.md` | Merge target → `docs/compliance/ISO_17024_CONTROL_MAPPING.md` |
| `docs/iso17024-mapping.md` | **SUPERSEDE** after merge |
| `docs/ISO17024_PRISMA_MIGRATION_NOTES.md` | Keep as implementation notes |
| `docs/ISO17024_SEED_ADJUSTMENTS.md` | Keep as implementation notes |

### 4. Role / SoD

| Artefact | Recommendation |
|----------|----------------|
| `docs/governance/CONFORA_ROLE_FUNCTION_PERMISSION_MATRIX.md` | Master matrix → optional rename `ROLE_AND_SOD_MATRIX.md` |
| `docs/ISO_ROLE_MODEL.md` | MERGE unique content into master matrix |
| `docs/ISO_SOD_ENFORCEMENT.md` | MERGE unique content into master matrix |

### 5. Traceability models

| Artefact | Recommendation |
|----------|----------------|
| `docs/CLAUSE_TRACEABILITY_MODEL.md` | Seed for `STANDARDS_TRACEABILITY_MATRIX.md` |
| `docs/COMPLIANCE_TRACEABILITY_MODEL.md` | MERGE |
| `docs/GOVERNANCE_TRACEABILITY_MODEL.md` | MERGE |

No file named `STANDARDS_TRACEABILITY_MATRIX.md` exists today.

### 6. AI governance

| Artefact | Recommendation |
|----------|----------------|
| `docs/AI_GOVERNANCE_MODEL.md` | Promote as `docs/governance/AI_GOVERNANCE.md` |
| `docs/AI_CONFIDENCE_STANDARD.md` | MERGE into AI_GOVERNANCE unless owner keeps separate |
| `docs/AI_GUIDANCE_PRINCIPLES.md` | MERGE |
| `docs/AI_RECOMMENDATION_TAXONOMY.md` | MERGE |
| `docs/architecture/decisions/ADR-006-ai-governance.md` | Keep as ADR |
| `Confora Ai Development Governance Framework V1.pdf` | **DO_NOT_TRACK** as SoR; extract if needed |

### 7. Security docs

| Artefact | Recommendation |
|----------|----------------|
| `docs/SECURITY.md` | Seed for `SECURITY_ARCHITECTURE.md` |
| `docs/SECURITY_HARDENING.md`, `SECURITY_CLOSURE.md`, `SECURITY_HARDENING_OUTPUT.md`, `PRODUCTION_SECURITY_CHECKLIST.md`, `FRONTEND_SECURITY_AND_TRUST_REVIEW.md` | MERGE unique controls into architecture doc; retain checklists as appendices or evidence |

No `SECURITY_ARCHITECTURE.md` filename exists today.

### 8. Frontend gap note duplicates

| Artefact | Recommendation |
|----------|----------------|
| `docs/governance/FRONTEND_CANONICALIZATION_GAP_NOTE.md` | Promote (OQ-4) |
| `docs/evidence/f6-local-stabilization/.../FRONTEND_CANONICALIZATION_GAP_NOTE.md` | Evidence copy — retain in evidence tree |

### 9. ADR alignment duplicates

| Artefact | Recommendation |
|----------|----------------|
| `docs/governance/ADR_ALIGNMENT_NOTE.md` | Promote |
| f6-local-stabilization evidence copy | Evidence only |

### 10. Owner decision proposals vs signed register

| Artefact | Recommendation |
|----------|----------------|
| `PROPOSED_OWNER_DECISION_*.md` (evidence package) | Rebaseline into signed `docs/governance/OWNER_DECISION_*.md` in R0-1B |
| R0-3 `OWNER_DECISIONS.md` | Remain in R0-3 evidence (OD-R03-*); cross-link from register |

## Supersession rules for R0-1B

1. Never delete untracked sources in the same commit as promotion without an explicit owner approve-delete list.
2. Prefer add-tracked + mark-superseded note over destructive deletes.
3. Evidence copies under `docs/evidence/**` are not superseded by promoting a governance twin — both may coexist (evidence append-only posture).
