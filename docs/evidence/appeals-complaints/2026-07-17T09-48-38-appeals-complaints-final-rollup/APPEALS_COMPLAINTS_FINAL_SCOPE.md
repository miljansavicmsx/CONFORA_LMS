# APPEALS-COMPLAINTS-FINAL — Scope

## In scope (confirmed across slices 1 → 2R)

| Area | Status |
|------|--------|
| Learner foundation — separate žalba / prigovor intake | GO (`APPEALS_COMPLAINTS_1`) |
| Learner browser confirmation — tabs, labels, encoding, contact separate | GO (`APPEALS_COMPLAINTS_1R`) |
| Staff resolution UX — queues, detail, acknowledge/void, deferred B14/B15 notice | GO (`APPEALS_COMPLAINTS_2`) |
| Staff browser confirmation — admin + ISO routes, learner denial | GO (`APPEALS_COMPLAINTS_2R`) |
| API learner appeals/complaints (own cases) | Enabled |
| API staff appeals/complaints queues (acknowledge/void) | Enabled |
| Contact / support module remains separate | Confirmed |

## Explicitly out of scope / not claimed

| Area | Posture |
|------|---------|
| Full B14/B15 UI (admissibility, triage, investigation, remedy/action domain links) | Deferred (API may exist; staff UI does not execute full pipeline) |
| Appeal/complaint resolution as certification decision | Forbidden / not implemented in this module UX |
| Certificate issuance, activate/suspend/withdraw/renew/revoke | Unchanged / not mutated |
| Exam result mutation | Unchanged |
| Public verification portal changes | Unchanged |
| Reports / export changes | Unchanged |
| External pilot approval | **Not claimed** |
| Security delegate signature | **Not claimed** |
| DPO / legal signoff | **Not claimed** |
| Production or staging readiness | **Not claimed** |

## Module definition (as delivered)

Appeals & Complaints is a **governance intake and early-case-handling** surface:

- Learners submit and view **own** žalbe and prigovori.
- Staff view separate queues and may **acknowledge** or **void** cases with audit.
- Deeper formal resolution remains deferred and must not be confused with certification decisioning or certificate lifecycle.
