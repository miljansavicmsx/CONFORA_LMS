# Tracked Baseline Inventory

Counts are from Git tree f5e48ddb774f3e505fd3c5a6fc4c13492ed4b8cd.

| Path | Count | Planning classification |
|---|---:|---|
| frontend-app | 125 | Operational bridge; standalone; full clean-clone build unverified |
| apps/api | 20 | Tracked incomplete canonical target |
| apps/web, apps/admin, apps/worker | 0 each | Missing/unverified local-only, not authority |
| backend | 0 | Absent frozen legacy |
| packages/database | 0 | Missing authority |
| packages/shared-kernel | 9 | Tracked partial |
| packages/ai-prompts | 10 | Tracked; current quality source |
| packages/i18n | 50 | Tracked partial |
| .cursor/rules | 0 | Deferred R0-2 gap |
| docs/governance | 8 | Normative corpus; technical-debt register absent |
| docs/architecture | 7 | Normative architecture |
| docs/implementation | 0 | No tracked task corpus |
| docs/evidence | 1536 before this package | Non-normative evidence |
| tools/a11y | 0 | Missing R0-7D authority |
| scripts/ops/run-f4-8g-frontend-validation.mjs | 0 | Missing F4 validator |

Known missing API authority includes apps/api/src/main.ts, the complaint module,
and complete auth, tenant, and Prisma modules. Known frontend authority gaps
include canonical dashboard-guard and login-store paths. Local presence
elsewhere is not repository truth.
