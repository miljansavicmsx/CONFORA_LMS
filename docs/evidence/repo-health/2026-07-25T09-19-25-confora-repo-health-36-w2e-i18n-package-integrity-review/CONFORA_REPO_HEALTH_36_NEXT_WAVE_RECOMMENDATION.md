# CONFORA-REPO-HEALTH-36 — Next Wave Recommendation

## Import applicability

Source/test import is **not applicable** — `packages/i18n` is already fully tracked (50 files). No new import.

## Recommended next action

`RH37_I18N_LOCALE_PARITY_AND_LOCALIZATION_REWORK` — an **optional cleanup/rework wave** (in-place edits to already-tracked locale JSON), addressing:

1. **F1 (priority):** remove/reconcile extra `items.appealsComplaints` key in `navigation.{bs,sr,sl}` (or add to EN canonical if intended) so the package's own parity test passes.
2. **F2–F5:** complete localization for `common.{bs,sl,sr}`, `common.hr` residual, `dashboard.{bs,sr}` + shared English residuals, `candidatePortal.{bs,sl,sr}` governance notice.
3. **F6–F7:** confirm intent (brand badge; bs≡sr) or localize.

### Rework guardrails

- Locale JSON edits only; **no** `package.json`/lock/workspace/DB/auth/apps changes.
- Re-run `pnpm exec tsc --noEmit -p packages/i18n/tsconfig.json` and `pnpm exec jest --config packages/i18n/jest.config.cjs` → expect **0 failures** as GO.
- Preserve workflow boundaries (žalba≠prigovor, ISSUED≠ACTIVE, education≠exam≠certification).

## Alternative

If localization rework is deferred to a translation owner, **continue to the next package** (RH35 queue → `ai-prompts` REVIEW_REQUIRED audit). `packages/i18n` may remain tracked as-is (security-safe) with F1–F5 logged as known localization debt.
