# CONFORA REPO HEALTH 40 — Validation Commands

## Commands run (verification)

```text
pnpm exec tsc --noEmit -p packages/ai-prompts/tsconfig.json
→ TSC_EXIT=0 (PASS)

pnpm exec tsx --test packages/ai-prompts/src/index.test.ts
→ tests 10 / pass 10 / fail 0 (10/10 PASS)
```

## Test coverage exercised

1. Lazy load known prompt + bundle fields  
2. Unknown prompt ID fail-closed (`question.explain`)  
3. Closed ID list completeness  
4. fillTemplate allowlisted replace  
5. Missing required variable reject  
6. Triple-brace reject  
7. Unknown placeholder vs explicit allowlist  
8. Extra vars ignored  
9. `fillPromptUserTemplateV1` purpose allowlist  
10. `fillPromptUserTemplateV1` missing placeholder  

## Result

| Gate | Result |
|------|--------|
| typecheck_passed | true |
| tests_passed | true |
| test_result | 10/10 PASS |
