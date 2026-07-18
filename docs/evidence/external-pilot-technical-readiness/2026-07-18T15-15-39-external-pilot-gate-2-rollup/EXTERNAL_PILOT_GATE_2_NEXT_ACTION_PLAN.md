# EXTERNAL-PILOT-GATE-2 — Next Action Plan

Ordered actions. Do not skip to external pilot.

## Immediate (human gates)

| Step | Action | Artifact | Done when |
|------|--------|----------|-----------|
| 1 | Security delegate signs A-03 decision | `A03_SIGNED_DECISION_TEMPLATE.md` or attached signed artifact | Follow-up evidence records `security_delegate_signed: true` + decision code |
| 2 | DPO/legal signs DPO-LEGAL-2 decision | `DPO_LEGAL_2_SIGNED_DECISION_TEMPLATE.md` or attached signed artifact | Follow-up evidence records `dpo_legal_signed: true` + decision code |
| 3 | Re-run external pilot gate rollup | New GATE-3 (or GATE-2-R) evidence folder | Reflects signed statuses honestly |

## After both signatures (still not automatic GO)

| Step | Action | Note |
|------|--------|------|
| 4 | Evaluate real personal data authorization | Only if DPO/legal decision explicitly authorizes it; default remains no |
| 5 | Close residual DPIA / DSR / retention / processor conditions if deferred | Per DPO-LEGAL-2 conditions |
| 6 | Explicit external pilot gate decision | Separate evidence; do not infer from A-03/DPO alone |
| 7 | Staging/production validation if required | Separate evidence; do not claim until done |

## Parallel (does not unlock external pilot)

| Action | Allowed? |
|--------|:--------:|
| Continue local/synthetic technical development | Yes |
| Continue module evidence under Baseline | Yes |
| Fabricate signatures to unblock schedule | **No** |
| Commit secrets / TOTP / tokens | **No** |

## Stop conditions

Stop and keep NO-GO if either A-03 or DPO-LEGAL-2 remains PENDING, or if any signed decision is REJECT / hard DEFER without remediation evidence.
