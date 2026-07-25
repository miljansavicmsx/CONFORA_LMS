# CONFORA REPO HEALTH 40 — Next Step Recommendation

## recommended_next_action

`COMMIT_RH40_REWORKED_AI_PROMPTS_SOURCE_AFTER_REVIEW`

## Guidance

1. Controlled commit/import of `packages/ai-prompts` source only (post-review).
2. Intended import set remains ~9 source files (package.json, tsconfigs, `src/index.ts`, 5 prompt JSON); include `src/index.test.ts` if tests are part of the import policy.
3. **DO_NOT_IMPORT:** `dist/**`, `node_modules/**`, `.turbo/**`.
4. Do not modify apps in the same commit wave unless intentionally addressing gateway compatibility.
5. Separate follow-up: align `AiGatewayService` / `AiPurpose` with closed prompt IDs (or require `messages[]` for non-closed purposes) so fail-closed loader does not surprise callers that previously relied on `default` fallback.

## Not claimed

No production readiness, external pilot, DPO/legal, security-delegate, accreditation, or AI governance approval.
