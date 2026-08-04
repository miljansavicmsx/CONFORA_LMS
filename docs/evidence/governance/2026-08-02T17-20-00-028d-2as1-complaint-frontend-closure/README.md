# 028D-2aS1 — Minimal Complaint Frontend Dependency Closure and Source Authority

Planning-only / evidence-only. **No source promotion. No complaint form implementation.**

| Field | Value |
|-------|-------|
| Branch | `governance/r0-028d-2as1-complaint-frontend-closure` |
| Integration tip | `4090be85a0f8e423d199610f82e3949c899cc90b` |
| Stopped impl branch | `feature/028d-2ar-candidate-complaint-filing` @ same tip |
| Stopped classification | `STOPPED_PRE_FLIGHT_NO_IMPLEMENTATION_NOT_PR_ELIGIBLE` |
| Rejected D2 tip (inspect-only) | `13cdd75280206ec00587e5455b7c76bf7d75e269` |
| Rejected S2 tip (inspect-only) | `fda8d363ceccabd16403f20f4caf5ffc3e530832` |
| Rejected classification | `REJECTED_EXPERIMENTAL_NOT_PR_ELIGIBLE` |
| TD-006 | Remains **open** (unchanged) |
| Pull request | **not opened** |

## Binding outcomes

1. Integration `frontend-app` tracks complaint UI/client seeds but their import graph is incomplete (`FRONTEND_APP_OPERATIONAL_GRAPH_INCOMPLETE` confirmed).
2. Do **not** invent a second HTTP client, API provider, auth stack, UI kit, or grievance framework.
3. Preferred inspect tip for missing modules: rejected **D2** (`13cdd752…`) — more complete for complaint-specific files than S2.
4. Naive honest closure from D2 (complaint seeds, appeal dialog skipped) requires **~40** path-checkouts; **~18** of those are RBAC/access modules pulled through `nest-auth-pilot` / `iso-navigation-access`, not complaint domain.
5. Appeals remain out of scope; TD-006 stays open; sequence to 028D-2b unchanged.

## Verdict

`READY_FOR_OWNER_SCOPE_AUTHORIZATION`

Owner must choose a promote strategy before any 028D-2aR restart (see `architecture_decision.md`).
