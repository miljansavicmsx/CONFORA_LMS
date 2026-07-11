# TD-070-F1 Discovery — i18n Follow-up

| Field | Value |
|-------|-------|
| **Task** | TD-070-F1 |
| **Baseline** | TD_085_GO_LOCAL_BASELINE_CONFIRMED (6/6 sequential) |
| **Prior i18n** | TD-070 foundation via `@confora/i18n` |

## Existing foundation

| Component | Path |
|-----------|------|
| i18n package | `packages/i18n` |
| Provider | `packages/i18n/src/react.tsx` → `ConforaI18nProvider` |
| App wiring | `frontend-app/src/main.tsx` |
| Namespaces (pre-F1) | `a11y`, `certificationStaff`, `candidatePortal` |
| Locales (pre-F1) | `bs`, `sr`, `hr`, `en` |

## Gaps found (pre-F1)

1. **No Slovenian (`sl`)** locale
2. **No runtime language switcher** or UI locale persistence
3. **Login** fully hardcoded (Serbian/Croatian)
4. **Header shell** mostly hardcoded except `a11y` keys
5. **Recertification table** showed raw `r.status` enums
6. **Certificate selector summary** showed raw `lifecycleStatus`
7. **`admin-gov-ux-labels.ts`** parallel Serbian maps (not i18n) — acceptable for F1 deferral
8. **`A11Y_KEYS`** missing `nest_auth_pilot_registry_unavailable` (test contract drift)

## In scope (F1)

| Area | Action |
|------|--------|
| Language switcher | Header + Login; `localStorage` `confora.locale.v1` |
| Locales | Add `sl`; complete `auth`, `shell` namespaces |
| Login | i18n via `auth` namespace |
| CPD / recertification | `statusLabels` in `candidatePortal`; map table + selector |
| Persistence | No auth/RBAC/API impact |

## Out of scope (deferred)

| Area | Reason |
|------|--------|
| Full dashboard / sidebar nav extraction | App-wide refactor |
| Committee portal | Later phase |
| Landing marketing copy | Later phase |
| Identity review admin pages | Staff F1 backbone — separate pass |
| `admin-gov-ux-labels.ts` full i18n migration | Large; Serbian labels stable for acceptance |
| Register page | Not in F1 brief |
| Backend error catalog | API-owned |

## Default locale behavior

- **Pre-F1:** `VITE_APP_LOCALE ?? "hr"`
- **F1:** `localStorage` → `VITE_APP_LOCALE` → **`hr`** (TD-070 pilot default preserved)
- **fallbackLng:** `en`

## Sequential runner note

Admin-gov acceptance expects Serbian/Croatian admin copy from `admin-gov-ux-labels.ts` (not switched by UI locale). Candidate portal uses i18n and respects switcher.
