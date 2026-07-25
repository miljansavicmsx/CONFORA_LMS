# CONFORA REPO HEALTH 42 — Messages Path Review

## `buildMessages` logic

```text
if (req.messages && req.messages.length > 0)
  → use caller messages; NEVER call getPromptBundleV1 / fillTemplate
else
  → getPromptBundleV1(purpose)
  → fillTemplate(bundle.user_template, inputToTemplateVars(req.input))
```

## messages_empty_path_exists

**true** — both HTTP and internal callers omit `messages`.

## SAFE_MESSAGES_PATH examples

- Unit tests in `ai-gateway.service.spec.ts` always supply `messages`.
- Any client that sends non-empty `messages` bypasses the prompt loader entirely.

## Empty-messages + closed ID

| Caller | Purpose | Placeholder coverage | Class |
|--------|---------|----------------------|-------|
| `/v1/ai/complete` | `chat.support` | `user_message` always set (may be `''`) | SAFE_CLOSED_ID |
| `suggestRisksFromAi` | `risk.suggest` | all three placeholders supplied | SAFE_CLOSED_ID |
| item-bank generate | `question.generate` | `blueprint`, `constraints` supplied | SAFE_CLOSED_ID |
| Generic invoke | `chat.educational` | needs `context` + `user_message` | COMPATIBILITY_RISK if `context` missing |

## Empty-messages + non-closed ID

| Caller | Purpose | Class |
|--------|---------|-------|
| `aiDraftLesson` / `draftTranscriptFromVideo` | `content.draft` | REWORK_REQUIRED |
| exam grade AI analysis | `analysis.exam_result` | REWORK_REQUIRED (soft-caught) |
| `/v1/ai/invoke` arbitrary client | any of 6 non-closed | COMPATIBILITY_RISK |

## DTO fields

`aiGatewayInvokeRequestSchema`: `purpose`, optional `messages`, optional `input`, `disclosure_shown`, optional resource/oversight fields.
