# Corrected Work-Package Sequence

No future package below is implicitly authorized. Where exact paths are not yet
approved, the specification states: PATH ALLOWLIST REQUIRES OWNER DECISION
BEFORE IMPLEMENTATION.

## R0-7E-P1C

- Objective: publish this corrected standalone planning proposal.
- Authorized paths: docs/evidence/governance/2026-08-04T14-33-55-r0-7e-p1c-corrected-planning-package/** only.
- Prohibited paths: every pre-existing file, source, workflow, manifest, lockfile, setting, and deployment path.
- Entry criteria: exact bf33e4a planning head; exact f5e48ddb integration; clean tree; no PR; zero deployment.
- Dependencies: P2 NO-GO and P1C owner authorization.
- Implementation boundary: documentation/evidence correction only.
- Required commands/tests: identity, JSON, path, field-count, contradiction, Git scope, and deployment checks.
- Evidence files: all 24 files in this package.
- Package-specific stop conditions: identity drift, original package mutation, path outside folder, or failed structural validation.
- Rollback method: reviewed revert of the single correction commit; no history rewrite.
- Exit criteria: one validated commit, one normal push, clean tree, original tree unchanged.
- Independent-review gate: new independent P2-style re-review required.
- Owner-decision gate: no OD adoption in P1C.
- Merge-readiness gate: not authorized; later separate decision.
- Merge authorization state: false.
- Deployment authorization state: false.
- Successor package: independent P1C re-review, then owner decisions only if GO.

## R0-7D-CLOSURE

- Objective: establish deterministic frontend and accessibility authority forward-only.
- Authorized paths: PATH ALLOWLIST REQUIRES OWNER DECISION BEFORE IMPLEMENTATION; expected frontend lock/dependency and approved accessibility entrypoint/test paths only.
- Prohibited paths: backend/**, database reconstruction, appeals, complaint feature expansion, deployment, settings, rejected-branch wholesale promotion.
- Entry criteria: OD-R07E-4 adoption, approved integration SHA, exact path allowlist, clean clone.
- Dependencies: P1C independent GO and OD-R07E-4.
- Implementation boundary: frontend dependency/build/preview/a11y prerequisite only.
- Required commands/tests: frozen install, build, preview, unit/focused tests, a11y negative and route-scope tests.
- Evidence files: separate implementation logs and new timestamped evidence package.
- Package-specific stop conditions: untracked dependency, nondeterministic install, missing route/tool, scope expansion, deployment need.
- Rollback method: reviewed revert to prior integration tree and lock authority.
- Exit criteria: merged, independently reproduced clean-clone closure.
- Independent-review gate: accessibility, supply-chain, and scope review required.
- Owner-decision gate: OD-R07E-4 exact authorization.
- Merge-readiness gate: separate owner readiness after review.
- Merge authorization state: false until separate exact authorization.
- Deployment authorization state: false.
- Successor package: R0-7E-DB-DECISION.

## R0-7E-DB-DECISION

- Objective: select tracked recovery or explicit blocked database lane.
- Authorized paths: PATH ALLOWLIST REQUIRES OWNER DECISION BEFORE IMPLEMENTATION; decision/evidence paths only, with recovery implementation explicitly separate.
- Prohibited paths: packages/database/** implementation, local-only promotion, migrations, Prisma generation, workflows, deployment.
- Entry criteria: P1C independent GO and formal OD-R07E-3 session.
- Dependencies: R0-7D-CLOSURE and database authority inventory.
- Implementation boundary: owner decision and authority analysis only.
- Required commands/tests: Git inventory, source provenance review, tenant/audit impact analysis.
- Evidence files: signed decision record and separate decision evidence package.
- Package-specific stop conditions: proposed source lacks provenance, local-only source required, or options are conflated.
- Rollback method: superseding owner decision; no source rollback because implementation is prohibited.
- Exit criteria: exact signed option, owner, limitations, and successor scope.
- Independent-review gate: data architecture, security, and governance review.
- Owner-decision gate: OD-R07E-3.
- Merge-readiness gate: decision artifact reviewed separately if tracked.
- Merge authorization state: false.
- Deployment authorization state: false.
- Successor package: separate database recovery or R0-7E-Q1 with blocked lane.

## R0-7E-Q1

- Objective: correct the isolated packages/ai-prompts lint baseline finding.
- Authorized paths: packages/ai-prompts/src/index.ts and exact focused test/evidence paths approved later; PATH ALLOWLIST REQUIRES OWNER DECISION BEFORE IMPLEMENTATION.
- Prohibited paths: other packages, workflows, frontend-app, backend, database, lockfiles unless separately authorized, deployment.
- Entry criteria: R0-7D closure, OD-R07E-1/2 adoption, exact lint reproduction, clean clone.
- Dependencies: approved lane matrix and artifact policy when tools change.
- Implementation boundary: minimum lint-cause correction and focused regression only.
- Required commands/tests: package lint, typecheck, unit tests, root impact check.
- Evidence files: operational test log and separate evidence package.
- Package-specific stop conditions: cause differs, another package must change, lockfile changes, or behavior scope expands.
- Rollback method: reviewed revert of Q1 commit.
- Exit criteria: isolated lint passes with no new findings and independent review GO.
- Independent-review gate: code, regression, and scope review.
- Owner-decision gate: exact Q1 authorization after prerequisite closure.
- Merge-readiness gate: separate owner readiness.
- Merge authorization state: false.
- Deployment authorization state: false.
- Successor package: R0-7E-Q2.

## R0-7E-Q2

- Objective: implement six honest CI lanes and remove unavailable-target false-green behavior.
- Authorized paths: .github/workflows/ci.yml, .github/workflows/confora-qa.yml, approved validator/tests; PATH ALLOWLIST REQUIRES OWNER DECISION BEFORE IMPLEMENTATION.
- Prohibited paths: application source, backend, database recovery, accessibility implementation, F4, deployment workflow, repository settings.
- Entry criteria: Q1 merged; OD-R07E-2/8 adopted; exact workflow/test allowlist; clean clone.
- Dependencies: R0-7D closure and database disposition.
- Implementation boundary: lane orchestration, status semantics, and missing-path negatives only.
- Required commands/tests: workflow syntax, lane unit tests, missing-path negatives, clean-clone install/lint/typecheck/unit matrix.
- Evidence files: workflow diff, test logs, lane result fixtures, separate evidence package.
- Package-specific stop conditions: action/artifact cannot be pinned, missing path disappears, source change required, or deployment permission appears.
- Rollback method: reviewed revert to prior workflow SHAs and artifacts.
- Exit criteria: six lanes emit deterministic honest results with zero hidden exclusions.
- Independent-review gate: CI security, permissions, supply-chain, and semantics review.
- Owner-decision gate: exact Q2 path and workflow authorization.
- Merge-readiness gate: separate owner readiness after checks/review.
- Merge authorization state: false.
- Deployment authorization state: false.
- Successor package: R0-7E-C1.

## R0-7E-C1

- Objective: separate governance-policy from implementation-compliance validation.
- Authorized paths: .github/workflows/accessibility.yml and exact approved validator/test paths; PATH ALLOWLIST REQUIRES OWNER DECISION BEFORE IMPLEMENTATION.
- Prohibited paths: standards text, product source, database reconstruction, backend restoration, F4, deployment, settings.
- Entry criteria: Q2 merged; OD-R07E-3/5/8 resolved; exact validators and states approved.
- Dependencies: database disposition and complete authority for any tested control.
- Implementation boundary: names, state model, policy checks, implementation availability assertions, negative claim tests.
- Required commands/tests: policy schema/reference tests, implementation control tests, blocked/N/A negatives, prohibited-claim tests.
- Evidence files: validator/test manifests, logs, fixtures, separate evidence package.
- Package-specific stop conditions: policy result implies conformity, blocked becomes success, standards text appears, or authority graph is incomplete.
- Rollback method: reviewed revert to prior workflow/validator SHAs while retaining blocker evidence.
- Exit criteria: deterministic qualified outputs with independent compliance review GO.
- Independent-review gate: conformity, legal/copyright, security, and CI review.
- Owner-decision gate: exact C1 authorization after OD-R07E-5.
- Merge-readiness gate: separate owner readiness.
- Merge authorization state: false.
- Deployment authorization state: false.
- Successor package: R0-7E-F4-PRE when separately approved, otherwise R0-7E-E1.

## R0-7E-F4-PRE

- Objective: restore the absent F4 validator as a separate prerequisite.
- Authorized paths: scripts/ops/run-f4-8g-frontend-validation.mjs and exact helper/test/evidence paths; PATH ALLOWLIST REQUIRES OWNER DECISION BEFORE IMPLEMENTATION.
- Prohibited paths: unrelated frontend domains, backend, database, workflows unless separately authorized, deployment, settings.
- Entry criteria: OD-R07E-6 adoption and approved F4 authority/contract.
- Dependencies: approved frontend authority from R0-7D.
- Implementation boundary: F4 entrypoint, helpers, focused tests, and evidence only.
- Required commands/tests: entrypoint unit tests, clean-clone F4 validation, missing-input negatives.
- Evidence files: command logs, input manifest, focused evidence package.
- Package-specific stop conditions: contract ambiguous, untracked helper required, workflow edit needed without authorization, or scope expands.
- Rollback method: reviewed revert of F4 prerequisite commits.
- Exit criteria: tracked reproducible validator with independent review GO.
- Independent-review gate: frontend architecture, CI, and scope review.
- Owner-decision gate: exact F4 implementation authorization.
- Merge-readiness gate: separate owner readiness.
- Merge authorization state: false.
- Deployment authorization state: false.
- Successor package: R0-7E-E1.

## R0-7E-E1

- Objective: record complete closure evidence for merged/approved R0-7E operational packages.
- Authorized paths: one new timestamped docs/evidence/governance/** folder; PATH ALLOWLIST REQUIRES OWNER DECISION BEFORE IMPLEMENTATION.
- Prohibited paths: every existing file, source, workflow, manifest, lockfile, setting, deployment.
- Entry criteria: all approved operational packages complete at exact published head.
- Dependencies: Q1, Q2, C1, and applicable F4/database outcomes.
- Implementation boundary: evidence only; no operational correction.
- Required commands/tests: identity, inventory, logs, redaction, checksum, authorization, deployment-zero validation.
- Evidence files: complete new closure package with exact manifest.
- Package-specific stop conditions: operational defect found, secret/PII present, stale SHA, missing log, or unrelated path.
- Rollback method: reviewed revert of evidence commit; preserve incident record separately.
- Exit criteria: complete clean evidence at exact head and zero deployment.
- Independent-review gate: R0-7E-R1.
- Owner-decision gate: evidence-package creation authorization.
- Merge-readiness gate: not satisfied by evidence alone.
- Merge authorization state: false.
- Deployment authorization state: false.
- Successor package: R0-7E-R1.

## R0-7E-R1

- Objective: independently review exact history, scope, tests, security, governance, and evidence.
- Authorized paths: read-only tracked Git objects, clean clone, remote metadata, and approved test execution; no repository mutation.
- Prohibited paths: all file changes, commits, pushes, PR metadata, workflow reruns, settings, deployment.
- Entry criteria: published evidence head, clean clone, exact identities.
- Dependencies: R0-7E-E1.
- Implementation boundary: none; read-only review.
- Required commands/tests: reproduce approved suites and verify diff, ancestry, pins, lanes, claims, and deployment state.
- Evidence files: reviewer report outside repository unless separately authorized.
- Package-specific stop conditions: identity drift, missing authority, contaminated evidence, or test requires production access.
- Rollback method: none; review performs no mutation.
- Exit criteria: GO or NO-GO tied to exact head with all findings classified.
- Independent-review gate: this package is the independent gate.
- Owner-decision gate: owner may consider readiness only after GO.
- Merge-readiness gate: separate owner decision after GO.
- Merge authorization state: false.
- Deployment authorization state: false.
- Successor package: R0-7E-M1 only after separate owner readiness and authorization.

## R0-7E-M1

- Objective: perform only a separately authorized true merge commit and post-merge verification.
- Authorized paths: GitHub merge metadata for exact approved base/head; no repository file edits.
- Prohibited paths: squash, rebase, force-push, admin bypass, auto-merge, file changes, deployment, settings.
- Entry criteria: independent GO, exact owner merge-readiness decision, exact explicit merge authorization, live identities unchanged.
- Dependencies: R0-7E-R1 and owner readiness.
- Implementation boundary: true merge operation and read-only verification only.
- Required commands/tests: live metadata, checks, parent order/count, merge tree, branch tip, deployment checks.
- Evidence files: merge SHA/parents and post-merge verification report.
- Package-specific stop conditions: base/head drift, authorization mismatch, conflicts, bypass requirement, or deployment trigger.
- Rollback method: separately authorized reviewed revert commit; never history rewrite.
- Exit criteria: expected two-parent merge verified and integration tip exact.
- Independent-review gate: pre-merge GO and post-merge verification.
- Owner-decision gate: exact readiness plus separate merge authorization.
- Merge-readiness gate: explicit and current before execution.
- Merge authorization state: false until owner grants exact authorization.
- Deployment authorization state: false.
- Successor package: later R0-7F planning only.

## R0-7F

- Objective: enforce only independently verified stable checks through repository rules/settings.
- Authorized paths: PATH ALLOWLIST REQUIRES OWNER DECISION BEFORE IMPLEMENTATION; repository rulesets/settings only under separate authorization.
- Prohibited paths: source/workflow repair hidden in settings task, bypass, deployment, unverified required checks.
- Entry criteria: R0-7E merged, relevant checks green or honestly blocked as approved, separate R0-7F plan/review.
- Dependencies: complete R0-7E post-merge verification.
- Implementation boundary: check enforcement and documented exception governance only.
- Required commands/tests: ruleset dry review, status-context identity checks, negative bypass/branch scenarios.
- Evidence files: settings before/after, rule identifiers, dry review, independent review.
- Package-specific stop conditions: check unstable/missing, bypass needed, branch impact unknown, or owner authorization absent.
- Rollback method: separately authorized restoration of prior recorded ruleset configuration.
- Exit criteria: independently verified enforcement with documented recovery and no deployment.
- Independent-review gate: ruleset/security/governance review.
- Owner-decision gate: separate R0-7F settings authorization.
- Merge-readiness gate: not applicable to settings; equivalent owner change-readiness required.
- Merge authorization state: false and not inferred from R0-7E.
- Deployment authorization state: false.
- Successor package: separately planned governance enforcement maintenance.

work_package_count = 11
work_package_missing_required_field_count = 0
implicitly_authorized_future_package_count = 0
