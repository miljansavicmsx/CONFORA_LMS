# CONFORA-REPO-HEALTH-39 — Minimal Import Candidate

## This audit

**No import.** `minimal_first_import_candidate: []`

## After RH40 loader rework (recommended first import set)

Exactly these **9** source files (still no dist/node_modules):

1. `packages/ai-prompts/package.json`
2. `packages/ai-prompts/tsconfig.json`
3. `packages/ai-prompts/tsconfig.build.json`
4. `packages/ai-prompts/src/index.ts` *(post-rework)*
5. `packages/ai-prompts/prompts/v1/chat.educational.json`
6. `packages/ai-prompts/prompts/v1/chat.support.json`
7. `packages/ai-prompts/prompts/v1/default.json`
8. `packages/ai-prompts/prompts/v1/question.generate.json`
9. `packages/ai-prompts/prompts/v1/risk.suggest.json`

## Optional with import

- Add unit tests for allowlisted `fillTemplate` + lazy load (new files → separate verification)

## Guardrails

- Do not change root package.json / lockfile / workspace for this import (already wired).
- Do not import `dist/`, `node_modules/`, `.turbo/`.
- Do not claim AI governance / accreditation approval from import alone.
