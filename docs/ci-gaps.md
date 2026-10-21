# CI gaps

Recorded with the 2026-10-20 owner decision that retargeted pull-request CI to the Vite `frontend-app`, NestJS `apps/api`, and Prisma tree. These checks were removed or narrowed. They are not replaced by an empty pass. Thresholds are unchanged.

The Accessibility workflow job that boots the Nest API and checks `GET /v1/health` plus an unauthenticated staff report is named `compliance-smoke`. It is not an ISO 17024 conformance run.

## Removed checks

| Check                                                                                                                                            | Status                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PAdES / pdfcpu signature smoke (`apps/api` Jest `pdf-pades.sign`)                                                                                | Tracked gap. `@signpdf/*` is declared. No signer module and no spec exist.                                                                             |
| RISK-A11Y-001 (`gov/risks/risks.compliance.spec.ts`)                                                                                             | Tracked gap. No risk register and no spec exist.                                                                                                       |
| ISO 17024 Playwright `iso17024_3_22_equitable_access.spec.ts`                                                                                    | Tracked gap. No equitable-access journey.                                                                                                              |
| ISO 17024 Playwright `iso17024_7_2_2_public_scheme_information_a11y.spec.ts`                                                                     | Tracked gap. No public scheme page.                                                                                                                    |
| ISO 17024 Playwright `iso17024_9_1_4_fair_valid_reliable_a11y.spec.ts`                                                                           | Tracked gap. No fairness assessment UI.                                                                                                                |
| ISO 17024 Playwright `iso17024_9_1_5_accommodation_workflow.spec.ts`                                                                             | Tracked gap. No accommodation workflow.                                                                                                                |
| ISO 17024 Playwright `iso17024_9_2_2_e_accommodation_at_application.spec.ts`                                                                     | Tracked gap. No accommodation field on application.                                                                                                    |
| Authenticated axe for 8 roles (`learner`, `candidate`, `training_admin`, `tech_committee`, `director`, `sys_admin`, `cert_committee`, `auditor`) | Tracked gap. `a11y-axe-authenticated.spec.ts` and `scripts/seed_role_access_demo.py` are not in the tree. Public `/login` and `/verify` axe still run. |
| `apps/api/test/appeals-complaints-1-boundary.e2e-spec.ts`                                                                                        | Tracked gap. Ignored by the e2e runner. Imports `KeycloakTokenService`, which is not in the tree.                                                      |
| `apps/api/test/td-082-pilot-certificant-wallet.e2e-spec.ts`                                                                                      | Tracked gap. Ignored by the e2e runner. Imports a certificate DTO and a seed that are not in the tree.                                                 |

## Lint exclusions

`actor-db-access.ts` is linted again. It stays out of `apps/api/tsconfig.build.json` because it is not the BAR-P03 identity resolver. These files stay outside the shipping ESLint program because they reference models or modules the frozen schema does not contain:

- `apps/api/src/auth/actor-db-access.spec.ts`
- `apps/api/src/cert-governance/recertification.service.ts`
- `apps/api/src/cert-wallet/me-certificates.service.ts`
- `apps/api/src/cert-wallet/me-certificates.service.spec.ts`

## Frontend typecheck

`confora-frontend-app` `typecheck` runs `tsc -p tsconfig.node.json --noEmit` and CI runs it through `pnpm typecheck`. The application program `tsc -b` (`tsconfig.app.json`) still fails on absent modules (`AdminEducationGuard`, `IdentityReviewGuard`, `IdentityReviewPage`, `api-grievances`, `api-recertification`, `api-reports`, `api-staff-cert-registry`, `admin-education-api`, `EducationCharts`, command-center and design-system imports) and is a tracked gap. A production `vite build` refuses `PLAYWRIGHT_F4_SMOKE`. The accessibility preview and the frontend Docker `smoke` target build with `--mode smoke`.

## Deferred: tenant extension wiring

`mergeTenantIntoWhere` keeps caller `AND`, `OR`, and `NOT` with the active tenant. `PrismaService` does not install `createTenantQueryExtension`. `apps/api/src/prisma/prisma.service.ts` is the shipping client, and wiring the extension into that client is a separate pull request. This note does not change the shipping client.
