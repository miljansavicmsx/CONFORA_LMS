# S17 API ↔ Browser Alignment

| Aspect | API (`GET /api/public/verify/:hash`) | Browser (`/verify/:hash`) |
|--------|--------------------------------------|---------------------------|
| Auth required | No | No |
| Valid fixture hash | `cedf36de04cb8d9866451349199e9861a4641c31bb48ea78c65cdf1eae6a7945` | Same URL path |
| Status | `lifecycleStatus=VALID`, `effectiveStatus=ACTIVE` | `verify-status-label` visible |
| Certificate number | `CON-2026-000015` | Shown in result panel |
| Scheme | `Sample certification scheme` | Scheme fields aligned |
| Holder label | `Pilot Learner2` | Public name only |
| Invalid reference | `validityState=NOT_FOUND` | `verify-not-found-state` |
| Error leakage | None | No stack trace / tenantId / userId |

## Invalid paths tested

| Input | API | Browser |
|-------|-----|---------|
| 64×`0` | NOT_FOUND JSON | `/verify/{zeros}` → not-found UI |
| `not-a-valid-hash` | Invalid reference handling | `verify-not-found-state` or `verify-invalid-link` |

## Lookup page

`/verify` loads lookup form with trust messaging and read-only notice without redirect to `/login`.
