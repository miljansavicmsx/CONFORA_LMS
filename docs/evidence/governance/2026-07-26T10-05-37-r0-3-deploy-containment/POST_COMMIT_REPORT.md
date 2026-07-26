# R0-3 Post-Commit Report

**Verdict:** READY WITH CONDITIONS  
**Date:** 2026-07-26  
**Pushed:** No

## Branch relocation note

The containment commit was initially created on `fix/ca-h01-frontend-f4-cutover`. Per owner instruction (“Do not commit to fix/ca-h01-frontend-f4-cutover”), it was relocated:

1. Created `governance/r0-3-deploy-containment` pointing at commit `d75aaaac`
2. Reset `fix/ca-h01-frontend-f4-cutover` to `e27cdc05` (local only; commit was never pushed)
3. Checked out `governance/r0-3-deploy-containment`

## Identity

| Field | Value |
|-------|-------|
| Branch | `governance/r0-3-deploy-containment` |
| Parent commit | `e27cdc0501bbd9f931d0e71f653ffc5f0d88d1bb` (`e27cdc05`) |
| New commit (short) | `d75aaaac` |
| New commit (full) | `d75aaaac65be285f0ef6fc25670ff53b49202585` |
| Subject | `ci(security): contain production backend deployment` |
| Feature branch HEAD after relocation | `e27cdc05` (R0-3 not an ancestor) |

## Exact committed files (16)

1. `.github/workflows/deploy-backend.yml`
2. `docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/BEFORE_AFTER_BEHAVIOUR.md`
3. `docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/CHANGED_FILES.md`
4. `docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/CONFORA_R0_3_REPORT.md`
5. `docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/GITHUB_ENVIRONMENT_CHECKLIST.md`
6. `docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/OUT_OF_SCOPE_REVIEW.md`
7. `docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/README.md`
8. `docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/ROLLBACK.md`
9. `docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/VALIDATION.md`
10. `docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/WORKFLOW_INVENTORY_AND_TRIGGERS.md`
11. `docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/after/deploy-backend.yml`
12. `docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/before/deploy-backend.yml`
13. `docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/deploy-backend.diff.txt`
14. `docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/git_status_after_tracked.txt`
15. `docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/git_status_scope.txt`
16. `docs/evidence/governance/2026-07-26T10-05-37-r0-3-deploy-containment/summary.json`

## `git diff --stat HEAD^ HEAD`

```text
 .github/workflows/deploy-backend.yml               |  98 ++++++++++-
 .../BEFORE_AFTER_BEHAVIOUR.md                      |  63 +++++++
 .../CHANGED_FILES.md                               |  21 +++
 .../CONFORA_R0_3_REPORT.md                         |  47 ++++++
 .../GITHUB_ENVIRONMENT_CHECKLIST.md                |  20 +++
 .../OUT_OF_SCOPE_REVIEW.md                         |  22 +++
 .../README.md                                      |  57 +++++++
 .../ROLLBACK.md                                    |  50 ++++++
 .../VALIDATION.md                                  |  42 +++++
 .../WORKFLOW_INVENTORY_AND_TRIGGERS.md             |  54 ++++++
 .../after/deploy-backend.yml                       | 184 +++++++++++++++++++++
 .../before/deploy-backend.yml                      |  96 +++++++++++
 .../deploy-backend.diff.txt                        | 120 ++++++++++++++
 .../git_status_after_tracked.txt                   |  75 +++++++++
 .../git_status_scope.txt                           |   2 +
 .../summary.json                                   |  50 ++++++
 16 files changed, 996 insertions(+), 5 deletions(-)
```

## Confirmations

| Check | Result |
|-------|--------|
| Unrelated files committed | **No** — only workflow + R0-3 evidence |
| Application code changed | **No** |
| Schemas / migrations changed | **No** |
| Runtime configuration changed | **No** |
| Committed to `fix/ca-h01-frontend-f4-cutover` | **No** (relocated; feature branch at `e27cdc05`) |
| Pushed | **No** |
| Nothing staged on governance branch for this commit scope | **Yes** (working tree may still show unrelated untracked/CRLF noise) |

## Remaining condition (external)

Configure GitHub Environment **`production`** with **required reviewers** (and preferred wait timer / deployment branch limits) in repository Settings. YAML references the environment; reviewer enforcement is not complete until the UI is configured.
