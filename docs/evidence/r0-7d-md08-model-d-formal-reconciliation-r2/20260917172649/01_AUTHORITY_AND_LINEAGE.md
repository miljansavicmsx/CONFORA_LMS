# Authority and Lineage — MD08 Model D FR2 Clean Reissuance

## Owner authorization
OWNER_AUTHORIZE_R0_7D_MD08_MODEL_D_FR2_CLEAN_REISSUANCE = CONSUMED
EXECUTION_ENGINE = CURSOR
CODEX_USED = false
ASTRA_USED = false
EXECUTION_MODE = BOUNDED_CLEAN_REISSUANCE

## Governance Hierarchy
Part E of `docs/governance/OWNER_DECISION_REGISTER.md` is Governance Hierarchy Level 1 and is the authoritative live Model D register on this candidate.
Timestamped evidence under `docs/evidence/**` is Level 7 supporting evidence only and does not override Part E.

## PR #37 merge topology
PR = https://github.com/miljansavicmsx/CONFORA_LMS/pull/37
MERGE_COMMIT = e33a56d2b0408ad7c3d90b531bb3cd47e8f268a5
MERGE_PARENT_1 = a4e4329d7ab086569c2c19c5a4289253ea8826df
MERGE_PARENT_2 = a1d3d186f0a08d0bf1e57d8cc92cceeaaf5d6260
MERGE_TREE = f2212dfae62b9557be8b76f6578cd80593327dd3
MERGE_METHOD = MERGE_COMMIT
INTEGRATION_BRANCH = fix/ca-h01-frontend-f4-cutover

## Implementation R1 / EC1 lineage
ORIGINAL_R1_IMPLEMENTATION_COMMIT = 43d805bdc1231c2695e822fcb6398e772f7af27d
EC1_COMMIT = a1d3d186f0a08d0bf1e57d8cc92cceeaaf5d6260
HISTORICAL_F09_FAILURE = Initial implementation R1 failed the independent F09 exact-path gate; rejected history preserved.
EC1_CURE = Exact-path remediation accepted; F09_REMEDIATION_STATUS = CLOSED_ACCEPTED

## Independent I2 post-merge review
REPORT = C:\CONFORA_R0D_MD08_CERTIFICATION_OPS_LABELS_R1_EC1_I2_POSTMERGE_REVIEW_LOGS\CODEX_RETRY_01\00_MD08_R1_EC1_I2_POSTMERGE_FINAL_REPORT.md
R0_7D_MD08_CERTIFICATION_OPS_LABELS_R1_EC1_I2_POSTMERGE_REVIEW = PASS
REVIEW_RECOMMENDATION = ACCEPT
QUESTION_COUNT = 40
QUESTION_PASS_COUNT = 40
QUESTION_FAILURE_COUNT = 0
REVIEW_VALIDATION_STEP_COUNT = 40
REVIEW_VALIDATION_PASS_COUNT = 40
TARGETED_TEST_RESULT = 3/3_PASS
F09_REMEDIATION_STATUS = CLOSED_ACCEPTED
CODEX_REPOSITORY_MUTATION_COUNT = 0

## Prior FR1 attempts (historical; nonintegrated)
FR1_PROVISIONAL_COMMIT = dd06ff13636f92d00081b1f607d23994c9a30a19
FR1_RECREATED_BRANCH_COMMIT = 147790c1a76685fdb05a72e41bbf850d57992d8f
FR1_BRANCH = governance/r0-7d-md08-model-d-formal-reconciliation-r1
FR1_INDEPENDENT_REVIEW = STOPPED_BLOCKED
FR1_INTEGRATION_RECOMMENDED = false
FR1_NOT_CONCLUDED_TECHNICAL_REJECT = true
REASON_FR2_CLEAN_REISSUANCE = Create a new independently reviewable candidate without deleting, replacing, or mutating the existing R1 branch or either R1 commit; preserve FR1 history; avoid retroactive authorization of R1 branch deletion/recreation.
FR1_RETROACTIVE_AUTHORIZATION_GRANTED = false
FR2_DOES_NOT_RETROACTIVELY_AUTHORIZE_R1_BRANCH_MUTATION = true

## Classification
LEVEL_1_MUTATION = one Part E update in OWNER_DECISION_REGISTER.md
LEVEL_7_MUTATION = six new immutable supporting-evidence files under docs/evidence/r0-7d-md08-model-d-formal-reconciliation-r2/20260917172649/
