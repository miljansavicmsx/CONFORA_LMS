# CONFORA REPO HEALTH 41 — Prompt Governance Review

Reviewed all five tracked prompt JSON files under `packages/ai-prompts/prompts/v1/`.

| Governance check | Result |
|------------------|--------|
| No autonomous certification decision claims | **PASS** |
| No AI replaces competent human decision-maker claim | **PASS** |
| No exam pass equals certified status | **PASS** |
| No certification decision equals issuance | **PASS** |
| No ISSUED equals ACTIVE | **PASS** |
| No education/certification conflation | **PASS** |
| No žalba/prigovor conflation | **PASS** |
| No tenant/RBAC/SoD bypass | **PASS** |
| No production/external pilot/DPO/legal/security/accreditation approval claim | **PASS** |

## Notes

- `chat.support`: explicitly defers certification decisions to staff.
- `chat.educational`: refuses live exam answers; educational assistant only.
- `question.generate`: draft only / PendingValidation until SME approval.
- `risk.suggest`: AI-proposed risks require `sme_approved` before counting in reports.
- `default`: cautious assistant under ISO/IEC 17024 AI governance language; not a workflow bypass.

**prompt_governance_blocking_findings:** 0
