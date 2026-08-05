# CONFORA R0-7E CI Lane Policy

**Document ID:** CON-GOV-R07E-CI-001
Status: PROPOSED NORMATIVE REPOSITORY PROMOTION — EFFECTIVE ONLY AFTER REVIEWED MERGE
**Owner:** CONFORA Architecture & Governance
**Authority level:** Governance Hierarchy Level 3

## Effectiveness

This policy becomes effective only after independent review and a separately
authorized true merge into the authoritative integration branch. It authorizes
no workflow or validator change.

## Six governed lanes

| Lane | Identifier | Authority boundary | Current governance state |
|------|------------|--------------------|--------------------------|
| Canonical tracked workspace | `canonical-tracked-workspace` | Root workspace authority and tracked packages with complete executable inputs | `PARTIAL_BASELINE_FAILURE` |
| Transitional frontend | `transitional-frontend-app` | Tracked `frontend-app/**` plus explicitly approved tracked dependencies | `BLOCKED_R0_7D_OPEN` |
| Tracked legacy | `legacy-tracked` | Only legacy paths that are tracked and separately owner-approved | `UNAVAILABLE_NO_TRACKED_LEGACY_SOURCE` |
| Missing authority | `missing-authority` | Required but absent or incomplete tracked inputs | `BLOCKED_MISSING_TRACKED_AUTHORITY` |
| Governance-policy validation | `governance-policy-validation` | Approved tracked governance and architecture policy | `PLANNED_NOT_IMPLEMENTED` |
| Implementation-compliance validation | `implementation-compliance-validation` | Complete tracked implementation, dependencies, tests, and approved control mapping | `BLOCKED_MISSING_TRACKED_AUTHORITY` |

The current states are governance classifications, not newly executed CI
results. `frontend-app` remains transitional and is not declared
production-ready.

## Mandatory semantics

1. Blocked is not pass.
2. Missing tracked authority remains visible and cannot be converted to pass by
   filters, skipped-success behavior, conditional omission, or an empty matrix.
3. Local-only files cannot satisfy a governed lane.
4. A failing declared command produces `FAIL`.
5. `NOT_APPLICABLE_WITH_APPROVED_SCOPE` requires an owner-approved exact scope
   and is not pass.
6. Governance-policy validation cannot alter or promote an
   implementation-compliance result.
7. Every executable result must identify the exact commit, tracked input
   manifest, command, exit code, exclusions, and evidence.

## Known authority boundaries

- R0-7D remains open and implementation-blocking for transitional frontend
  install, build, preview, and accessibility execution.
- `packages/database/**` authority is absent and deferred under OD-R07E-3.
- F4 validation remains a separate focused prerequisite.
- `docs/governance/TECH_DEBT.md` remains a separate governance-restoration gap.
- Tracked legacy reporting cannot reconstruct or promote local-only
  `backend/**` content.

No lane policy in this document authorizes implementation or claims repository
health.
