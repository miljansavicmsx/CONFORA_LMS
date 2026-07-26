# Risk Acceptance Register — R0-3 Deployment Safety Containment

**Recorded (UTC):** 2026-07-26
**Owner:** Repository owner (`miljansavicmsx`, repository administrator)
**Scope:** Only **unresolved risks explicitly accepted** as part of closing R0-3 owner decisions. Risks that are resolved, deferred to named tasks (R0-7, OQ-3), or purely restrictive controls are **not** accepted risks and are not listed here.

No acceptance in this register is permanent. Every entry carries a review date and an exit condition; acceptance lapses at the review date unless explicitly renewed in evidence.

---

## RA-R03-1 — Administrator bypass of environment protection

| Field | Value |
|-------|-------|
| Risk | `can_admins_bypass: true` on the `production` GitHub Environment: a repository administrator can bypass the required-reviewer gate on a deployment run. |
| Why not resolved now | The preferred decision (set to `false`) was not applied because changing GitHub settings was not authorized within the recording task (OD-R03-1). API state verified `true` on 2026-07-26. |
| Severity (from independent review) | HIGH |
| Current exploitability | **Effectively nil for deployment outcome today:** even a bypassed approval cannot deploy — the tracked-source preflight fails closed (`backend/` has 0 tracked files) and the empty deployment-branch allowlist (OD-R03-2) independently rejects environment deployments. |
| Compensating controls | `workflow_dispatch`-only trigger; `DEPLOY_PRODUCTION` confirmation + mandatory reason; fail-closed tracked-source preflight; deny-all branch allowlist; `prevent_self_review: true`; Actions run history and environment activity log visibility. |
| Accepted by | Repository owner, 2026-07-26 |
| Acceptance type | **Temporary** |
| Review / expiry date | **2026-08-26** (30 days), or immediately upon OQ-3 resolution or any attempt to enable production deployment — whichever comes first. |
| Exit condition | Add an independent release reviewer (distinct from the deploying admin) to the `production` Environment **and** set `can_admins_bypass` to `false`, both API-verified and evidenced, **before** production deployment is enabled. |

---

## Explicitly NOT accepted (tracked elsewhere)

The following are open items, not accepted risks:

- **Untracked `backend/` source** — blocked from the pipeline by design; resolution owned by OQ-3 (OD-R03-3).
- **Broken/stale CI workflows** — owned by R0-7 (OD-R03-4).
- **Empty deployment-branch allowlist** — an intentional restrictive control, not a risk (OD-R03-2).
- **Rollback re-arming auto-deploy** — prohibited without Security/Release acceptance per `ROLLBACK.md`; not accepted as a normal operation.
- **Repository-scoped AWS secrets (vs environment-scoped)** — hardening follow-up recommended by the independent review; not accepted as permanent, to be revisited before production deployment is enabled.
