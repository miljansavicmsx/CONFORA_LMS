# CONFORA-REPO-HEALTH-26 — Next Wave Recommendation

## Recommended next action

`W2D2R_EVENTS_ESCAPING_I18N_REWORK_REVIEW_BEFORE_ANY_EVENTS_OR_TEMPLATE_IMPORT`

### Preferred path

1. **W2D-2R** — audit/rework plan for `events.ts`: HTML/MJML-safe interpolation, locale-authentic subjects, Node `fs` packaging strategy.
2. Optionally parallel: **W2D-3** remediation plan covering barrel `index.ts` + MJML HR authenticity after loader is safe.

## Do not recommend yet

- Importing `events.ts`
- Importing `index.ts`
- Importing `templates/**` / MJML
- Broad `git add packages/notification-templates`
