# CONFORA REPO HEALTH 42 — Rework Recommendation

## recommended_next_action

`RH43_APPS_API_AI_PROMPTS_COMPATIBILITY_REWORK_EMPTY_MESSAGES_AND_NON_CLOSED_PURPOSES`

## Minimal scope (apps/api only)

1. **`ai-gateway.service.ts` `buildMessages` / `invoke`**
   - When `messages` empty/absent and purpose not in closed prompt IDs → throw `BadRequestException` (controlled 400) **before** calling `getPromptBundleV1`.
   - Optionally catch loader/template errors and map to 400.
   - Never reintroduce silent default fallback in `packages/ai-prompts`.

2. **`course-authoring.service.ts`**
   - `aiDraftLesson` / `draftTranscriptFromVideo`: pass explicit `messages[]` for `content.draft`, **or** stop using non-closed purpose until a governed prompt exists.

3. **`exam-engine.service.ts`**
   - Same for `analysis.exam_result` empty-messages invoke.

4. **Tests**
   - Add cases: non-closed + empty messages → 400; closed + missing placeholder → 400; messages path unchanged.

## Out of minimal scope

- New prompt JSON for every AiPurpose (optional later governed wave)  
- package.json / lockfile / workspace / DB / auth / frontend  
- Weakening ai-prompts fail-closed  
- HR MJML import  

## rework_required_files

- `apps/api/src/ai/ai-gateway.service.ts`
- `apps/api/src/course-authoring/course-authoring.service.ts`
- `apps/api/src/exam/exam-engine.service.ts`

Optional follow-up: `packages/ai-client/src/index.ts` (purpose enum alignment).
