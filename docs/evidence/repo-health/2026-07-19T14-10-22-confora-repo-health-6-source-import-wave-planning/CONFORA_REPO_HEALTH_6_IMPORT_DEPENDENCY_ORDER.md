# CONFORA-REPO-HEALTH-6 — Import dependency order

Import in this order so each wave builds on prior tracked artifacts. Never `git add apps` / `git add frontend-app`.

```
1. Config / manifests
   docker-compose*, apps/api package+tsconfig+nest/jest,
   frontend-app package+vite+tsconfig+tailwind,
   remaining packages/*/package.json & build configs

2. Shared packages (non-auth secrets)
   packages/shared-types, shared-kernel, config, ui, database (schema-ish),
   then ai-* / audit-* clients

3. API core / shared
   apps/api/src/common, config, types, health, app wiring (non-domain)

4. API auth / security / tenant / prisma  [HIGH-RISK REVIEW GATE]
   auth, security, tenant, prisma extensions
   (education != certification still applies; auth is cross-cutting)

5. API education / LMS domains
   lms, course-*, dashboard (learner education surfaces)

6. API certification domains (split internally)
   applications / eligibility / exam authz / sessions / attempts
   THEN certification decision (≠ issuance)
   THEN certificate issuance / lifecycle / wallet
   THEN appeals vs complaints (žalba ≠ prigovor) as separate commits if large
   verify (public read-only) last or with issuance

7. Frontend
   lib/access/layouts/shell → education pages → certification pages
   (same boundary splits as API)

8. Tests / e2e / ops (non-MFA first)
   apps/api/test, frontend-app/e2e, scripts/ops smokes
   MFA/Keycloak ops only after secret review

9. Docs evidence (curated)
   markdown + summary.json per folder — never bulk smoke screenshot trees
```

## Boundary reminders (must survive every wave)

- education ≠ certification  
- exam ≠ certification decision  
- certification decision ≠ certificate issuance  
- ISSUED ≠ ACTIVE  
- žalba ≠ prigovor  
- contact request ≠ žalba/prigovor  
- reports/export read-only  
- public verification no-auth / read-only  
