# Proposed Work-Package Sequence

## Common gates

Every package starts from an approved integration tip with a clean tree. Common
prohibitions are backend/**, appeals, complaint runtime code, deployment,
branch protection, admin bypass, untracked promotion, and TD-006 closure unless
a later owner decision explicitly changes that package scope. Implementation,
evidence, review, readiness, and merge authorization remain separate.
Rollback is a reviewed revert, never history rewrite. Proposed integration is
MERGE_COMMIT_ONLY after separate owner authorization.

| ID | Objective and authorized paths | Entry | Required tests and evidence | Exit, review, and owner gate |
|---|---|---|---|---|
| R0-7E-P1 | Planning files in this folder only | Exact f5e48ddb; P0 GO | JSON, path, identity validation | One planning commit; adoption still required |
| R0-7D-CLOSURE | Forward-only accessibility and deterministic frontend; later exact allowlist | Approved integration; OD-R07E-4 | Clean install/build/preview/a11y; separate evidence | Merged closure before R0-7E implementation |
| DB-DISPOSITION | Decide separate recovery or blocked lane; decision files only | OD-R07E-3 request | Authority inventory; tenant/security review | Signed owner choice; implementation separate |
| R0-7E-Q1 | Isolated lint correction in packages/ai-prompts/src/index.ts and focused test | D closure; lane adoption | Package lint, typecheck, unit; evidence separate | Independent review and merge authorization |
| R0-7E-Q2 | CI lanes and unavailable-filter cleanup in ci.yml and confora-qa.yml; root CI config only if approved | Q1 and OD-R07E-2/8 | Clean-clone lanes; negative missing-path tests | Green or explicit block; review and merge authorization |
| R0-7E-C1 | Split policy and implementation compliance in accessibility.yml and approved validator/tests | DB decision and OD-R07E-5 | Validator unit/negative tests; no standards text | Honest names/blockers; review and merge authorization |
| F4-PREREQUISITE | Focused F4 restoration under later allowlist | OD-R07E-6 | Entry-point and clean-clone tests | Separate evidence, review, readiness, merge gate |
| R0-7E-E1 | Evidence-only closure in one new evidence folder | Operational packages complete | Identity, logs, redaction, deployment zero | Evidence commit only |
| R0-7E-R1 | Independent review | Evidence tip published | Diff, test, security, conformity, history review | Independent verdict; no self-approval claim |
| R0-7E-MR | Owner merge-readiness decision | Review complete | Live identity, checks, controls, deployment safety | Explicit readiness; no merge |
| R0-7E-M1 | True merge authorization | Separate owner authorization | Parent order and post-merge verification | No squash, rebase, bypass, or deployment |
| R0-7F | Enforce verified checks | R0-7E merged and checks green | Ruleset dry review and independent review | Separate settings authorization |
