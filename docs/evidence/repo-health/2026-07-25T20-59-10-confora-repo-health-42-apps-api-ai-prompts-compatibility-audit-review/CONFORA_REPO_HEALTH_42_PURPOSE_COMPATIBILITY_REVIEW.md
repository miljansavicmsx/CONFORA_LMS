# CONFORA REPO HEALTH 42 — Purpose Compatibility Review

## Closed prompt IDs (`packages/ai-prompts`)

`chat.educational`, `chat.support`, `question.generate`, `risk.suggest`, `default`

Note: `default` is **not** in `aiPurposeSchema` — clients cannot select it via gateway DTO.

## Full `AiPurpose` enum (`packages/ai-client`)

| Purpose | Closed prompt? |
|---------|----------------|
| `chat.educational` | Yes |
| `chat.support` | Yes |
| `question.generate` | Yes |
| `question.explain` | **No** |
| `proctoring.video` | **No** |
| `proctoring.audio` | **No** |
| `risk.suggest` | Yes |
| `analysis.exam_result` | **No** |
| `content.draft` | **No** |
| `translate.i18n` | **No** |

## non_closed_purpose_values_found

`question.explain`, `proctoring.video`, `proctoring.audio`, `analysis.exam_result`, `content.draft`, `translate.i18n`

## Can non-closed purposes reach `getPromptBundleV1`?

**Yes**, when:

1. Client calls `POST /v1/ai/invoke` with a non-closed `purpose` and omits/`[]` `messages`, or
2. Internal code invokes gateway with those purposes without `messages` (confirmed for `content.draft` and `analysis.exam_result`).

`question.explain` has **no** hardcoded internal invoke found, but remains **schema-valid** on the public invoke route.

## Expected fail-closed behavior

`getPromptBundleV1` throws `Error('Unknown prompt ID "…")`. In `AiGatewayService.invoke`, this occurs **outside** the provider `try/catch` → typically Nest **500** (not `BadRequestException`), unless a global filter maps it.

Exception: exam-engine wraps its invoke in `try/catch` and logs/skips.
