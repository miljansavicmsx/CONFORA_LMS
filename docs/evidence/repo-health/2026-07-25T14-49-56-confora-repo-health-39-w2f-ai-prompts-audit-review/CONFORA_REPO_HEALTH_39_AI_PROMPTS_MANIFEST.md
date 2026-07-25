# CONFORA-REPO-HEALTH-39 — AI Prompts Manifest

Closed manifest of **source** files under `packages/ai-prompts/**` (excluding `node_modules/`, `dist/`, `.turbo/`). All **untracked**.

| Path | Bytes | SHA-256 | Ext | Role | Runtime | Tests | Generated |
|------|------:|---------|-----|------|---------|-------|-----------|
| `package.json` | 564 | `b1f84d36cdf5e3efb62cab1be419c4e95ac215a09c2a6333dcf60e8ba9ceca08` | .json | Package manifest `@confora/ai-prompts` | none | no | no |
| `tsconfig.json` | 283 | `434b18467b5411d0746d0760b9b4099173cbd1ecefcc9fcc90930f29b2e10820` | .json | TS config | none | no | no |
| `tsconfig.build.json` | 176 | `db94b695677363efafa9645ff2ccf547a9200a426af50a0911995f9995d4ddec` | .json | Build TS config | none | no | no |
| `src/index.ts` | 1224 | `e5a2fd1d31cc1c63f94b36b729ec4d5f083f7cbecee05bd5941cbeda2e0188a4` | .ts | Loader + `fillTemplate` barrel | **eager fs read** at import; sync JSON parse | no | no |
| `prompts/v1/chat.educational.json` | 503 | `e6cc24df684550cd338a7e0896616e212e5c124f9aeb94f3c868111b466a5e98` | .json | Educational chat prompt | loaded by index | no | no |
| `prompts/v1/chat.support.json` | 328 | `87a5dd405d84d64d21f4917b0b5c200473929659cf2d7bcf87b999029c3c5285` | .json | Support chat prompt | loaded by index | no | no |
| `prompts/v1/default.json` | 319 | `190f34322a29aa626bd34d4fd6151a4237e1595f6b9b779dc8d84f29e8e88244` | .json | Fallback prompt | loaded by index | no | no |
| `prompts/v1/question.generate.json` | 426 | `09eace070524928522932d08c16c9b7512ffde3f6ea938aaca9177a4df9600b5` | .json | Item-bank draft prompt | loaded by index | no | no |
| `prompts/v1/risk.suggest.json` | 617 | `a94354dec3cce52bd91e074a4be7be6e3b927bdc694996c4e523f738be7cd9c3` | .json | QMS risk suggestion prompt | loaded by index | no | no |

**`file_count`: 9** · `manifest_closed: true`

## On-disk noise (not in source manifest; DO_NOT_IMPORT)

`packages/ai-prompts/dist/`, `node_modules/`, `.turbo/`
