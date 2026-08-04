# Architecture — PERSISTED_AUTH_READ_BRIDGE

## Defect

Slimmed `auth-token-provider` read legacy keys `confora_access_token` /
`confora_refresh_token`. Login persists under Zustand key `confora-auth`.
Nothing wrote the legacy keys → complaint HTTP calls lacked Authorization.

## Correction

`frontend-app/src/lib/api/auth-token-provider.ts` now:

1. **Reads** `localStorage["confora-auth"]` Zustand persist envelope
   (`state.accessToken` / `state.refreshToken`).
2. **Updates** the same envelope on refresh (`setAccessToken` / `setTokens`)
   and clear (`clearTokens`).
3. **Does not** write legacy dual-storage keys.
4. **Does not** import `authStore`, JWT/RBAC helpers, or `nest-auth-pilot`.

Persistence schema evidence inspected from rejected D2 tip
`13cdd752…` (`name: "confora-auth"`, partialized `accessToken` /
`refreshToken`) without merging that branch.

## Bounded HTTP bridge

No new `http-client` / `api-provider` / `api-error` / `auth-refresh` modules
were added. Existing S2 complaint graph remains the sole HTTP bridge under
`BOUNDED_COMPLAINT_HTTP_BRIDGE`.
