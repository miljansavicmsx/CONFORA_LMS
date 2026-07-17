# Implementation

## Frontend
- `StaffAppealsComplaintsPage` — separate Žalbe / Prigovori tabs, queues, detail dialogs
- `StaffAppealsComplaintsGuard` + `staff-appeals-complaints-access` — learner denied
- Routes: `/dashboard/admin/appeals-complaints`, `/dashboard/iso/appeals`, staff view on `/dashboard/iso/complaints`
- Contact remains `/dashboard/admin/support` and learner `/dashboard/support`

## Mutations (safe)
- Appeal/complaint **acknowledge** and **void** via `/v1/staff/*` (canonical)
- Does **not** call remedy/action domain linkers
- Does **not** issue/activate/suspend/withdraw/renew/revoke certificates
- Does **not** change exam results

## Deferred
- Full B14 admissibility/evidence/decision/remedy UI
- Full B15 triage/investigation/decision/action UI
