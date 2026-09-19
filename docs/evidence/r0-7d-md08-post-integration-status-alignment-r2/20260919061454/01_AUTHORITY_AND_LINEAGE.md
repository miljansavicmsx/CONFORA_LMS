# Authority and lineage — MD08 post-integration status alignment R2

## Owner authorization
OWNER_AUTHORIZE_R0_7D_MD08_POST_INTEGRATION_STATUS_ALIGNMENT_R2_CLEAN_REISSUANCE = CONSUMED
EXECUTION_ENGINE = CURSOR
EXECUTION_MODE = BOUNDED_CLEAN_REISSUANCE

NOT_CONSUMED =
OWNER_AUTHORIZE_INDEPENDENT_CODEX_R0_7D_MD08_MODEL_D_FR2_EC1_I2_POSTMERGE_REVIEW

## Governance Hierarchy
Part E of `docs/governance/OWNER_DECISION_REGISTER.md` is Governance Hierarchy
Level 1 and is the authoritative live Model D register on this candidate.
Timestamped evidence under `docs/evidence/**` is Level 7 supporting evidence
only and does not override Part E.

## PR #38 merge topology (live-verified)
PR = https://github.com/miljansavicmsx/CONFORA_LMS/pull/38
PR_STATE = MERGED
MERGED_AT = 2026-09-18T19:52:10Z
MERGE_COMMIT = c9ef883d8b4b75f0841595731ce2a0b67e7dcc97
MERGE_PARENT_1 = e33a56d2b0408ad7c3d90b531bb3cd47e8f268a5
MERGE_PARENT_2 = 051e49fed5199991e6c0755d2f2479d1133d4262
MERGE_TREE = e03bb6bc7ceab9161fc074bcdfc16e83b2f7c33a
MERGE_METHOD = MERGE_COMMIT
INTEGRATION_BRANCH = fix/ca-h01-frontend-f4-cutover
CANDIDATE_BRANCH = governance/r0-7d-md08-model-d-formal-reconciliation-r2
CANDIDATE_HEAD = 051e49fed5199991e6c0755d2f2479d1133d4262
MERGE_TREE_EQUALS_CANDIDATE_TREE = true

## Why R2 exists
REASON_R2_CLEAN_REISSUANCE =
Create a new independently reviewable candidate from frozen integration
without deleting, replacing, or mutating the existing alignment R1 branch
or commit. Alignment R1 used a non-canonical Cloud Agent branch and was
not opened as a PR. R1 is not accepted integration authority.

ALIGNMENT_R1_BRANCH = cursor/md08-post-integration-status-alignment-996d
ALIGNMENT_R1_COMMIT = a843d9dde7cf8c8133fe12cb70ab15143f04b21e
ALIGNMENT_R1_AUTHORIZATION = OWNER_AUTHORIZE_R0_7D_MD08_POST_INTEGRATION_STATUS_ALIGNMENT_R1
ALIGNMENT_R1_INTEGRATED = false
ALIGNMENT_R1_RETROACTIVE_AUTHORIZATION_GRANTED = false
R2_DOES_NOT_DELETE_OR_MUTATE_R1 = true

## I2 and I1 preservation (not rewritten)
I2_PASS_CLAIMED = false
I2_AUTHORIZATION_CONSUMED = false
I2_PREGATE_STOP_PRESERVED_AS_HISTORY = true
I2_STOP_CODE = REQUIRED_EVIDENCE_PACKAGE_INACCESSIBLE
PACKAGE_1_SHA256 = c3e33ce78ded05749e532d6d691407fee85de11010a0f93b0c6c3ce98497fbf0
I1_RESULT = MERGED_WITH_POSTMERGE_BRANCH_PRESERVATION_DEFECT_SUBSEQUENTLY_CLOSED
I1_HISTORICAL_FAIL_CODE = CANDIDATE_BRANCH_DELETED
INITIAL_MERGE_FULLY_CONFORMING_AT_COMPLETION = false

## Classification
LEVEL_1_MUTATION = one Part E status-alignment update in OWNER_DECISION_REGISTER.md
LEVEL_7_MUTATION = six new immutable supporting-evidence files under docs/evidence/r0-7d-md08-post-integration-status-alignment-r2/20260919061454/
