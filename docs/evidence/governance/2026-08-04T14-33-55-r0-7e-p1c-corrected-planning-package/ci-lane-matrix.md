# Corrected CI Lane Matrix

Global semantics: absent paths remain visible; missing paths cannot become
silent exclusions; BLOCKED is not PASS; every result identifies its authority,
scope, exact commit, and exclusions.

## Lane 1 - Canonical tracked workspace

- Identifier: canonical-tracked-workspace
- Purpose: deterministic quality checks for declared tracked workspace packages.
- Authority source: root package.json, pnpm-workspace.yaml, pnpm-lock.yaml, tracked package manifests and source.
- Included paths: root manifests and allowlisted tracked packages with complete executable inputs.
- Explicitly excluded paths: frontend-app/**; backend/**; absent packages/database/**; absent apps/web/**, apps/admin/**, apps/worker/**; deployment paths.
- Proposed command or class: pnpm install --frozen-lockfile, then allowlisted lint, typecheck, and unit-test scripts.
- Command verification status: PROPOSED — NOT IMPLEMENTATION VERIFIED
- Required tracked inputs: complete package manifest, source, configuration, tests, workspace declaration, and lockfile resolution.
- Current status: PARTIAL_BASELINE_FAILURE.
- Blockers: packages/ai-prompts lint finding and incomplete apps/api graph; unavailable packages must not enter the allowlist.
- Permitted outcomes: PASS, FAIL, or BLOCKED_MISSING_TRACKED_AUTHORITY per declared target.
- Failure semantics: command failure is FAIL; missing required input is BLOCKED, not skipped-success.
- Prohibited claims: complete repository, backend, database, ISO, or production health.
- Evidence requirements: exact SHA, package allowlist, commands, exit codes, logs, exclusions, and clean-tree proof.
- Exit criteria: clean-clone install and every declared package check produce deterministic results with no hidden filter.
- Consuming work package: R0-7E-Q1 and R0-7E-Q2.
- Owner decision dependency: OD-R07E-1, OD-R07E-2, and OD-R07E-8.

## Lane 2 - Transitional frontend-app

- Identifier: transitional-frontend-app
- Purpose: honest standalone validation of the operational frontend bridge.
- Authority source: tracked frontend-app/** plus explicitly declared tracked file dependencies.
- Included paths: frontend-app/package.json, frontend-app source/config/tests, and approved tracked file dependencies.
- Explicitly excluded paths: apps/web/**, apps/admin/**, backend/**, missing auth authority, production deployment, and untracked local files.
- Proposed command or class: frozen standalone install, lint:all, unit tests, build, preview, and approved accessibility checks.
- Command verification status: PROPOSED — NOT IMPLEMENTATION VERIFIED
- Required tracked inputs: frontend dependency manifest, approved lock authority, local file dependencies, build config, tests, and accessibility entrypoints.
- Current status: BLOCKED_R0_7D_OPEN.
- Blockers: no tracked standalone lockfile; deterministic clean-clone build and accessibility authority are unverified.
- Permitted outcomes: focused test PASS/FAIL; install/build/a11y BLOCKED until R0-7D closure.
- Failure semantics: unavailable lock or tool is BLOCKED_MISSING_TRACKED_AUTHORITY, never PASS.
- Prohibited claims: fully strategic canonical frontend, clean-clone build, accessibility conformity, production readiness.
- Evidence requirements: clean-clone dependency graph, exact commands, focused/full result distinction, logs, and route scope.
- Exit criteria: approved R0-7D closure establishes deterministic install, build, preview, tests, and a11y execution.
- Consuming work package: R0-7D-CLOSURE, then R0-7E-Q2.
- Owner decision dependency: OD-R07E-2 and OD-R07E-4.

## Lane 3 - Legacy tracked lane

- Identifier: legacy-tracked
- Purpose: report tracked legacy authority without reconstruction or canonical promotion.
- Authority source: tracked Git tree only; backend/** currently has zero tracked files.
- Included paths: only legacy paths explicitly tracked and owner-approved for a future frozen-legacy task.
- Explicitly excluded paths: all local-only backend/** content, canonical recovery work, new features, and deployment.
- Proposed command or class: tracked-path inventory and approved frozen-legacy checks only after scope authorization.
- Command verification status: PROPOSED — NOT IMPLEMENTATION VERIFIED
- Required tracked inputs: approved path allowlist, tracked source/config/tests, frozen-legacy owner decision.
- Current status: UNAVAILABLE_NO_TRACKED_LEGACY_SOURCE.
- Blockers: backend/** absent; no authorization to reconstruct or promote it.
- Permitted outcomes: UNAVAILABLE or scoped PASS/FAIL only after separate approval.
- Failure semantics: absent source remains visible as BLOCKED_MISSING_TRACKED_AUTHORITY.
- Prohibited claims: FastAPI canonicality, legacy implementation health, parity, or production readiness.
- Evidence requirements: Git inventory, owner scope, commands, logs, and proof no local-only input was used.
- Exit criteria: separately approved frozen-legacy package with tracked authority and independent review.
- Consuming work package: none in R0-7E; separate future frozen-legacy task.
- Owner decision dependency: separate OQ-3/frozen-legacy owner decision.

## Lane 4 - Missing-authority lane

- Identifier: missing-authority
- Purpose: expose required but absent or incomplete authority as a first-class blocked result.
- Authority source: Git absence/incompleteness proof plus governing tracked references.
- Included paths: packages/database/**, tools/a11y/**, scripts/a11y/**, F4 validator, incomplete apps/api modules, missing frontend auth authority, missing TECH_DEBT.md.
- Explicitly excluded paths: all local-only substitutes, inferred source, generated replacement packages, and deleted checks.
- Proposed command or class: Git inventory, required-input assertion, and negative missing-path tests.
- Command verification status: PROPOSED — NOT IMPLEMENTATION VERIFIED
- Required tracked inputs: authoritative path list, expected ownership, and explicit blocker codes.
- Current status: BLOCKED_MISSING_TRACKED_AUTHORITY.
- Blockers: listed paths are absent or incomplete at the integration SHA.
- Permitted outcomes: BLOCKED_MISSING_TRACKED_AUTHORITY or FAIL when absence handling is dishonest.
- Failure semantics: missing required path fails the availability assertion; it cannot be filtered into PASS.
- Prohibited claims: passing implementation lane, database health, accessibility conformity, backend completeness, ISO conformity.
- Evidence requirements: exact SHA, zero/partial file counts, blocker code, affected lanes, and owner-decision reference.
- Exit criteria: each dependency is separately recovered and merged, or owner approves continued explicit blocked status.
- Consuming work package: R0-7E-Q2 and R0-7E-C1.
- Owner decision dependency: OD-R07E-2, OD-R07E-3, OD-R07E-6, and OD-R07E-7.

## Lane 5 - Governance-policy validation

- Identifier: governance-policy-validation
- Purpose: validate tracked policy structure, references, claim controls, and workflow governance without implementation inference.
- Authority source: applicable tracked Levels 1-6 governance and architecture documents.
- Included paths: approved governance corpus, architecture declarations, evidence schemas, and workflow configuration rules.
- Explicitly excluded paths: runtime conformity, product behavior, untracked documents, standards text, deployment, and accreditation claims.
- Proposed command or class: document-presence, schema, reference, prohibited-claim, permission, and consistency validators.
- Command verification status: PROPOSED — NOT IMPLEMENTATION VERIFIED
- Required tracked inputs: exact approved document allowlist, validator source/tests, expected authority levels, and negative fixtures.
- Current status: PLANNED_NOT_IMPLEMENTED.
- Blockers: OD-R07E-5 naming adoption and approved validator allowlist are absent.
- Permitted outcomes: PASS_POLICY_SCOPE_ONLY, FAIL_POLICY_SCOPE, or BLOCKED_MISSING_TRACKED_AUTHORITY.
- Failure semantics: missing required policy is BLOCKED/FAIL as specified; policy PASS never promotes implementation state.
- Prohibited claims: ISO compliant, ISO certified, implementation compliance passed, or production ready.
- Evidence requirements: exact SHA, document allowlist, validator version, results, negative fixtures, and non-claims.
- Exit criteria: approved names and validators produce deterministic clean-clone results with explicit policy-only labeling.
- Consuming work package: R0-7E-C1.
- Owner decision dependency: OD-R07E-1, OD-R07E-5, and OD-R07E-8.

## Lane 6 - Implementation-compliance validation

- Identifier: implementation-compliance-validation
- Purpose: validate only specifically scoped implemented controls using complete tracked implementation and executable tests.
- Authority source: tracked implementation, dependencies, tests, approved control mapping, and exact-commit evidence.
- Included paths: only control-specific paths explicitly approved and complete for the tested claim.
- Explicitly excluded paths: document-only proof, absent database/backend/frontend authority, local-only source, broad ISO or accreditation claims.
- Proposed command or class: approved control-specific build, test, negative-test, tenant/security, and evidence checks.
- Command verification status: PROPOSED — NOT IMPLEMENTATION VERIFIED
- Required tracked inputs: complete implementation graph, database/backend dependencies where applicable, deterministic install, tests, and control mapping.
- Current status: BLOCKED_MISSING_TRACKED_AUTHORITY.
- Blockers: packages/database absent, apps/api incomplete, frontend auth authority missing, and R0-7D open.
- Permitted outcomes: PASS, FAIL, BLOCKED_MISSING_TRACKED_AUTHORITY, or NOT_APPLICABLE_WITH_APPROVED_SCOPE.
- Failure semantics: blocked cannot become skipped-success; N/A requires an approved scope record and is not PASS.
- Prohibited claims: ISO compliant, ISO certified, unqualified compliance passed, repository-wide conformity, or production readiness.
- Evidence requirements: exact SHA, scope decision, tracked-input manifest, commands, logs, negative tests, and residual limitations.
- Exit criteria: all scope-required authority is tracked and independently reviewed; tests execute deterministically and claims remain bounded.
- Consuming work package: R0-7E-C1 and later control-specific packages.
- Owner decision dependency: OD-R07E-1, OD-R07E-3, OD-R07E-5, and applicable architecture decisions.

ci_lane_count = 6
lane_missing_required_field_count = 0
