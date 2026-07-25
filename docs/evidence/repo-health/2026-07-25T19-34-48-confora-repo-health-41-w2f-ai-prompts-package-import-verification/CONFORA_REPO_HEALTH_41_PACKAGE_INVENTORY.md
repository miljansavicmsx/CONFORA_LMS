# CONFORA REPO HEALTH 41 — Package Inventory

Tracked `packages/ai-prompts` files at HEAD `fd12b4ee` (post-import). SHA-256 via `Get-FileHash -Algorithm SHA256`.

| path | bytes | sha256 | role |
|------|------:|--------|------|
| `packages/ai-prompts/package.json` | 564 | `b1f84d36cdf5e3efb62cab1be419c4e95ac215a09c2a6333dcf60e8ba9ceca08` | package manifest |
| `packages/ai-prompts/tsconfig.json` | 283 | `434b18467b5411d0746d0760b9b4099173cbd1ecefcc9fcc90930f29b2e10820` | typecheck config |
| `packages/ai-prompts/tsconfig.build.json` | 176 | `db94b695677363efafa9645ff2ccf547a9200a426af50a0911995f9995d4ddec` | build config |
| `packages/ai-prompts/src/index.ts` | 7144 | `fdd6b6cc0dfe02d012e54e0ad43205fae845cd081c320fe00989bbade9052e6f` | RH40 lazy loader + fillTemplate |
| `packages/ai-prompts/src/index.test.ts` | 2405 | `736e24281d7f377d44cac0175dcd1ca7cce88c154eee619be0b1bfddd7fec127` | fail-closed unit tests |
| `packages/ai-prompts/prompts/v1/chat.educational.json` | 503 | `e6cc24df684550cd338a7e0896616e212e5c124f9aeb94f3c868111b466a5e98` | prompt bundle |
| `packages/ai-prompts/prompts/v1/chat.support.json` | 328 | `87a5dd405d84d64d21f4917b0b5c200473929659cf2d7bcf87b999029c3c5285` | prompt bundle |
| `packages/ai-prompts/prompts/v1/default.json` | 319 | `190f34322a29aa626bd34d4fd6151a4237e1595f6b9b779dc8d84f29e8e88244` | prompt bundle |
| `packages/ai-prompts/prompts/v1/question.generate.json` | 426 | `09eace070524928522932d08c16c9b7512ffde3f6ea938aaca9177a4df9600b5` | prompt bundle |
| `packages/ai-prompts/prompts/v1/risk.suggest.json` | 617 | `a94354dec3cce52bd91e074a4be7be6e3b927bdc694996c4e523f738be7cd9c3` | prompt bundle |

## Shape checks

| Expectation | Result |
|-------------|--------|
| package.json + 2 tsconfigs + src + test + 5 prompts | **PASS** (10) |
| No tracked `dist` / `node_modules` / `.turbo` | **PASS** |
| `git ls-files packages/ai-prompts` count | **10** |

**package_inventory_closed:** true  
**dist_node_modules_turbo_tracked:** false
