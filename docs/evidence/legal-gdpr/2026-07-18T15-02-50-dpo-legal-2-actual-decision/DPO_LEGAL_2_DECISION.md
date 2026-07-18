# DPO-LEGAL-2 — Decision

| Field | Value |
|-------|-------|
| Task | `DPO_LEGAL_2_ACTUAL_DECISION` |
| Based on | `969f780` + DPO-LEGAL-SIGNOFF-1 package |
| `dpo_legal_signed` | **false** |
| `dpo_legal_decision` | **PENDING** |
| `signed_artifact_path` | **null** |
| Final verdict | `DPO_LEGAL_2_DECISION_PENDING` |

## Why PENDING

Per decision rules: **no explicit signed DPO/legal artifact** and **no operator-entered DPO/legal decision** exist in the repository after reviewing DPO-LEGAL-SIGNOFF-1 and related security/module evidence.

Therefore this package **must not** record APPROVE, DEFER, or REJECT as if approved.

## Allowed decisions (catalog for future signed use)

| # | Decision code | Meaning |
|---|---------------|---------|
| 1 | `APPROVE_INTERNAL_PILOT_ONLY_NO_REAL_PERSONAL_DATA` | Approve internal/synthetic pilot posture only; real personal data remains blocked |
| 2 | `APPROVE_WITH_CONDITIONS_FOR_EXTERNAL_PILOT_GATE_REVIEW` | Approve with written conditions for external pilot **gate review** sequencing; does **not** equal external pilot approval |
| 3 | `DEFER_PENDING_DPIA_RETENTION_DSR_PROCESSORS` | Defer until DPIA / retention / DSR / processor gaps are closed |
| 4 | `DEFER_PENDING_SECURITY_DELEGATE_SIGNOFF` | Defer until A-03 (or successor) is actually signed |
| 5 | `REJECT_PENDING_REMEDIATION` | Reject until remediation |

**Selected decision now:** none — **PENDING**.

## Mapping from DPO-LEGAL-SIGNOFF-1 template language

DPO-LEGAL-SIGNOFF-1 used slightly different option labels. The DPO-LEGAL-2 catalog above is authoritative for this decision record. When signing, use DPO-LEGAL-2 codes in `DPO_LEGAL_2_SIGNED_DECISION_TEMPLATE.md`.

## Parallel gate: security delegate

A-03 remains `A03_SECURITY_DELEGATE_DECISION_PENDING`. Even a future DPO/legal APPROVE does **not** invent a security delegate signature.

## Non-effects of this PENDING package

Even after a future APPROVE decision (if signed):

- External pilot remains unapproved unless a separate gate decision says otherwise.
- Real personal data remains unapproved unless explicitly authorized in the signed decision.
- Security delegate, staging, and production remain separate gates.
