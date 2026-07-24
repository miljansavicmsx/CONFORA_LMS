# CONFORA-REPO-HEALTH-27 — Template Context Review

**Scope:** `packages/notification-templates/templates/**` as dependency context only — **not** an import candidate this wave.  
**Status:** 6 files untracked · recommendation **DEFER**

## Placeholders (all shells)

`{{heading}}`, `{{bodyText}}`, `{{footer}}` — inserted into `<mj-text>` (HTML text context).

| Check | Result |
|-------|--------|
| Explicit PII field names | none |
| Tenant placeholders | none |
| Link / URL placeholders | none |
| `<script>` / `mj-raw` / CDN | none |
| Depend on unsafe interpolation | **yes** — any consumer using current `interpolate()` |

## Localization status

| Template | HR status |
|----------|-----------|
| `audit.integrity.failed` | HR **byte-identical** to EN |
| `standard/v1` | HR **byte-identical** to EN |
| `report.mr_monthly_digest` | Partial (title localized; body chrome EN) |

## Verdict

Structurally simple shells; remain **DEFER** until loader escaping is fixed **and** HR authenticity (or explicit fallback policy) is addressed. Even after `events.ts` rework, MJML should not auto-import without a dedicated verification.
