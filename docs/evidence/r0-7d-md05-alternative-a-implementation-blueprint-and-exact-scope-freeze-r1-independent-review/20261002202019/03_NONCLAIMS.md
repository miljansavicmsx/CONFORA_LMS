# Nonclaims

```text
REVIEW_UTC = 2026-10-02T20:20:19Z

AUTHORIZATION_STATUS = RECEIVED_NOT_CONSUMED
PASS_ACCEPT_ISSUED = false
FAIL_REJECT_ISSUED = false
TECHNICAL_CONTENT_VERDICT_ISSUED = false
CANDIDATE_MUTATED = false
CANDIDATE_BRANCH_MUTATED = false
IMPLEMENTATION_AUTHORIZATION = false
MD05_FORMALLY_RESOLVED = false
MODEL_D_MUTATED = false
PATH_EXPANSION_AUTHORIZED = false
CLOSED_ACCEPTED_CLAIMED = false
SECOND_GRANT_CREATED = false
```

A `STOPPED_BLOCKED` outcome for `REVIEWER_NOT_INDEPENDENT` does not
consume the independent-review authorization. The authorization remains
available for a different Cursor run whose bcId is not
`bc-2ec9fc2d-e816-4e7b-8b4b-ef55adfac14d`.

This stop package does not authorize a different reviewer and does not
create a second grant.
