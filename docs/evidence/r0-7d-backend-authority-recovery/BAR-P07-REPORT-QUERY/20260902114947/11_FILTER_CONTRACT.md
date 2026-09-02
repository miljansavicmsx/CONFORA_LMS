# Filter Contract

P07_ALLOWED_FILTERS=status|schemeRef|createdFrom|createdTo|submittedFrom|submittedTo
Unknown keys -> UNKNOWN_FILTER
Forbidden: tenantId, applicantUserId, userId, applicationId, raw where, groupBy dimension, pagination, sort, export
P07_STATUS_FILTER_CARDINALITY=SINGLE_OPTIONAL
P07_SCHEME_REF_FILTER_MODE=EXACT_MATCH length 1..128
