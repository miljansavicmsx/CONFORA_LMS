# 01 — Authority and chronology

```text
AUTHORIZATION =
OWNER_AUTHORIZE_R0_7D_MD05_PKG00_EXECUTABLE_RBAC_AND_ROLE_AUDIT_CONTRACT_R1_EC1
INTEGRATION_BRANCH = fix/ca-h01-frontend-f4-cutover
FROZEN_INTEGRATION_HEAD = fdc42d3740eba24311fe3f4726be1d13db6356ce
FROZEN_INTEGRATION_TREE = 97d3f181a56ee472ae8f1b5711592d0330a53587

REJECTED_CANDIDATE_BRANCH =
cursor/r0-7d-md05-pkg00-executable-rbac-audit-contract-r1
REJECTED_CANDIDATE_COMMIT = c32b423088c57b40635ef400e185392a5de350e3
REJECTED_CANDIDATE_TREE = 28db267441ed6eadd98da26ff68f5dd3898ad30a
REJECTED_CANDIDATE_PARENT = fdc42d3740eba24311fe3f4726be1d13db6356ce

EC1_BRANCH = cursor/r0-7d-md05-pkg00-executable-rbac-audit-contract-r1-ec1
EC1_PARENT = c32b423088c57b40635ef400e185392a5de350e3
EC1_COMMIT_COUNT = 1
EC1_MERGE_COMMIT_COUNT = 0
```

Before mutation, `origin` was fetched. The integration head, integration tree, rejected branch tip, rejected tree, and rejected parent matched the frozen identities above. The rejected branch was not moved, rebased, amended, squashed, cherry-picked, force-pushed, or deleted.

Chronology preserved:

1. original candidate `c32b423088c57b40635ef400e185392a5de350e3` remains unchanged;
2. original candidate branch remains unchanged;
3. original candidate evidence under `docs/evidence/r0-7d-md05-pkg00-executable-rbac-role-audit-contract-r1/20261005T102446Z/` remains unchanged;
4. historical independent review remains FAIL / `REJECT_PKG00_IMPLEMENTATION_CANDIDATE`;
5. historical inaccessible-container STOP remains unchanged and is not rewritten here;
6. the delivered recovery package identified as `f54f7395...` is not described as the original `e677aa7c...` container;
7. the original candidate is not called PASS;
8. EC1 does not close defects. Independent verification is still required.

```text
ORIGINAL_REPORTED_ZIP_SHA256 = e677aa7c...
DELIVERED_RECOVERY_ZIP_SHA256 = f54f7395...
DELIVERED_CONTENT_MATCHED_ORIGINAL_COMMITTED_EVIDENCE = false
ORIGINAL_E677_ZIP_VALID_OR_AVAILABLE = NOT_CLAIMED
```

Those package facts are historical. EC1 does not repair them.

The commit that adds this evidence is the single EC1 commit. Its own SHA cannot be stored inside the tree it hashes. The external package records that SHA after the commit is created.
