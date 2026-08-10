# Corrected Compliance Lane Separation

## governance-policy-validation

- Identifier: governance-policy-validation
- Purpose: validate governance structure and claim discipline only.
- Authority source: approved tracked governance and architecture documents at their recorded hierarchy levels.
- Included paths: exact owner-approved governance allowlist, architecture declarations, standards-reference policy, evidence schema, workflow permissions.
- Explicitly excluded paths: runtime behavior, implementation conformity, accreditation, untracked documents, copyrighted standards text, deployment.
- Proposed command: schema/reference checks, prohibited-claim scanning, workflow-permission checks, and cross-document consistency tests.
- Command verification status: PROPOSED — NOT IMPLEMENTATION VERIFIED
- Required tracked inputs: approved document allowlist, validator source, tests, negative fixtures, and authority metadata.
- Current status: PLANNED_NOT_IMPLEMENTED.
- Blockers: OD-R07E-5 and exact validator/path approval.
- Permitted outcomes: PASS_POLICY_SCOPE_ONLY, FAIL_POLICY_SCOPE, BLOCKED_MISSING_TRACKED_AUTHORITY.
- Failure semantics: missing required policy input blocks or fails; a policy pass cannot alter implementation status.
- Prohibited claims: ISO compliant, ISO certified, compliance passed, implementation conformity, production readiness.
- Evidence requirements: exact SHA, allowlist, validator identity, command, results, negative fixtures, non-claims.
- Exit criteria: deterministic clean-clone validation with approved naming and policy-only result labels.
- Consuming work package: R0-7E-C1.
- Owner dependency: OD-R07E-5 and OD-R07E-8.

## implementation-compliance-validation

- Identifier: implementation-compliance-validation
- Purpose: test a specifically approved implemented control without broad conformity inference.
- Authority source: complete tracked implementation, dependencies, executable tests, approved control mapping, and exact-commit evidence.
- Included paths: only the exact implementation and tests required by the approved control scope.
- Explicitly excluded paths: policy-only proof, missing or local-only source, inferred database/backend authority, accreditation, production deployment.
- Proposed command: control-specific deterministic build, test, negative-test, tenant/security, and evidence-validation commands.
- Command verification status: PROPOSED — NOT IMPLEMENTATION VERIFIED
- Required tracked inputs: implementation graph, executable tests, deterministic dependencies, database/backend authority when required, and approved scope.
- Database dependency status: packages/database/** is absent; dependent controls are BLOCKED_MISSING_TRACKED_AUTHORITY.
- Backend dependency status: apps/api is incomplete and not confirmed buildable; dependent controls are BLOCKED_MISSING_TRACKED_AUTHORITY.
- Current status: BLOCKED_MISSING_TRACKED_AUTHORITY.
- Blockers: R0-7D open, database absent, backend incomplete, and frontend auth authority gap.
- Permitted outcomes: PASS, FAIL, BLOCKED_MISSING_TRACKED_AUTHORITY, NOT_APPLICABLE_WITH_APPROVED_SCOPE.
- Failure semantics: blocked must remain blocked; skipped-success is prohibited; N/A requires owner-approved scope and is not PASS.
- Prohibited claims: ISO compliant, ISO certified, unqualified compliance passed, document-presence implementation success, production readiness.
- Evidence requirements: exact SHA, owner-approved scope, tracked-input manifest, commands, logs, negative tests, and residual limitations.
- Exit criteria: complete tracked authority and deterministic tests independently prove only the named control at the exact commit.
- Consuming work package: R0-7E-C1 and separately approved control packages.
- Owner dependency: OD-R07E-1, OD-R07E-3, OD-R07E-5, and applicable architecture decisions.

Copyrighted standards text may not be reproduced beyond authorized identifiers,
clause references, and licensed use.

IMPLEMENTATION_COMPLIANCE = NOT_CLAIMED
ISO_CONFORMITY = NOT_CLAIMED
