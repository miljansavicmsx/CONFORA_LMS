# CONFORA-REPO-HEALTH-20 — UI source review

Final tracked content of the four imported files.

## `packages/ui/src/button.tsx`

| Check | Result |
|-------|--------|
| Presentational only | **yes** — `ButtonHTMLAttributes` passthrough |
| Network / auth / storage / DOM APIs | absent |
| `button_presentational_only` | **true** |

## `packages/ui/tokens.ts`

| Check | Result |
|-------|--------|
| Design-token data only | **yes** — hex/role/label consts + documented pairs |
| Network / auth | absent |
| `tokens_design_data_only` | **true** |

## `packages/ui/src/styles.css`

| Check | Result |
|-------|--------|
| Content | `@tailwind base/components/utilities` only (3 lines) |
| `styles_tailwind_entry_only` | **true** |

## `packages/ui/src/skip-to-main-link.tsx`

| Check | Result |
|-------|--------|
| Behavior | In-page `#${targetId}` fragment link |
| Default English label | `'Skip to main content'` — overridable via `label` / `children` |
| Auth/RBAC/tenant logic | none (comment-only “per app/tenant”) |
| Module side effects | none — pure component |

## Import-time side effects

None of the four files perform network/DOM/storage work at import time.
