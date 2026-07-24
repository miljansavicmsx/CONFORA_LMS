# CONFORA-REPO-HEALTH-32 — Minimal Import Candidate

## Recommended minimal first import (after findings review / separate import task)

1. `packages/notification-templates/templates/events/audit.integrity.failed/v1/en.mjml`
2. `packages/notification-templates/templates/events/report.mr_monthly_digest/v1/en.mjml`
3. `packages/notification-templates/templates/standard/v1/en.mjml`

## Keep out of first import

- All `hr.mjml` until localized (or explicitly documented as non-localized fallback files under a different naming/policy)

## Guardrails

- Do not change `index.ts` / package.json / lockfile for this import.
- Continue using `interpolateMjmlAllowlisted` only.
- HR locale continues to use subject fallback metadata from `subjects.ts`; do not ship fake HR MJML as authentic.
