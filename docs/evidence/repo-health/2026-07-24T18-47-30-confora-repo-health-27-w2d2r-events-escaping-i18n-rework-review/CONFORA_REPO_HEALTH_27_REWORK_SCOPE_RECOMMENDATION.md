# CONFORA-REPO-HEALTH-27 — Rework Scope Recommendation

## Future rework allowed files (W2D2R implementation task)

| Path | Allowed change |
|------|----------------|
| `packages/notification-templates/src/events.ts` | Escaping, locale metadata, subject separation, allowlists |
| `packages/notification-templates/src/index.ts` | Split/keys-only or keep excluded until events safe |
| New helper under `packages/notification-templates/src/` (optional) | e.g. `escape.ts`, `subjects.ts` — only if needed for clean split |
| Tests under `packages/notification-templates/**` (new) | Escaping + i18n fallback tests — **required before import** |

## Must remain deferred

| Path | Reason |
|------|--------|
| `packages/notification-templates/templates/**` | DEFER until after events rework + dedicated template verification |
| `packages/ui/**`, apps, auth, database, ai-*, terraform, scripts | Out of wave |
| package.json / lockfile / workspace / `.gitignore` | Change only in a dedicated packaging task if split exports need it |

## Future import candidate (this audit)

**[]** — none until rework + verification + tests pass.

## MJML after events.ts rework

Remain **DEFER** — do not auto-import with remediated loader; run a separate template authenticity / placeholder verification first.

## Tests required before import

**true** — at minimum unit tests for escape, allowlist reject, subject vs body paths, and auditable locale fallback metadata.
