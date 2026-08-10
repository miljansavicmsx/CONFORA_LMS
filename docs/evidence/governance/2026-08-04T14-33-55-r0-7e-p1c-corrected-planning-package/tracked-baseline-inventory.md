# Tracked Baseline Inventory

Counts are from Git tree f5e48ddb774f3e505fd3c5a6fc4c13492ed4b8cd.

| Path | Tracked count | Planning classification |
|---|---:|---|
| frontend-app | 125 | Operational transitional bridge; full clean-clone execution unverified |
| apps/api | 20 | Intended canonical target; incomplete and not confirmed buildable |
| apps/web, apps/admin, apps/worker | 0 each | Missing authority; not operational proof |
| backend | 0 | Absent frozen legacy; local presence is not authority |
| packages/database | 0 | Missing implementation authority |
| packages/shared-kernel | 9 | Tracked partial package |
| packages/ai-prompts | 10 | Tracked; current baseline lint source |
| packages/i18n | 50 | Tracked partial package |
| .cursor/rules | 0 | Deferred R0-2 authority gap |
| docs/governance | 8 | Tracked normative corpus; TECH_DEBT.md absent |
| docs/architecture | 7 | Tracked architecture authority |
| docs/implementation | 0 | No tracked task corpus |
| docs/evidence | 1536 | Non-normative evidence before P1/P1C |
| tools/a11y | 0 | Missing accessibility authority |
| scripts/a11y | 0 | Missing accessibility scripts |
| scripts/ops/run-f4-8g-frontend-validation.mjs | 0 | Missing F4 validator |

Known missing API authority includes apps/api/src/main.ts and complete module
graphs for complaint, auth, tenant, and Prisma dependencies. Known frontend
authority gaps include canonical auth integration paths. No local-only path is
used as implementation, configuration, test, or evidence authority.
