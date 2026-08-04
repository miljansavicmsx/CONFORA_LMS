# 028D-2aS5 — Correct Complaint API Routing and Restore PR #8 Validation

Corrective follow-up to PR #8 merge-readiness **NO-GO** (clean-tree routing defect).

| Field | Value |
|-------|-------|
| Branch | `feature/028d-2as2-complaint-filing-closure` |
| Starting head | `9682c0f8904edd36f6ee15d07a836b9b2f425bb8` |
| Base | `fix/ca-h01-frontend-f4-cutover` @ `4090be85a0f8e423d199610f82e3949c899cc90b` |
| PR | #8 (OPEN, Ready for Review, auto-merge off, `UNSTABLE`) |
| Defect | Canonical Nest complaint paths inherited legacy base under `VITE_API_PROVIDER=legacy` |
| Correction | Nest-only ownership for `/v1/public|learner|staff/complaints` |
| Merge | **not** performed |
| Appeals / TD-006 | unchanged / OPEN |

## Binding outcomes

1. `resolveOwnerForPath` returns `nest` for Nest-only complaint prefixes even when provider is `legacy`.
2. Legacy aliases `/v1/me/complaints` and `/v1/admin/complaints` remain legacy under legacy provider.
3. `npm run test:028d-2as2r` passes without relying on local `.env.local` hybrid override.
4. No workflow, backend, appeals, R0-7E, or TD-006 changes.

## Verdict

`COMPLAINT_API_ROUTING_CORRECTED_AWAITING_INDEPENDENT_RE_REVIEW`
