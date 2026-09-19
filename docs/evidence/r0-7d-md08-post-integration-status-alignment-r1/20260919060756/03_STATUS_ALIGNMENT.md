# Status alignment

This package does not resolve a new Model D item. MD08 was already in
RESOLVED_ITEM_SET on the PR 38 merge tree. The in-tree candidate field
MD08_FORMALLY_RESOLVED_ON_INTEGRATION remained false because the merge tree
equals the accepted candidate tree and that candidate text was not rewritten.

Aligned live Part E fields:

| Field | Before (stale candidate text on integration) | After |
| --- | --- | --- |
| MD08_FORMALLY_RESOLVED_ON_INTEGRATION | false | true |
| FR2_PR_AUTHORIZATION_GRANTED | false | true (consumed; PR 38) |
| FR2_MERGE_AUTHORIZATION_GRANTED | false | true (consumed; MERGE_COMMIT c9ef883d) |
| MD08_FORMAL_RECONCILIATION_STATUS | FR2_CANDIDATE_COMPLETE_PENDING_INDEPENDENT_REVIEW | FR2_INTEGRATED_PENDING_I2_POSTMERGE_REVIEW |
| I2_POSTMERGE_REVIEW_STATUS | (absent) | NOT_PERFORMED_PREGATE_STOPPED_PACKAGE_2_INACCESSIBLE |
| I1_HISTORICAL_FAIL_PRESERVED | (absent as live field) | true |
| Last Part E status alignment | (absent) | R0-7D-MD08-POST-INTEGRATION-STATUS-ALIGNMENT-R1 |

Unchanged:

MODEL_D = 17/9/8/8/0
RESOLVED_ITEM_SET = MD01, MD04, MD08, MD11, MD13, MD14, MD15, MD16, MD17
UNRESOLVED_ITEM_SET = MD02, MD03, MD05, MD06, MD07, MD09, MD10, MD12
MD08_FORMALLY_RESOLVED = true
MD08_STATUS = CLOSED_ACCEPTED
Last formal reconciliation = R0-7D-MD08-MODEL-D-FR2-CLEAN-REISSUANCE
PR 37 implementation merge authority = unchanged
FR1 history = preserved
FR2+EC1 evidence directory = not mutated

Preservation statements that remain true:

INITIAL_MERGE_FULLY_CONFORMING_AT_COMPLETION = false
ORIGINAL_I1_FAIL_ERASED = false
BRANCH_PRESERVATION_SATISFIED_AT_ORIGINAL_MERGE_INSTANT = false
I2_PASS_CLAIMED = false
