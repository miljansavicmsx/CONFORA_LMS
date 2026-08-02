# 028D-2aS2R — Restore Complaint Authentication Continuity and Reproducible Validation

Corrective follow-up to independent review **NO-GO** (`AUTH_TOKEN_CONTINUITY_BROKEN`).

| Field | Value |
|-------|-------|
| Branch | `feature/028d-2as2-complaint-filing-closure` |
| Base tip | `bf70c7c362db408edae3c1cfc68ef855816fa76e` |
| Correction | `PERSISTED_AUTH_READ_BRIDGE` |
| HTTP ratification | `BOUNDED_COMPLAINT_HTTP_BRIDGE` (no new HTTP modules) |
| Branch name | `TRACEABLE_NON_BLOCKING_BRANCH_NAME_DEVIATION` (owner-accepted; not renamed) |
| Pull request | **not opened** |
| Appeals / TD-006 | unchanged / open |

## Binding outcomes

1. `getAccessToken` / `getRefreshToken` read Zustand persist key `confora-auth`.
2. Refresh/clear update the same `confora-auth` envelope only — no legacy dual-write.
3. No `authStore`, RBAC, `nest-auth-pilot`, or access-helper imports.
4. Reproducible unit validation via `npm run test:028d-2as2r` (`vitest.028d-2as2r.config.ts`).

## Verdict

`AUTH_TOKEN_CONTINUITY_RESTORED_AWAITING_INDEPENDENT_RE_REVIEW`
