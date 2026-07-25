# CONFORA-REPO-HEALTH-37 — Navigation Parity Decision

## Decision

`navigation.items.appealsComplaints` is a **canonical** key.

## Evidence

| Check | Result |
|-------|--------|
| `packages/i18n/src/keys.ts` | No navigation item allowlist (not decisive) |
| `test/locales-complete.test.ts` | EN is canonical for key-set parity |
| Repo usage | `frontend-app/src/components/layout/sidebar-sections.tsx:281` — `labelKey: "appealsComplaints"` → `/dashboard/admin/appeals-complaints` |

## Chosen action (rework)

Add the key to missing locales rather than remove from bs/sr/sl.

| Locale | Value verified |
|--------|----------------|
| en | `"Appeals and complaints"` |
| hr | `"Žalbe i prigovori"` |
| bs | `"Žalbe i prigovori"` |
| sr | `"Žalbe i prigovori"` |
| sl | `"Žalbe in prigovori"` (corrected from `"Pritožbe in ugovori"` — *ugovori* = contracts) |

## Boundary note

Combined nav label groups appeals + complaints; distinct keys `items.appeals` / `items.complaints` remain separate (žalba ≠ prigovor).

`navigation_appeals_complaints_parity_resolved: true`
