# Lint / format / test config review

| Config | Present | Aligns with |
|--------|:-------:|-------------|
| `eslint.config.mjs` | true | Root lint |
| `prettier.config.cjs` + `.prettierignore` | true / true | `pnpm format` |
| `commitlint.config.cjs` | true | husky commit-msg |
| `.editorconfig` | true | Editor consistency |
| `.lighthouserc.json` | true | `a11y:lighthouse` |
| `turbo.json` | yes | `build/dev/lint/typecheck/test` tasks |
| `test-all.ps1` / `test-all.sh` | yes | Legacy Playwright+FastAPI local runners |

## Consistency notes

- Husky + lint-staged + typecheck + prettier/eslint/commitlint form a coherent **pnpm** quality gate.
- `test-all.*` are optional local wrappers; not required for monorepo turbo CI — **review before tracking**.

## Classification

Track now: eslint/prettier/commitlint/editorconfig/lighthouserc/turbo.  
Review: test-all scripts.
