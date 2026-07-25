# CONFORA REPO HEALTH 43A — Next Step Recommendation

## recommended_next_action

`BLOCK_RH43_REWORK_UNTIL_CANONICAL_APPS_API_AI_SOURCE_IS_IMPORTED_OR_RESTORED`

## Guidance

1. Do **not** start RH43 patching against missing paths or against `dist`/coverage.  
2. Plan a separate controlled wave to locate/restore/import canonical `apps/api` AI modules (and related course-authoring/exam callers) with evidence — treat as untracked/historical until imported.  
3. After canonical source is tracked (or intentionally restored on disk and audited), re-run compatibility review (RH42-class) then RH43 rework.  
4. Keep `packages/ai-prompts`; do not revert.  
5. Leave HR MJML deferred; do not delete dist/coverage in this wave unless a dedicated cleanup task says so.  

## Not claimed

No production, pilot, DPO/legal, security-delegate, accreditation, or AI governance approval.
