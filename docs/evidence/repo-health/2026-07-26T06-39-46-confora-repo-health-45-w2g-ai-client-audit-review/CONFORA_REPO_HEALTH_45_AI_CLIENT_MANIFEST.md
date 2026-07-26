# CONFORA REPO HEALTH 45 — packages/ai-client Manifest (closed)

All files are **untracked** (`git ls-files packages/ai-client` = 0). SHA-256 via `Get-FileHash -Algorithm SHA256`.

## In-scope files (9)

| # | path | bytes | sha256 | ext | inferred role | imports / exports | runtime behaviour | test | generated |
|---|------|------:|--------|-----|---------------|-------------------|-------------------|:----:|:---------:|
| 1 | `packages/ai-client/package.json` | 694 | `4d654e82bb15c703d088a7f269ad2bfe8df84638161e2fba8970601fd2b7035c` | .json | package manifest (`@confora/ai-client`, `type: module`, main/types → `./dist`) | dep `zod`; devDeps `@confora/config`, `@types/node`, `eslint`, `tsx`, `typescript` | none (metadata) | declares `test` script | no |
| 2 | `packages/ai-client/tsconfig.json` | 211 | `22e1bc893dc55db17ad7a83b55be44aac14f3b314bf590c5cd7c7d7a8a4d45e9` | .json | typecheck config (extends `@confora/config/typescript/node-library`, `composite: true`) | extends only | none | no | no |
| 3 | `packages/ai-client/tsconfig.build.json` | 205 | `6c964f9535f6358183aafec15b23ab3b9bcdee66a7447bdd3dd08e15c5bc20fc` | .json | build config (`outDir ./dist`, excludes tests) | extends `./tsconfig.json` | none | no | no |
| 4 | `packages/ai-client/src/index.ts` | 5135 | `dd132522cf2d397bba668ef361b9a40ef26e2e70388730b0dceb2747e5a4e1f1` | .ts | **canonical source**: AI purpose enum, DTO schemas, gateway client | imports `zod`; exports schemas/types/2 helpers/2 client functions | `fetch` to internal `/v1/ai/invoke` and `/v1/ai/complete` **only when called** | no | no |
| 5 | `packages/ai-client/src/metadata.test.ts` | 406 | `df557883003f959c804b46fd4a13117cc51792bdf179363307b4ab2de262cb97` | .ts | unit test for `aiMetadataSchema` | imports `./index.js`, `node:test`, `node:assert/strict` | in-memory schema parse | **yes** | no |
| 6 | `packages/ai-client/src/index.d.ts` | 5000 | `e15e2f5f3b6c5d21eca61d8263f32a97bb072ee7dbf9e678c2b51e38305758da` | .ts | **compiled declaration of #4, emitted into `src/`** | mirrors #4 | n/a | no | **YES** |
| 7 | `packages/ai-client/src/index.js` | 4599 | `8b11e8d13b2e45a232fa328dbdef7926f9ba69eac5caa207ca35d436e38f7265` | .js | **compiled JS of #4, emitted into `src/`** | CJS-style compiled output | duplicate `fetch` logic | no | **YES** |
| 8 | `packages/ai-client/src/index.js.map` | 3991 | `994c1d40e60feade917f2a61c961c2aad49c78d0b823af9a4c2c4e287b20e480` | .map | source map for #7 | n/a | n/a | no | **YES** |
| 9 | `packages/ai-client/tsconfig.build.tsbuildinfo` | 40905 | `455cd5fcde0f488e2bba9329ff88e6bf916062425056a0489d9f1d5633cccdd0` | .tsbuildinfo | incremental build state | n/a | n/a | no | **YES** (gitignored: `*.tsbuildinfo`) |

## Excluded (ignored) directories

| Path | Files | Bytes | Ignore rule |
|------|------:|------:|-------------|
| `packages/ai-client/dist` | 3 | 11,416 | `.gitignore:58 packages/**/dist/` |
| `packages/ai-client/node_modules` | 15 | 20,245 | `.gitignore:3 **/node_modules/` |
| `packages/ai-client/.turbo` | 4 | 739 | `.gitignore:35 .turbo/` |

## Public export surface (from `src/index.ts`)

Schemas: `aiPurposeSchema`, `aiMetadataSchema`, `aiGatewayResponseSchema`, `aiGatewayInvokeRequestSchema`, `completionRequestSchema`
Constants: `USER_FACING_AI_PURPOSES`, `CERTIFICATION_RELEVANT_AI_PURPOSES`
Helpers: `isUserFacingAiPurpose`, `isCertificationRelevantAiPurpose`
Clients: `invokeAiGateway`, `createAiGatewayClient` (deprecated)
Types: `AiPurpose`, `AiRecordMetadata`, `AiGatewayResponse`, `AiGatewayInvokeRequest`, `AiCompletionRequest`, `AiGatewayClientConfig`

**manifest_closed:** true · **file_count (in scope):** 9
