# CONFORA REPO HEALTH 42 — Caller Inventory

## Direct `@confora/ai-prompts` imports

| File | Imports | Runtime use |
|------|---------|-------------|
| `apps/api/src/ai/ai-gateway.service.ts` | `getPromptBundleV1`, `fillTemplate` | Only inside `buildMessages` when `messages` empty/absent |
| Jest configs (`jest*.cjs`) | path map to package `src/index.ts` | Test wiring only |
| `apps/api/package.json` | workspace dep | Declared dependency |

**`fillPromptUserTemplateV1`:** no apps/api callers.

## `getPromptBundleV1` call sites

1. `apps/api/src/ai/ai-gateway.service.ts` → function `buildMessages(purpose, req)` line ~56.

## Gateway entry points that can reach `buildMessages`

| Entry | File | How purpose/messages arrive |
|-------|------|-----------------------------|
| `POST /v1/ai/invoke` | `ai.controller.ts` `invoke` | Zod `aiGatewayInvokeRequestSchema`: `purpose` required; `messages` optional; `input` optional |
| `POST /v1/ai/complete` | `ai.controller.ts` `complete` | Forces `purpose: 'chat.support'`; no `messages`; spreads `input` |
| `AiGatewayService.invoke` | service | Used by controller + internal services |

## Internal `AiGatewayService.invoke` callers (purpose selection)

| File | Function | Purpose | messages |
|------|----------|---------|----------|
| `course-authoring.service.ts` | `aiDraftLesson` | `content.draft` | **absent** |
| `course-authoring.service.ts` | `draftTranscriptFromVideo` | `content.draft` | **absent** |
| `exam-engine.service.ts` | submit/grade path | `analysis.exam_result` | **absent** |
| `governance.service.ts` | `suggestRisksFromAi` | `risk.suggest` | absent; placeholders in `input` |
| `exam-item-bank/item-bank.service.ts` | AI generate | `question.generate` | absent; `blueprint`/`constraints` in `input` |

## Related (not prompt-loader callers)

| File | Role |
|------|------|
| `ai-provider.routing.ts` | Maps every `AiPurpose` → provider; network when keys set |
| `packages/ai-client` | `aiPurposeSchema` / DTO |
| `lms-me.service.ts` | Mentions `analysis.exam_result` in copy only |

**caller_inventory_closed:** true
