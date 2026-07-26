# CONFORA REPO HEALTH 45 — Governance / Workflow Boundary Review

## Boundary checklist

| # | Prohibited behaviour | Present | Basis |
|---|----------------------|:-------:|-------|
| 1 | Autonomous certification decision | **no** | no decision function, no status transition, no persistence |
| 2 | Exam pass treated as certified status | **no** | no exam or certification status types at all |
| 3 | Certification decision treated as issuance | **no** | no decision or issuance concepts |
| 4 | `ISSUED` treated as `ACTIVE` | **no** | zero matches for `ISSUED` / `ACTIVE` in source |
| 5 | Education / certification conflation | **no** | `chat.educational` is a prompt-purpose label only; no cross-domain logic |
| 6 | Lifecycle / recertification conflation | **no** | zero matches for `recertification`; no lifecycle model |
| 7 | žalba / prigovor conflation | **no** | zero matches for `žalba` / `zalba` / `prigovor`; no appeals or complaints types |
| 8 | Tenant isolation bypass | **no** | no tenant identifiers, no tenant routing, no cross-tenant lookup |
| 9 | RBAC bypass | **no** | no role checks and no role assertions; authorization stays server-side |
| 10 | SoD bypass | **no** | no approver/reviewer role assignment or acceptance logic |
| 11 | Audit-evidence suppression | **no** | the response schema **requires** `is_ai_generated: true`, `model`, `model_version`, `prompt_hash`, `response_hash` |

`workflow_boundary_blocking_findings: 0`

## Governance-supportive properties

The package's purpose taxonomy encodes governance intent rather than overriding it:

```typescript
/** Purposes that interact with end users — disclosure must be shown (gateway enforces). */
export const USER_FACING_AI_PURPOSES: ReadonlySet<AiPurpose> = new Set([...]);

/** Stored as PendingValidation until SME / authorized acceptance (not auto-persisted to certification records). */
export const CERTIFICATION_RELEVANT_AI_PURPOSES: ReadonlySet<AiPurpose> = new Set([
  'question.generate',
  'risk.suggest',
  'analysis.exam_result',
]);
```

Both sets are declarative classifications with explicit "gateway enforces" and "PendingValidation until SME acceptance" comments. `isUserFacingAiPurpose` and `isCertificationRelevantAiPurpose` are pure predicates — they classify, they do not decide or approve.

Additional supportive properties:

- `aiGatewayInvokeRequestSchema` requires `disclosure_shown: boolean` and defaults `human_oversight_required` to `true`. A caller cannot omit disclosure, and oversight is opt-out-by-explicit-flag rather than opt-in.
- `aiMetadataSchema` fixes `isAiGenerated: z.literal(true)` — AI-generated records cannot be labelled as non-AI through this contract.
- `aiGatewayResponseSchema` fixes `is_ai_generated: z.literal(true)` and mandates prompt/response hashes, keeping traceability structurally enforced.

These are contract-level guardrails only. Actual enforcement (RBAC, tenant isolation, rate limiting, audit-event emission, reviewer workflow) must remain in the gateway service; this review makes no claim that such enforcement currently exists in tracked source, since RH43A established the gateway source is absent.

## Approval-claim check

No file in the package claims production readiness, external pilot approval, DPO/legal clearance, security-delegate sign-off, accreditation, or AI-governance approval. The single ISO reference is a scoping comment (`ISO §6.5 — no direct vendor calls`) describing the no-direct-vendor-calls constraint, not an approval assertion.

`external_pilot_claimed: false` · `security_delegate_claimed: false` · `dpo_legal_claimed: false`
