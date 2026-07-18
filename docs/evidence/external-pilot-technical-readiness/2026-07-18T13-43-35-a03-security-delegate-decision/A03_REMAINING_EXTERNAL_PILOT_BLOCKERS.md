# A-03 — Remaining External Pilot Blockers

These blockers remain **even if** technical MFA/privacy/hygiene conditions are later accepted by a signed security delegate decision.

| Blocker ID | Description | Current status |
|------------|-------------|----------------|
| `security_delegate_actual_signed_decision` | Authorized security delegate must complete and sign a decision artifact | **Open** — A-03 records PENDING only |
| `dpo_legal_signoff` | Separate DPO/legal package must be signed | **Open** — `dpo_legal_signed: false` |
| `external_pilot_gate_decision` | Explicit external pilot gate approval | **Open** — `external_pilot_approved: false` |
| `staging_or_production_validation_if_required` | Staging/production validation if program requires it before external use | **Open** — not claimed |

## Related non-approvals

| Item | Status |
|------|--------|
| Real personal data approval | `real_personal_data_approved: false` |
| Production readiness claim | `production_ready_claimed: false` |
| Staging readiness claim | `staging_ready_claimed: false` |

## What A-03 does unlock (only after a real signature)

A future **signed** ACCEPT decision may unlock **internal** security-condition acceptance for pilot continuation / gate review sequencing. It does **not** by itself:

- approve external pilot,
- approve DPO/legal,
- authorize real candidate PII,
- claim staging or production readiness.

## Next actions (human)

1. Authorized security delegate completes `A03_SIGNED_DECISION_TEMPLATE.md` (or attaches signed PDF/cert).
2. Follow-up evidence slice records real decision + `signed_artifact_path`.
3. Separately pursue DPO/legal and external pilot gate packages.
