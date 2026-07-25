# CONFORA REPO HEALTH 40 — Compatibility Review

## Check 32 — `getPromptBundleV1` behavior change

**Previous (RH39):** unknown purpose fell back to `default` prompt.  
**Current (RH40):** unknown purpose throws (`Unknown prompt ID "..."`).

This is intentional fail-closed hardening.

## Callers in repo (not modified)

| Location | Usage |
|----------|--------|
| `apps/api/src/ai/ai-gateway.service.ts` | `getPromptBundleV1(purpose)` + `fillTemplate(bundle.user_template, vars)` when `req.messages` is empty |
| Jest path maps / workspace dep | Resolve `@confora/ai-prompts` to local package (wiring only) |

### `AiPurpose` vs closed prompt IDs

`packages/ai-client` `aiPurposeSchema` includes purposes **without** matching prompt JSON / allowlist entries, including:

- `question.explain`
- `proctoring.video` / `proctoring.audio`
- `analysis.exam_result`
- `content.draft`
- `translate.i18n`

Closed loader IDs: `chat.educational`, `chat.support`, `question.generate`, `risk.suggest`, `default`.

**Compatibility risk (honest classification):**  
If the gateway invokes with a non-closed purpose and empty `messages[]`, runtime will throw instead of silently using `default.json`. Callers that already supply `messages` are unaffected. **Apps were not modified in RH40** (constraint). Risk is documented for a later gateway / purpose-alignment wave.

## Check 33 — Import decision still package-scoped

**Yes.** Controlled import can remain limited to `packages/ai-prompts` only. Gateway follow-up is separate and does not block package-source import verification GO.

## compatibility_risk_findings

1. `apps/api/src/ai/ai-gateway.service.ts` calls `getPromptBundleV1(purpose)` for any `AiPurpose` when `req.messages` is empty; non-closed IDs that previously fell back to `default` now throw — apps untouched; package-only import still valid; gateway alignment deferred.
