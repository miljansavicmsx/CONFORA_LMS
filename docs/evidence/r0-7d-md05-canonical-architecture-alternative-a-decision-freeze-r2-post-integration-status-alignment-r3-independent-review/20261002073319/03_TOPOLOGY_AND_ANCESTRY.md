# Topology and ancestry

```text
REVIEW_UTC = 2026-10-02T07:33:19Z

SUBJECT_COMMIT = ad505f5188b923f83b2b6adbda2ceb894efeb90e
OBSERVED_PARENT = 3805dba2ceb70d64b7ba967de6beb78beab67e9e
EXPECTED_PARENT = 3805dba2ceb70d64b7ba967de6beb78beab67e9e
PARENT_COUNT = 1
SUBJECT_TREE = 68ebd509592ddb99113a6e7c60a1158f689e6449
INTEGRATION_HEAD = 3805dba2ceb70d64b7ba967de6beb78beab67e9e
INTEGRATION_TREE = 357d41026223b05582a93b26b84e6d8cbba90f35

AUTHORITATIVE_I2_REVIEW_COMMIT =
8b97f8aa4354ccf7db95aff0678a33bd7540d020
I2_IS_ANCESTOR_OF_SUBJECT = false
I2_IS_PARENT_OF_SUBJECT = false

HISTORICAL_ALIGNMENT_R1_COMMIT =
c335f7bfdb1f9d5ab04c07e8718f299364a354ca
R1_IS_ANCESTOR_OF_SUBJECT = false

CHERRY_PICK_TRAILER_PRESENT = false
REBASE_TRAILER_PRESENT = false
I2_EVIDENCE_CHERRY_PICKED_INTO_SUBJECT = false
EXISTING_R1_R2_I2_EVIDENCE_DIRS_MUTATED = false
```

Live checks confirm required R3 topology:

- the subject starts at exact integration HEAD `3805dba…`;
- authoritative I2 review commit `8b97f8a…` is not the parent and is not an
  ancestor of the subject;
- historical alignment R1 `c335f7b…` is not an ancestor;
- no cherry-pick or rebase trailer is present in the subject message;
- subject path delta does not mutate prior R1/R2/I2 evidence directories;
- subject references authoritative I2 by commit SHA and evidence path only;
- pull request #46 remains an open draft and was not modified, merged, or
  deleted by the subject;
- no subject pull request was opened before this independent review.

PR #45 and PR #47 merge facts on integration remain valid:

```text
PR_45_MERGE = 426cc1ec8ab442e126678c84bb4a3586244c6d7c
PR_45_STATE = MERGED
PR_47_MERGE = 3805dba2ceb70d64b7ba967de6beb78beab67e9e
PR_47_STATE = MERGED
PR_47_MERGE_METHOD = MERGE_COMMIT
PR_47_MERGED_AT = 2026-10-01T10:40:19Z
```
