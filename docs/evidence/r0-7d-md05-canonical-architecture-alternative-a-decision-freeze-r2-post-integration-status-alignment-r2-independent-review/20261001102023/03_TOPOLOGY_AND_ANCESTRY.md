# Topology and ancestry

```text
REVIEW_UTC = 2026-10-01T10:20:23Z

SUBJECT_COMMIT = 028fee9d633de81f7bf42f95c34ae2cd04a06a37
OBSERVED_PARENT = 426cc1ec8ab442e126678c84bb4a3586244c6d7c
EXPECTED_PARENT = 426cc1ec8ab442e126678c84bb4a3586244c6d7c
PARENT_COUNT = 1
SUBJECT_TREE = 357d41026223b05582a93b26b84e6d8cbba90f35
INTEGRATION_TREE = ad8eed62e66fd0db319dbcf524864a75a3dc6013

HISTORICAL_ALIGNMENT_R1_COMMIT =
c335f7bfdb1f9d5ab04c07e8718f299364a354ca
HISTORICAL_ALIGNMENT_R1_TREE =
00ad11861a6a697d2971d9378b45fc73e2c5fdb0
R1_IS_ANCESTOR_OF_SUBJECT = false
SUBJECT_IS_ANCESTOR_OF_R1 = false
SUBJECT_TREE_EQUALS_R1_TREE = false

SUBJECT_STABLE_PATCH_ID =
d1fe9f84b69935745ab70d4ac73746bf5223d778
R1_STABLE_PATCH_ID =
b8380bd5c992ed9f2c2117342c47a748b0c1ef62
PATCH_IDS_EQUAL = false

CHERRY_PICK_TRAILER_PRESENT = false
REBASE_TRAILER_PRESENT = false
```

Live checks confirm clean reissuance topology:

- the subject starts at exact integration HEAD `426cc1e…`;
- historical alignment R1 `c335f7b…` is not an ancestor and is not the parent;
- trees and stable patch-ids differ from R1;
- no cherry-pick or rebase trailer is present in the subject message;
- pull request #46 remains an open draft at `c335f7b…` and was not
  modified, merged, or deleted by the subject;
- pull request #47 remains an open draft at `028fee9…`.

PR #45 merge topology on integration remains valid:

```text
MERGE_COMMIT = 426cc1ec8ab442e126678c84bb4a3586244c6d7c
MERGE_PARENT_1 = 9623a2f45612e5aa843ac73b87cd34957dac48ab
MERGE_PARENT_2 = ad8aa5a16c05907a441ece20fe425544745a96f4
MERGE_TREE = ad8eed62e66fd0db319dbcf524864a75a3dc6013
MERGE_METHOD = MERGE_COMMIT
MERGE_TOPOLOGY_VALID = true
```
