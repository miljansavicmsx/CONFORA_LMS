# CONFORA REPO HEALTH 42 — Validation Commands

## Policy

No broad apps/api suites run (untracked module / env heavy). Static analysis + package-level closed-ID check only.

## Commands run

### 1. Baseline / inventory (git + ripgrep)

Documented in STATUS_BASELINE and CALLER_INVENTORY.

### 2. Static closed vs AiPurpose overlap

```text
pnpm exec tsx -e "<compare AI_PROMPT_IDS_V1 vs aiPurposeSchema values>"
```

Result:

- closed: chat.educational, chat.support, question.generate, risk.suggest, default  
- non_closed: question.explain, proctoring.video, proctoring.audio, analysis.exam_result, content.draft, translate.i18n  
- overlap (safe for loader when empty messages + placeholders): chat.educational, chat.support, question.generate, risk.suggest  

Exit: 0

### 3. Targeted apps/api AI gateway tests

**Not run** in this audit:

- `apps/api/src/ai/` is largely **untracked** relative to the 20 tracked `apps/api` files.
- Existing `ai-gateway.service.spec.ts` does not cover the empty-messages / non-closed loader path.
- Running Nest/Jest here would not validate the RH42 finding and risks environment coupling.

Identified targeted test file (for future RH43):  
`apps/api/src/ai/ai-gateway.service.spec.ts`

## Honesty

Validation is **static/audit-level**. Runtime Nest invoke of broken callers was not executed.
