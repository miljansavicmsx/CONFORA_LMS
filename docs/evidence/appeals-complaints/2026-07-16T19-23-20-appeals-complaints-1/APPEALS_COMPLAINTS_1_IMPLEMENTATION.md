# APPEALS-COMPLAINTS-1 Implementation

## API (existing, wired)

- `GET/POST /v1/learner/appeals`
- `GET/POST /v1/learner/complaints`
- Contact remains `/v1/learner/contact-requests` and public contact routes

## Frontend (this slice)

- Page: `frontend-app/src/pages/learner/AppealsComplaintsPage.tsx`
- Route: `/dashboard/appeals-complaints`
- Tabs: Žalbe | Prigovori
- Dialogs: `FormalAppealDialog`, `FormalComplaintDialog`
- Support page links to appeals-complaints; deferred notice removed
- Pilot nav includes appeals-complaints

## Staff workflow

Existing B14/B15 staff controllers remain authoritative. Full learner-facing resolution UI deferred.
