# Validation Results

## Identity and ancestry

- Corrected planning authority was the exact pre-commit head: PASS.
- Normative commit has the corrected planning authority as its sole parent:
  PASS.
- Authoritative integration SHA is an ancestor of the corrected planning
  authority: PASS.
- Promotion branch name is `governance/r0-7e-normative-promotion`: PASS.

## Scope and separation

- Normative changed-file count: 6.
- Normative paths outside `docs/governance/**`: 0.
- New bounded policy-document count: 4.
- Existing governance documents modified: 2.
- Production or package source changes: 0.
- Workflow changes: 0.
- Manifest or lockfile changes: 0.
- Database, accessibility, F4, deployment, appeal, or unrelated domain
  changes: 0.
- `docs/governance/TECH_DEBT.md` created: false.

## Content gates

- Required proposed-promotion status markings: 6/6.
- Owner decisions recorded: 8/8.
- Adopted with recorded limitations: 7.
- Deferred and explicitly not adopted: 1.
- OD-R07E-3 database-dependent status remains
  `BLOCKED_MISSING_TRACKED_AUTHORITY`.
- Implementation, merge, and deployment authorizations remain false.
- `git diff --check`: PASS.

## Commit separation

- Normative-documentation commit count: 1.
- Evidence-only commit count: 1 after commit `SELF`.
- Mixed normative/evidence commit count: 0.
- Push count authorized: 1 normal non-force push.
- Pull-request operation count: 0.
