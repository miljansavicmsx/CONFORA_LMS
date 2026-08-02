# Closure analysis (complaint-only)

## Seeds (tracked at integration)

- `frontend-app/src/components/grievances/FormalComplaintDialog.tsx`
- `frontend-app/src/lib/api/complaints-client.ts`
- `frontend-app/src/pages/learner/AppealsComplaintsPage.tsx` (complaint slice only; appeal dialog skipped)

## First-order missing (dialog + complaints-client @ integration)

Count: **10**

1. `frontend-app/src/components/ui/button.tsx`
2. `frontend-app/src/components/ui/dialog.tsx`
3. `frontend-app/src/components/ui/label.tsx`
4. `frontend-app/src/lib/api-grievances.ts`
5. `frontend-app/src/lib/api/api-error.ts`
6. `frontend-app/src/lib/api/api-provider.ts`
7. `frontend-app/src/lib/api/complaints-canonical-flag.ts`
8. `frontend-app/src/lib/api/complaints-category.util.ts`
9. `frontend-app/src/lib/api/complaints-types.ts`
10. `frontend-app/src/lib/api/http-client.ts`

Page complaint slice additionally needs:

- `frontend-app/src/components/ui/badge.tsx`
- `frontend-app/src/lib/utils.ts`

All of the above exist on rejected D2 tip (inspect-only). Several (dialog, api-grievances, complaints-*) are **absent** from rejected S2 tip.

## Honest D2 closure (appeal artifacts skipped)

Walking the same seeds on `13cdd752…` yields **47** tracked modules; **7** already at integration; **40** candidate promotes.

### Category split (of 40)

| Category | Count | Meaning |
|----------|------:|---------|
| HTTP / auth stack | 9 | `http-client`, provider, tokens, refresh, auth store, … |
| Complaint domain | 4 | types, category util, canonical flag, `api-grievances` facade |
| UI primitives | 4 | shadcn button/dialog/label/badge under `@/components/ui` |
| Shared utils/types | 2 | `utils.ts`, `lms-stores.ts` |
| RBAC / access overreach | 18 | Pulled via `auth-refresh` → `nest-auth-pilot` → `iso-navigation-access` / access modules |
| Other | 3 | e.g. `auth-storage`, `endpoint-registry`, `inactive-feature-visibility` |

Machine lists: `closure/files-to-promote-candidate.txt`, `closure/d2-justified-promote-candidate.json`.

## Why RBAC overreach appears

`http-client` → `auth-refresh` → `isNestAuthPilotActive` (`nest-auth-pilot`) → workspace / ISO nav / access helpers.

Integration already tracks a **broken** `nest-auth-pilot.ts` that imports missing `api-config`, `app-workspace`, `iso-navigation-access`, `inactive-feature-visibility`. Completing the HTTP stack therefore reopens that pilot dependency fan-out unless the owner authorizes a pilot decoupling (out of scope here; previously attempted on rejected S2 and rejected for production semantics).

## Non-duplicate infrastructure findings

| Concern | Finding |
|---------|---------|
| Second HTTP client | **Forbidden / unnecessary** — canonical pattern is `@/lib/api/http-client` (missing, candidate on rejected tips) |
| Second UI kit | **Forbidden** — dialog uses `@/components/ui/*` (shadcn). `packages/ui` Button is a different, non-drop-in component |
| Second grievance client | Prefer existing `api-grievances` facade **or** rewire dialog to `submitLearnerComplaint` only (owner choice); do not invent a third client |
| `api-grievances` | On D2 it also re-exports appeal helpers — complaint-only promote should not activate appeal filing UI |

## External packages already expected by candidate modules

`axios`, `@tanstack/react-query`, `@radix-ui/react-dialog|label|slot`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `zustand`, `react`, `react-router` — verify present in `frontend-app/package.json` before implementation; do not add axe/browser scanners.
