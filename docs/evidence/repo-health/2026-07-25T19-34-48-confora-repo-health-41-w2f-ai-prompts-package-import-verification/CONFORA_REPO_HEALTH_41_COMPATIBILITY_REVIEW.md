# CONFORA REPO HEALTH 41 — Compatibility Review

## Callers re-checked (not modified)

| Location | Usage |
|----------|--------|
| `apps/api/src/ai/ai-gateway.service.ts` | `getPromptBundleV1(purpose)` + `fillTemplate(...)` when `req.messages` is empty |
| `packages/ai-client` | `aiPurposeSchema` includes purposes beyond closed prompt IDs |

## Known compatibility risk

`AiPurpose` includes values without matching closed prompt IDs / JSON files, including:

- `question.explain`
- `proctoring.video` / `proctoring.audio`
- `analysis.exam_result`
- `content.draft`
- `translate.i18n`

Closed loader IDs: `chat.educational`, `chat.support`, `question.generate`, `risk.suggest`, `default`.

**Behavior change (intentional fail-closed):** unknown purposes throw instead of silently falling back to `default.json`.

## Classification

| Question | Answer |
|----------|--------|
| Blocks package import verification GO? | **No** — package remains fail-closed; apps not modified in this task |
| Requires apps/api follow-up before runtime activation? | **Yes** — separate compatibility task |

**compatibility_risk_blocks_package_import:** false  
**requires_apps_api_followup:** true

Finding recorded:

> apps/api AI gateway may pass non-closed AiPurpose values such as question.explain when messages is empty; must be handled in a separate apps/api compatibility task before runtime activation
