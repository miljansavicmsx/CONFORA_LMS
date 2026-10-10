# Topology and ancestry

```text
REVIEW_UTC = 2026-09-30T12:38:13Z

CANDIDATE_COMMIT = ad8aa5a16c05907a441ece20fe425544745a96f4
OBSERVED_PARENT = 9623a2f45612e5aa843ac73b87cd34957dac48ab
PARENT_COUNT = 1
CANDIDATE_TREE = ad8eed62e66fd0db319dbcf524864a75a3dc6013
INTEGRATION_TREE = 215f53e36fc8b1d3953133d6e695c96cd88e2a0a

HISTORICAL_R1_COMMIT = 6e3a3118164a48e143e607a6eb5846c2b82c2a8c
HISTORICAL_R1_TREE = df8bb32ed59cf6b1c6ab3290b421fafaba35ec73
R1_IS_ANCESTOR_OF_CANDIDATE = false
CANDIDATE_IS_ANCESTOR_OF_R1 = false
CANDIDATE_TREE_EQUALS_R1_TREE = false

CANDIDATE_STABLE_PATCH_ID =
dcf8308e59e59df0228e6ff25935d216c116cd66
R1_STABLE_PATCH_ID =
7394d0166fe325c2876eb2c1840b83a4558463e9
PATCH_IDS_EQUAL = false

CHERRY_PICK_TRAILER_PRESENT = false
REBASE_TRAILER_PRESENT = false
```

Live checks confirm clean reissuance topology:

- the candidate starts at exact integration HEAD `9623a2f…`;
- historical R1 `6e3a3118…` is not an ancestor and is not the parent;
- trees and stable patch-ids differ from R1;
- no cherry-pick or rebase trailer is present in the candidate message;
- pull request #42 remains an open draft at `6e3a3118…` and was not
  modified, merged, or deleted by the candidate;
- no pull request exists for the R2 candidate branch.
