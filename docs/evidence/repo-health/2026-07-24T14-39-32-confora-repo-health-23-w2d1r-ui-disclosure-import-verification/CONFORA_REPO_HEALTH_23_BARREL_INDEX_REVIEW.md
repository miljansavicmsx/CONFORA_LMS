# CONFORA-REPO-HEALTH-23 — Barrel Index Review

**File:** `packages/ui/src/index.ts` (tracked after W2D-1R)

## Exports

| Export | Present |
|--------|---------|
| `Button` | yes |
| `AiDisclosure` | yes |
| `AiDisclosureProps` | yes |
| `SkipToMainLink` | yes |
| `SkipToMainLinkProps` | yes |
| Notification templates | **no** |
| Forbidden packages | **no** |

## Safety

- Explicit re-exports only.
- No side effects at module import.
- Does not pull notification templates or non-UI packages.

## Verdict

**`barrel_index_safe`: true**
