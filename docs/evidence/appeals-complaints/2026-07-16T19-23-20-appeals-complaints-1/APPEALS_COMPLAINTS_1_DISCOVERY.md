# APPEALS-COMPLAINTS-1 Discovery

| Asset | Present |
|-------|---------|
| cert-appeals module | true |
| cert-complaints module | true |
| contact-requests module | true |
| Learner appeals controller | true |
| Learner complaints controller | true |
| B14 foundation e2e | true |
| B15 foundation e2e | true |
| Learner UI page | true |

## Approach

Reuse canonical B14/B15 Nest modules and ContactRequests. Do not revive legacy `appeals-complaints` me-* controllers.
Learner UI foundation lives at `/dashboard/appeals-complaints` with contact remaining on `/dashboard/support`.
