# CONFORA REPO HEALTH 44 — Next Wave Recommendation

## recommended_next_action

`SAFE_AUDIT_NEXT_PACKAGES_AI_CLIENT_KEEP_RH43_BLOCKED_UNTIL_APPS_API_AI_SOURCE_IMPORT`

## Sequence

1. **RH45 (suggested):** Audit-only review of untracked `packages/ai-client` (purpose enum vs closed prompt IDs; no import yet; no apps/api patch).  
2. Keep **RH43 blocked** until a separate evidence wave imports/restores canonical `apps/api` AI (and related) TypeScript source — never patch from `dist`.  
3. Later: architecture **REVIEW_REQUIRED** for `packages/database` before any controlled import.  
4. Leave README stubs (`ai-governance`, `audit`, `auth`, `types`) and HR MJML **deferred**.  
5. Keep all nine closed packages; **do not revert** `packages/ai-prompts`.

## Explicit non-goals for next wave

- No `git add .`
- No HR MJML import
- No dist/coverage cleanup required for next audit (optional dedicated cleanup later)
- No production/pilot/DPO/security-delegate claims
