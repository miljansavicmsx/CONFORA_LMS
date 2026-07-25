# CONFORA-REPO-HEALTH-35 — Validation Recommendation

For recommended next task **RH36 — packages/i18n integrity review**:

## Suggested commands (do not run as RH35; document for RH36)

```text
pnpm exec tsc --noEmit -p packages/i18n/tsconfig.json
pnpm --filter @confora/i18n test
# or:
pnpm exec jest --config packages/i18n/jest.config.cjs --runInBand
```

## Audit checks RH36 should perform

1. Closed manifest of all 50 tracked files (bytes + SHA-256).
2. Locale completeness / no silent EN-as-HR for critical namespaces.
3. Workflow boundary scan of locale strings (žalba ≠ prigovor, exam ≠ certified, etc.).
4. Secret/URL/network scan of src + locales.
5. Confirm `escapeValue` / XSS posture in i18next init.
6. Confirm peer dependency on closed `@confora/ui` does not require lockfile change.
7. Confirm no source staged after audit.

## GO / NO-GO criteria

| GO | NO-GO |
|----|-------|
| Tracked tree clean; HEAD matches evidence base | Dirty tracked tree / unexpected package changes |
| Inventory closed; tests + typecheck pass | Failing tests or typecheck |
| No secrets; no PII hardcoding; workflow boundaries hold or findings documented | Blocking secret/PII/workflow conflation without remediation path |
| No package/lock/workspace change claimed or required | Import of HR MJML / AI / database sneaked into wave |
| Verdict: integrity PASS / conditional PASS with documented residuals | Integrity FAIL |

## RH35 itself

No validation commands required beyond baseline git status (audit-only rebaseline).
