# CONFORA REPO HEALTH 42 — Summary

**Task:** apps/api AI Prompts Compatibility Audit-Only Review  
**Mode:** Audit / report only (no apps/api or package edits)  
**Branch:** `fix/ca-h01-frontend-f4-cutover`  
**HEAD:** `d15bd2d3`  
**Evidence:** `docs/evidence/repo-health/2026-07-25T20-59-10-confora-repo-health-42-apps-api-ai-prompts-compatibility-audit-review/`

## Verdict

**CONFORA_REPO_HEALTH_42_APPS_API_COMPATIBILITY_AUDIT_READY_FOR_REVIEW**

`packages/ai-prompts` import remains valid and must **not** be reverted. Compatibility gap is real: empty-`messages` paths call `getPromptBundleV1(purpose)` for the full `AiPurpose` enum, including six non-closed IDs. Hardcoded runtime callers for `content.draft` and `analysis.exam_result` without messages are **REWORK_REQUIRED**.

## Headline findings

| Item | Result |
|------|--------|
| Sole `getPromptBundleV1` caller | `ai-gateway.service.ts` `buildMessages` |
| `fillPromptUserTemplateV1` callers | none |
| `messages` empty path | **exists** |
| Non-closed purposes | 6 (including `question.explain`) |
| Package fail-closed | must be preserved |
| Fix location | apps/api (optional ai-client enum align later) |

## Recommended next action

`RH43_APPS_API_AI_PROMPTS_COMPATIBILITY_REWORK_EMPTY_MESSAGES_AND_NON_CLOSED_PURPOSES`
