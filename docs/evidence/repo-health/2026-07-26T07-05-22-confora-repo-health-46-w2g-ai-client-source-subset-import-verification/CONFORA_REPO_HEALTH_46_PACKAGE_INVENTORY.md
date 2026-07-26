# CONFORA REPO HEALTH 46 — Package Inventory

Closed inventory of **tracked** `packages/ai-client` files after import. SHA-256 via `Get-FileHash -Algorithm SHA256`. Hashes match RH45 audit values (content-stable import).

| # | path | bytes | sha256 | role |
|---|------|------:|--------|------|
| 1 | `packages/ai-client/package.json` | 694 | `4d654e82bb15c703d088a7f269ad2bfe8df84638161e2fba8970601fd2b7035c` | Package manifest (`@confora/ai-client`, `type: module`, main/types → `./dist`, dep `zod`) |
| 2 | `packages/ai-client/tsconfig.json` | 211 | `22e1bc893dc55db17ad7a83b55be44aac14f3b314bf590c5cd7c7d7a8a4d45e9` | Typecheck config (extends `@confora/config/typescript/node-library`) |
| 3 | `packages/ai-client/tsconfig.build.json` | 205 | `6c964f9535f6358183aafec15b23ab3b9bcdee66a7447bdd3dd08e15c5bc20fc` | Build config (`outDir ./dist`, excludes tests) |
| 4 | `packages/ai-client/src/index.ts` | 5135 | `dd132522cf2d397bba668ef361b9a40ef26e2e70388730b0dceb2747e5a4e1f1` | Canonical source: purpose enum, DTO schemas, gateway client |
| 5 | `packages/ai-client/src/metadata.test.ts` | 406 | `df557883003f959c804b46fd4a13117cc51792bdf179363307b4ab2de262cb97` | Unit test for `aiMetadataSchema` |

**Tracked file count:** 5  
**package_inventory_closed:** true

## Package shape confirmation

| Aspect | Result |
|--------|--------|
| `package.json` | present (tracked) |
| `tsconfig.json` / `tsconfig.build.json` | present (tracked) |
| `src/index.ts` | present (tracked) |
| `src/metadata.test.ts` | present (tracked) |
| tracked `dist/` / `node_modules/` / `.turbo/` | **none** (dirs may exist on disk; tracked_count=0) |
| tracked generated JS / DTS / source map | **none** |

## Untracked on disk (DO_NOT_IMPORT — remain excluded)

| path | exists | tracked |
|------|:------:|:-------:|
| `packages/ai-client/src/index.d.ts` | yes | no |
| `packages/ai-client/src/index.js` | yes | no |
| `packages/ai-client/src/index.js.map` | yes | no |
| `packages/ai-client/tsconfig.build.tsbuildinfo` | yes | no |
| `packages/ai-client/dist/**` | yes | no |
| `packages/ai-client/node_modules/**` | yes | no |
| `packages/ai-client/.turbo/**` | yes | no |
