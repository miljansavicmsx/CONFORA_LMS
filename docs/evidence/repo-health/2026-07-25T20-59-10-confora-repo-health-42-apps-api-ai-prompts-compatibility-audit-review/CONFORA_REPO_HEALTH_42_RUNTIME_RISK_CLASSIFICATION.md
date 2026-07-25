# CONFORA REPO HEALTH 42 — Runtime Risk Classification

## Classification key

- **SAFE_CLOSED_ID** — empty messages but purpose is closed and placeholders satisfied  
- **SAFE_MESSAGES_PATH** — non-empty messages; loader not used  
- **COMPATIBILITY_RISK** — can hit fail-closed throw depending on input  
- **REWORK_REQUIRED** — known broken runtime path for intended feature  
- **NOT_RUNTIME_REACHABLE** — schema/docs only without invoke path

## Path table

| Path | Class | Notes |
|------|-------|-------|
| `buildMessages` + non-empty messages | SAFE_MESSAGES_PATH | Loader skipped |
| `/v1/ai/complete` → chat.support | SAFE_CLOSED_ID | Always closed ID |
| governance `suggestRisksFromAi` | SAFE_CLOSED_ID | `risk.suggest` + full input |
| item-bank AI generate | SAFE_CLOSED_ID | `question.generate` + placeholders |
| `/v1/ai/invoke` non-closed + empty messages | COMPATIBILITY_RISK | Includes `question.explain` |
| `/v1/ai/invoke` closed + missing placeholders | COMPATIBILITY_RISK | `fillTemplate` throw |
| course-authoring `content.draft` (×2) | REWORK_REQUIRED | No messages; loader throws |
| exam-engine `analysis.exam_result` | REWORK_REQUIRED | Throw caught → AI analysis skipped |
| `aiPurposeSchema` listing only | NOT_RUNTIME_REACHABLE as call | Becomes risk when used on invoke |
| Jest path maps / package.json | NOT_RUNTIME_REACHABLE | Wiring |

## Failure mode

| Case | Behavior |
|------|----------|
| Uncaught `getPromptBundleV1` / `fillTemplate` Error | Fail-closed at loader; **user-visible** likely as **500** (not mapped to BadRequest) |
| exam-engine catch | Controlled soft-skip; feature degraded |

## Test coverage

`ai-gateway.service.spec.ts` does **not** cover empty-messages or non-closed purpose loader failure. Existing tests use `messages` and stay on SAFE_MESSAGES_PATH.

## REWORK_REQUIRED detail

### 1. `apps/api/src/course-authoring/course-authoring.service.ts`

- Functions: `aiDraftLesson`, `draftTranscriptFromVideo`  
- Input: `purpose: 'content.draft'`, `input.user_message`, **no messages**  
- Runtime: `Unknown prompt ID "content.draft"` → propagates to caller  
- Minimal rework: supply explicit `messages[]` (system+user), **or** add closed prompt + ID (prefer apps-side messages unless new prompt is governed), **or** map purpose to closed ID only if product-approved — **do not** reopen silent default fallback in ai-prompts

### 2. `apps/api/src/exam/exam-engine.service.ts`

- Function: grade/submit path AI analysis  
- Purpose: `analysis.exam_result`, no messages  
- Runtime: throw caught; analysis skipped  
- Minimal rework: same options as above; keep try/catch until fixed

### 3. `apps/api/src/ai/ai-gateway.service.ts`

- Function: `buildMessages` / `invoke`  
- Rework: before loader, reject non-closed purposes with `BadRequestException` when messages empty; optionally validate closed placeholder requirements; map Error → 400
