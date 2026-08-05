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

The current states below are governance classifications, not newly executed CI
results.

### 1. Canonical tracked workspace

- Identifier: `canonical-tracked-workspace`.
- Authority: root workspace manifests, lock authority, and tracked packages with
  complete executable inputs.
- Inclusions: root manifests and an explicit allowlist of complete tracked
  workspace packages.
- Exclusions: `frontend-app/**`, `backend/**`, absent
  `packages/database/**`, unavailable apps, and deployment paths.
- Permitted results: `PASS`, `FAIL`, or
  `BLOCKED_MISSING_TRACKED_AUTHORITY` per declared target.
- Blocked-state semantics: an incomplete target is blocked and remains visible;
  it cannot be filtered into pass.
- Evidence expectations: exact commit, package allowlist, frozen-install
  authority, commands, exit codes, logs, and exclusions.
- Prohibited claims: repository-wide, backend, database, ISO, or production
  health.
- Exit conditions: deterministic clean-clone execution for every declared
  package with no hidden filter.
- Owner-decision dependency: OD-R07E-1, OD-R07E-2, and OD-R07E-8.

### 2. Transitional frontend

- Identifier: `transitional-frontend-app`.
- Authority: tracked `frontend-app/**` plus explicitly approved tracked
  dependencies.
- Inclusions: frontend manifest, source, configuration, tests, and approved
  tracked file dependencies.
- Exclusions: `apps/web/**`, `apps/admin/**`, `backend/**`, missing
  authentication authority, production deployment, and local-only files.
- Permitted results: focused tests may pass or fail; deterministic install,
  build, preview, and accessibility remain blocked until R0-7D closure.
- Blocked-state semantics: unavailable lock or tool authority is blocked, never
  skipped-success.
- Evidence expectations: exact commit, clean-clone dependency graph, commands,
  focused/full distinction, logs, and route scope.
- Prohibited claims: strategic canonical completion, clean-clone build,
  accessibility conformity, or production readiness.
- Exit conditions: approved R0-7D closure establishes deterministic install,
  build, preview, tests, and accessibility execution.
- Owner-decision dependency: OD-R07E-2 and OD-R07E-4.

### 3. Tracked legacy

- Identifier: `legacy-tracked`.
- Authority: tracked Git legacy paths explicitly approved for a future
  frozen-legacy task.
- Inclusions: only owner-approved legacy source, configuration, and tests that
  exist in the tracked tree.
- Exclusions: local-only `backend/**`, canonical recovery, new features, and
  deployment.
- Permitted results: `UNAVAILABLE`, or scoped `PASS`/`FAIL` only after
  separate approval.
- Blocked-state semantics: absent tracked legacy source remains
  `BLOCKED_MISSING_TRACKED_AUTHORITY`.
- Evidence expectations: Git inventory, approved allowlist, commands, logs, and
  proof that no local-only input was used.
- Prohibited claims: FastAPI canonicality, parity, implementation health, or
  production readiness.
- Exit conditions: separately approved frozen-legacy package with tracked
  authority and independent review.
- Owner-decision dependency: a separate OQ-3 and frozen-legacy owner decision.

### 4. Missing authority

- Identifier: `missing-authority`.
- Authority: tracked Git absence or incompleteness proof and the governing
  tracked references.
- Inclusions: absent `packages/database/**`, accessibility tooling, F4
  validator, incomplete `apps/api`, frontend authentication gaps, and absent
  `docs/governance/TECH_DEBT.md`.
- Exclusions: local-only substitutes, inferred source, generated replacement
  packages, and deleted checks.
- Permitted results: `BLOCKED_MISSING_TRACKED_AUTHORITY`, or `FAIL` when
  absence handling is dishonest.
- Blocked-state semantics: missing required authority cannot pass or disappear
  through filtering.
- Evidence expectations: exact commit, tracked file counts, blocker code,
  affected lane, and owner-decision reference.
- Prohibited claims: database health, accessibility conformity, backend
  completeness, implementation compliance, or ISO conformity.
- Exit conditions: each dependency is separately recovered and merged, or the
  owner explicitly retains its blocked state.
- Owner-decision dependency: OD-R07E-2, OD-R07E-3, OD-R07E-6, and OD-R07E-7.

### 5. Governance-policy validation

- Identifier: `governance-policy-validation`.
- Authority: approved tracked governance and architecture documents at their
  recorded hierarchy levels.
- Inclusions: approved policy allowlist, architecture declarations, reference
  integrity, evidence schemas, claim controls, and workflow-governance rules.
- Exclusions: runtime behavior, implementation conformity, accreditation,
  untracked documents, copyrighted standards text, and deployment.
- Permitted results: `PASS_POLICY_SCOPE_ONLY`, `FAIL_POLICY_SCOPE`, or
  `BLOCKED_MISSING_TRACKED_AUTHORITY`.
- Blocked-state semantics: a missing required policy input blocks or fails as
  specified; policy pass never promotes implementation state.
- Evidence expectations: exact commit, document allowlist, validator identity,
  commands, results, negative fixtures, and non-claims.
- Prohibited claims: ISO compliant, ISO certified, implementation compliance
  passed, or production ready.
- Exit conditions: deterministic clean-clone validation with policy-only result
  labels and independent review.
- Owner-decision dependency: OD-R07E-1, OD-R07E-5, and OD-R07E-8.

### 6. Implementation-compliance validation

- Identifier: `implementation-compliance-validation`.
- Authority: complete tracked implementation, dependencies, executable tests,
  approved control mapping, and exact-commit evidence.
- Inclusions: only the exact implementation and tests required by an
  owner-approved control scope.
- Exclusions: document-only proof, absent or local-only source, inferred
  database/backend authority, accreditation, and deployment.
- Permitted results: `PASS`, `FAIL`,
  `BLOCKED_MISSING_TRACKED_AUTHORITY`, or
  `NOT_APPLICABLE_WITH_APPROVED_SCOPE`.
- Blocked-state semantics: blocked cannot become skipped-success; N/A requires
  approved scope and is not pass.
- Evidence expectations: exact commit, approved scope, tracked-input manifest,
  commands, logs, negative tests, and residual limitations.
- Prohibited claims: unqualified ISO compliant, ISO certified, compliance
  passed, repository-wide conformity, or production readiness.
- Exit conditions: complete tracked authority and deterministic tests
  independently prove only the named control.
- Owner-decision dependency: OD-R07E-1, OD-R07E-3, OD-R07E-5, and applicable
  architecture decisions.

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

`CI_LANE_COUNT = 6`

`FALSE_GREEN_PATH_FILTERING = PROHIBITED`
