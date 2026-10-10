# Canonical boundary

DESIGN_UTC = 2026-09-29T15:32:54Z
CANONICAL_ONLY = true
LEGACY_APPEAL_ALIAS_IN_MD05_SCOPE = false
LEGACY_COMPLAINT_ALIAS_IN_MD05_SCOPE = false

## In-scope routes

Appeals, ISO/IEC 17024 clause 9.8 target:

- `/v1/learner/appeals`
- `/v1/staff/appeals`
- `/v1/staff/appeals/{id}/acknowledge`
- `/v1/staff/appeals/{id}/void`
- `/v1/staff/appeals/{id}/decision/start`
- `/v1/staff/appeals/{id}/decision/outcome`

Complaints, ISO/IEC 17024 clause 9.9 target:

- `/v1/public/complaints`
- `/v1/learner/complaints`
- `/v1/staff/complaints`
- `/v1/staff/complaints/{id}/acknowledge`
- `/v1/staff/complaints/{id}/void`

These paths are design targets. Their presence in the frontend endpoint
registry does not prove a Nest implementation. On this base,
`apps/api/src/cert-appeals/` and `apps/api/src/cert-complaints/` are absent.

## Out of scope for MD05

- `/v1/me/appeals`
- `/v1/admin/appeals`
- `/v1/admin/appeals/board`
- `/v1/me/complaints`
- `/v1/admin/complaints`
- Any flag that falls through from a canonical call to those aliases
- Copying `a277a19` `appeals-client.ts`, which contains those legacy branches
- Note-taking helpers that throw status 410
- Swallowing status 409 on decision start and then recording an outcome
- Discarding `resolutionCommitteeId`
- Setting appellant `userId` to an empty string
- Education, identity-review, HD06, HD07, and the other seven unresolved Model D items

## Relationship to the present complaints client

`frontend-app/src/lib/api/complaints-client.ts` is already on the
integration tree and selects legacy complaint paths when
`VITE_COMPLAINTS_CANONICAL_ENABLED` is false. That file is not an MD05
change in this design. A later MD05 facade must not call the legacy
branch. If the only way to use the present client is the flag, MD05
implementation stays blocked until canonical calls are selectable
without a legacy fallback. This design does not modify that client.

## Appeal versus complaint

An appeal asks for review of a decision that affects the appellant.
A complaint expresses dissatisfaction with a process or service.
Submitting either one does not itself change certificate status, exam
results, or certification-decision records. Contact and support requests
remain a third flow.
