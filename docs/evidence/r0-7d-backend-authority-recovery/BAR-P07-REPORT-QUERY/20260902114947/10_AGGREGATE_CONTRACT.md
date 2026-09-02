# Aggregate Contract

Operations:

1. aggregateByStatus(actor, input) -> ReportQueryStatusAggregateResult
2. aggregateBySchemeRef(actor, input) -> ReportQuerySchemeRefAggregateResult

Status groups: always five statuses in order DRAFT|SUBMITTED|UNDER_REVIEW|APPROVED|REJECTED
Scheme groups: present-only, UTF-16 ascending sort, no artificial zeros
