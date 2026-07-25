# CONFORA-REPO-HEALTH-39 — Prompt Governance Review

## Prompt inventory

| Purpose | Type | Governance signals in copy |
|---------|------|----------------------------|
| `chat.educational` | system + user template | Educational only; **never** reveal live exam answers; refuse exam circumvention |
| `chat.support` | system + user template | L&D support; **do not invent policy**; **defer certification decisions to staff** |
| `question.generate` | system + user template | Output is **DRAFT**; `PendingValidation` until SME approves (ISO §6.5); must not claim approved |
| `risk.suggest` | system + user template | AI-proposed risks need **`sme_approved`** before counting in reports (§4.3.7 / §10.6) |
| `default` | fallback | Operate under ISO/IEC 17024 AI governance; cautious; flag uncertainty |

## Weakening checks

| Control | Weakened by prompts? |
|---------|----------------------|
| Tenant isolation | **no** (no cross-tenant instructions) |
| RBAC / SoD | **no** |
| Audit evidence | **no** (risk prompt expects monitoring context vars; does not suppress evidence) |
| Privacy / PII | **no** hardcoded PII; templates use placeholders only |
| Certification decision independence | **reinforced** (support defers to staff; drafts not approved) |
| Complaint / appeal separation | **no** conflation (risk template uses `complaints_by_subject` as data slot name only) |
| Education / certification boundaries | **reinforced** (educational vs support vs draft items vs QMS risks) |

## Forbidden implication checks

| Claim | Present? |
|-------|----------|
| Production / external pilot / DPO / security / accreditation approval | **no** |
| AI autonomous certification decisions | **no** (explicitly deferred / draft / SME) |
| AI replacing competent human decision-makers | **no** |
| Exam pass = certified | **no** |
| ISSUED = ACTIVE | **no** |
| Lifecycle = recertification | **no** |
| Contact = complaint/appeal | **no** |

`prompt_governance_blocking_findings: 0` · `workflow_boundary_blocking_findings: 0`
