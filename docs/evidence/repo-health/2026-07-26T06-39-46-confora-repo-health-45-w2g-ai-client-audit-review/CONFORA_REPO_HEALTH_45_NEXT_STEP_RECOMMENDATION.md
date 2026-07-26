# CONFORA REPO HEALTH 45 — Next Step Recommendation

## Recommended next action

**`RH46_CONTROLLED_IMPORT_OF_AI_CLIENT_SOURCE_SUBSET_5_FILES_EXCLUDING_GENERATED_ARTIFACTS`**

Import exactly these 5 files, staged by explicit path list:

```text
packages/ai-client/package.json
packages/ai-client/tsconfig.json
packages/ai-client/tsconfig.build.json
packages/ai-client/src/index.ts
packages/ai-client/src/metadata.test.ts
```

## Rationale

1. No rework is required — unlike `ai-prompts` at RH39, the source has no import-time I/O, no env reads, and no unsafe interpolation.
2. Nothing is activated by the import: no import-time side effects, no vendor coupling, and no tracked caller (RH43A confirmed the gateway source is absent).
3. No manifest churn: `apps/api/package.json`, the jest module mappers, and `pnpm-lock.yaml` already declare `@confora/ai-client`, so the import closes an existing tracked-tree inconsistency.
4. Clean validations: typecheck PASS, tests 1/1 PASS, secrets/PII/tenant 0/0/0, workflow-boundary blocking findings 0.

## Sequencing after RH46

| Order | Task | Note |
|------:|------|------|
| 1 | RH46 — controlled import of the 5-file subset | this recommendation |
| 2 | RH47 — import verification (commit scope, SHA-256 inventory, re-run typecheck/tests, confirm generated artifacts still untracked) | mirrors the RH41 pattern |
| 3 | Hygiene task — remove stray `src/index.js`, `src/index.d.ts`, `src/index.js.map` and/or widen ignore coverage | needs write permission; keep separate from imports |
| 4 | Continue the RH44 wave with the next `SAFE_AUDIT_NEXT` package | ordering per RH44 classification |
| 5 | Gateway wave (still blocked) — restore canonical `apps/api` AI source, then resolve `aiPurposeSchema` vs. `AI_PROMPT_IDS_V1` divergence and `fetch` timeout hardening | RH43 remains blocked per RH43A |

## Alternative considered and rejected

**Defer the whole package until the canonical `apps/api` AI source is restored.** Rejected because the package is inert on import, its dependency is already declared by tracked manifests, and having the reviewed contract under version control gives the future gateway rework a stable, audited target. Deferral would preserve the current inconsistency (tracked manifests referencing untracked source) without reducing any risk.

## Hard limits on the recommendation

RH46 would be a source-import task only. It does not activate any AI runtime path, does not unblock RH43, does not resolve the purpose/prompt-ID divergence, and carries no production, external-pilot, DPO/legal, security-delegate, accreditation, or AI-governance approval.
