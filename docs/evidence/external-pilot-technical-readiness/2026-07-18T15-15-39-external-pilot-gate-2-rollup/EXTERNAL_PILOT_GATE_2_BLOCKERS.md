# EXTERNAL-PILOT-GATE-2 — Blockers

## Remaining blockers (authoritative for summary.json)

| Blocker ID | Description | Owner | Status |
|------------|-------------|-------|--------|
| `security_delegate_actual_signed_decision` | Complete and sign A-03 (or successor) | Security delegate | **Open** |
| `dpo_legal_actual_signed_decision` | Complete and sign DPO-LEGAL-2 (or successor) | DPO / legal | **Open** |
| `external_pilot_gate_decision` | Explicit external pilot approval after signed gates | Program / gate owners | **Open** — GATE-2 is NO-GO |
| `staging_or_production_validation_if_required` | Staging/production validation if program requires it | Ops / security | **Open** — not claimed |

## Dependent / related non-approvals

| Item | Status |
|------|--------|
| Real personal data approval | `real_personal_data_approved: false` |
| Security delegate signed | `security_delegate_signed: false` |
| DPO/legal signed | `dpo_legal_signed: false` |
| External pilot approved | `external_pilot_approved: false` |
| Production ready claimed | `production_ready_claimed: false` |
| Staging ready claimed | `staging_ready_claimed: false` |

## What is not a blocker for continuing internal technical work

- Appeals & Complaints module GO (local/governance evidence only).
- Existence of A-03 / DPO-LEGAL-2 packages (they enable signing; they do not unblock external pilot until signed and a gate decision is recorded).

## Closure rule

External pilot remains **NO-GO** until at minimum:

1. Security delegate signed decision is recorded, and  
2. DPO/legal signed decision is recorded, and  
3. An explicit external pilot gate decision is recorded, and  
4. Any required staging/production validation is evidenced if the program requires it.
