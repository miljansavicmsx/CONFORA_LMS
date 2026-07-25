# CONFORA-REPO-HEALTH-39 — Next Wave Recommendation

## Recommended next action

`RH40_AI_PROMPTS_LOADER_LAZY_LOAD_AND_FILLTEMPLATE_REWORK`

### Rework goals for `src/index.ts`

1. **Lazy load** prompt JSON (no fs I/O at module import time; load on first `getPromptBundleV1` / explicit init).
2. **Harden `fillTemplate`**: purpose-scoped or global allowlist of placeholder keys; reject unknown keys; reject unresolved `{{…}}` leftovers; document plain-text (not HTML) semantics.
3. Prefer adding tests (`fillTemplate` allowlist + missing file fail-closed).
4. Keep prompt JSON content unchanged unless a governance defect appears (none found in RH39).

### Then

RH41 controlled import verification of the 9-file set (post-rework), similar to notification-templates / i18n waves.

### Do not

- Import current loader as-is.
- Import dist/node_modules.
- Expand into `ai-client` in the same wave (separate REVIEW_REQUIRED package with network/Bearer).
