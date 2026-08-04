# Architecture — NEST_ONLY_COMPLAINT_OWNERSHIP

## Defect

Clean-tree merge-readiness reproduced:

- expected: `http://nest.example.test/v1/public/complaints`
- received: `http://127.0.0.1:8000/v1/public/complaints`

Root cause: default `VITE_API_PROVIDER=legacy` made `resolveOwnerForPath` return
`legacy` for every path before hybrid Nest prefix rules ran. Canonical Nest
complaint paths (`hybridOwner: nest`) were therefore built against the legacy
base. Local `.env.local` (`VITE_API_PROVIDER=hybrid`) masked the failure.

## Correction

`frontend-app/src/lib/api/endpoint-registry.ts`:

1. Defines `NEST_ONLY_COMPLAINT_PREFIXES` for public / learner / staff complaints.
2. `isNestOnlyComplaintPath` detects those prefixes (including subpaths).
3. `resolveOwnerForPath` returns `nest` for those paths **before** the
   provider-mode short-circuit.

`http-client` already applies `resolveApiBaseUrl` per request; public
`fetch` uses `buildConforaApiUrl`. Both inherit the fix.

Legacy aliases remain on the legacy stack when canonical flag is off.
