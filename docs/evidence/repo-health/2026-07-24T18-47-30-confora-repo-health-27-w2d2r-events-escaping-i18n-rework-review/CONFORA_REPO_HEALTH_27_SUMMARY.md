# CONFORA-REPO-HEALTH-27 — Summary

| Item | Value |
|------|-------|
| Task | `CONFORA_REPO_HEALTH_27_W2D2R_EVENTS_ESCAPING_I18N_REWORK_REVIEW` |
| Based on | `e46fab94` |
| Branch | `fix/ca-h01-frontend-f4-cutover` |
| `events.ts` import | **NO-GO** |
| `index.ts` import | **NO-GO** |
| MJML import | **DEFER** |
| Unsafe interpolation | **confirmed** |
| Escaping / i18n rework | **required** |
| Tests before import | **required** |
| Verdict | `CONFORA_REPO_HEALTH_27_AUDIT_ONLY_READY_FOR_REVIEW` |

## Headline

1. `event-keys.ts` remains tracked; `events.ts`, `index.ts`, and 6 MJML files remain untracked.
2. `interpolate()` performs raw `{{k}}` → value join with **no HTML/MJML escaping** → blocking.
3. Subjects are English-only (`SUBJECT_EN`) for every locale, including HR — i18n rework required.
4. Barrel `index.ts` re-exports the unsafe loader — keep excluded or split keys-only.
5. No recipient/provider/tenant-routing/workflow-decision logic in loader; secrets/URLs **0**.
6. Next: implement W2D2R rework on allowed files, then verify with tests before any import.
