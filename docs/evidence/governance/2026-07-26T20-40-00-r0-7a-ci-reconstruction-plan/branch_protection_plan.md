# Branch protection plan (R0-7F only)

Current state: integration branch **unprotected**.

## Do not enforce now

quality, database, accessibility, compliance-iso, docker — all broken or skipped.

## Candidate future required checks (after green clean-clone)

1. Deterministic install / quality **canonical lane**
2. Database service + tracked Prisma checks (if OD-R07-2 promotes schema)
3. Accessibility against operational frontend-app
4. Architecture/governance policy validation (docs SoT consistency)
5. Deploy workflows must remain manual + environment-gated (R0-3)

## Required process controls

- Independent review before merge for governance/CI changes
- Admin bypass: default deny; any exception recorded with expiry
- No merge queue until required checks exist and are green
