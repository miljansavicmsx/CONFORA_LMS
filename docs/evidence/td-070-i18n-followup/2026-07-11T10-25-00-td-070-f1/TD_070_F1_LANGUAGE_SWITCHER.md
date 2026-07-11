# TD-070-F1 Language Switcher

## Implementation

| File | Role |
|------|------|
| `frontend-app/src/components/i18n/LanguageSwitcher.tsx` | Accessible `<select>` with human-readable locale names |
| `frontend-app/src/lib/locale-preference.ts` | `resolveInitialUiLocale`, `persistUiLocale`, `readPersistedUiLocale` |
| `packages/i18n/src/keys.ts` | `LOCALE_STORAGE_KEY = confora.locale.v1` |
| `frontend-app/src/main.tsx` | Initial locale from preference resolver |
| `frontend-app/src/components/layout/Header.tsx` | Switcher in authenticated shell |
| `frontend-app/src/pages/Login.tsx` | Switcher on login shell |

## Supported locales

`en`, `bs`, `sr`, `hr`, `sl`

Display labels from `shell:language.*` (not raw locale codes in UI).

## Requirements checklist

| Requirement | Status |
|-------------|--------|
| Switch without logout | PASS — `i18n.changeLanguage()` |
| Persist in localStorage | PASS — `confora.locale.v1` |
| No auth/token impact | PASS — display-only |
| No RBAC/tenant/API impact | PASS |
| Keyboard accessible | PASS — native `<select>` + `aria-label` |
| Human-readable options | PASS |

## Default locale

`hr` when no storage / env (TD-070 pilot behavior). `fallbackLng: en`.

## Tests

- `frontend-app/src/components/i18n/__tests__/language-switcher.test.tsx` — render + switch + persistence
- `frontend-app/src/lib/__tests__/locale-preference.test.ts` — resolver + five locales
