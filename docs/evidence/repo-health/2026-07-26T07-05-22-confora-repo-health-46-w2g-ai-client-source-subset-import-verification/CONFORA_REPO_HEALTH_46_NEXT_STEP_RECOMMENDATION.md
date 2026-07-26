# CONFORA REPO HEALTH 46 — Next Step Recommendation

## Recommended next action

**`COMMIT_RH46_AI_CLIENT_IMPORT_VERIFICATION_EVIDENCE_THEN_REBASELINE_REMAINING_DEFERRED_ITEMS`**

1. Commit only this RH46 evidence folder (docs-only), when the operator chooses.
2. Then rebaseline remaining deferred items from RH44/RH45 (next SAFE_AUDIT_NEXT package, HR MJML still deferred, generated-artifact hygiene for `ai-client/src/*.{js,d.ts,map}`, RH43 still blocked).

## Why GO stands

- Import scope exact (5 files).
- Generated artifacts correctly excluded.
- Inert import + internal-gateway-only fetch.
- Secrets/PII/workflow blockers: 0.
- Typecheck and tests PASS.
- No revert indicated.

## Explicitly not recommended next

- Do **not** import `src/index.js` / `.d.ts` / `.js.map`.
- Do **not** start RH43 apps/api AI rework until canonical source is restored.
- Do **not** treat this import as production / pilot / AI-governance approval.
- Do **not** `git add packages/ai-client/` (would stage generated on-disk artifacts).

## Deferred hardening (tracked)

- Add timeout / `AbortSignal` to `invokeAiGateway` and deprecated `complete` when a real caller exists.
- Align `aiPurposeSchema` with closed `AI_PROMPT_IDS_V1` as part of gateway restoration.
- Hygiene: remove or ignore stray `src/` build outputs.
