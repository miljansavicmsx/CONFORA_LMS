# HTTP Query Contract

P08_QUERY_DTO_STRICT=true
P08_ALLOWED_QUERY_PARAMETER_COUNT=6
Allowed keys: status | schemeRef | createdFrom | createdTo | submittedFrom | submittedTo

P08_REPEATED_QUERY_POLICY=REJECT_ANY_REPEATED_OR_MULTI_VALUE_PARAMETER

Reject: unknown keys; repeated same/different values; arrays; nested/bracket shapes; allowlisted non-string structures -> INVALID_INVOCATION
Unknown key -> UNKNOWN_FILTER

status enum: DRAFT|SUBMITTED|UNDER_REVIEW|APPROVED|REJECTED
schemeRef: scalar string 1..128; case-sensitive; no trim/wildcard/normalization
