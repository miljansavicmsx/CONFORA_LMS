# CONFORA-REPO-HEALTH-39 — Risk Classification

| Path | Class | Rationale |
|------|-------|-----------|
| `package.json` | **IMPORT_CANDIDATE** | Manifest only; already referenced by workspace consumers |
| `tsconfig.json` | **IMPORT_CANDIDATE** | Tooling |
| `tsconfig.build.json` | **IMPORT_CANDIDATE** | Tooling |
| `prompts/v1/chat.educational.json` | **IMPORT_CANDIDATE** | Governance-sound educational prompt |
| `prompts/v1/chat.support.json` | **IMPORT_CANDIDATE** | Defers certification to staff |
| `prompts/v1/default.json` | **IMPORT_CANDIDATE** | Cautious fallback |
| `prompts/v1/question.generate.json` | **IMPORT_CANDIDATE** | Draft / PendingValidation |
| `prompts/v1/risk.suggest.json` | **IMPORT_CANDIDATE** | SME approval required before report use |
| `src/index.ts` | **REWORK_REQUIRED** | Eager fs + unscoped `fillTemplate` |
| `dist/**`, `node_modules/**`, `.turbo/**` | **DO_NOT_IMPORT** | Build/vendor noise |

No file classified **DEFER** for content malice; whole-package import is deferred only until loader rework.
