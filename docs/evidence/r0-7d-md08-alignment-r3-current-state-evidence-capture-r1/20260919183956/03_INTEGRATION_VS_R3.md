# Integration versus R3 Part E

Model D arithmetic is 17/9/8/8/0 on both trees. MD08 is already in
RESOLVED_ITEM_SET on integration because PR 38 merged FR2+EC1. The stale
candidate-era boolean remains false only in the integration register text.

## Integration tree c9ef883d / e03bb6bc

MD08_FORMALLY_RESOLVED_ON_INTEGRATION = false
MD08_FORMAL_RECONCILIATION_STATUS = FR2_CANDIDATE_COMPLETE_PENDING_INDEPENDENT_REVIEW
FR2_PR_AUTHORIZATION_GRANTED = false
FR2_MERGE_AUTHORIZATION_GRANTED = false
Last Part E status alignment = (absent)
CI_GREEN_CLAIMED = false

## R3 tree 60c551f / 4cc8c700

MD08_FORMALLY_RESOLVED_ON_INTEGRATION = true
MD08_FORMAL_RECONCILIATION_STATUS = FR2_INTEGRATED_I2_CLOSED_ACCEPTED
FR2_PR_AUTHORIZATION_GRANTED = true (consumed; PR 38)
FR2_MERGE_AUTHORIZATION_GRANTED = true (consumed; MERGE_COMMIT c9ef883d)
Last Part E status alignment = R0-7D-MD08-POST-INTEGRATION-STATUS-ALIGNMENT-R3
I2_PASS_CLAIMED = true (exact merged/recovered MD08 state only; Codex I2 PASS/ACCEPT)
CI_GREEN_CLAIMED = false

## R3 first-parent delta versus integration

A docs/evidence/r0-7d-md08-post-integration-status-alignment-r3/20260919062818/00_SUMMARY.md
A docs/evidence/r0-7d-md08-post-integration-status-alignment-r3/20260919062818/01_AUTHORITY_AND_LINEAGE.md
A docs/evidence/r0-7d-md08-post-integration-status-alignment-r3/20260919062818/02_LIVE_VERIFICATION_AND_ALIGNMENT.md
A docs/evidence/r0-7d-md08-post-integration-status-alignment-r3/20260919062818/03_SCOPE_PRESERVATION_AND_NONCLAIMS.md
A docs/evidence/r0-7d-md08-post-integration-status-alignment-r3/20260919062818/04_VALIDATION.md
A docs/evidence/r0-7d-md08-post-integration-status-alignment-r3/20260919062818/05_EVIDENCE_MANIFEST.md
M docs/governance/OWNER_DECISION_REGISTER.md

TOTAL_CHANGED_PATH_COUNT = 7
UNEXPECTED_PATH_COUNT = 0
PRODUCTION_SOURCE_CHANGED_PATH_COUNT = 0

R3 is not merged. Live integration still carries the stale candidate-era
ON_INTEGRATION=false field.
