# frontend-app package-manager analysis

| Topic | Finding | Kind |
|-------|---------|------|
| Classification | TRACKED_STANDALONE_OUTSIDE_ROOT_WORKSPACE | owner decision / fact |
| Root workspace membership | NOT in pnpm-workspace.yaml | tracked fact |
| Declared PM | npm (package-lock locally) | tracked + local |
| Lockfile tracked | NO | tracked fact |
| Workflow install | `cd frontend-app && npm ci` | workflow fact |
| Deterministic on CI today | NO — lockfile absent on runner | inference |
| Node | workflow node 20; engines >=20.10 | fact |
| Build | `tsc -b && vite build` | tracked |
| Playwright | `@playwright/test` in frontend-app devDependencies | tracked |
| Build deps | `file:../packages/i18n` and `file:../packages/ui` | tracked packages |
| Do not add to pnpm-workspace via R0-7D | binding decision | owner decision |

## R0-7D2 install posture

1. Track `frontend-app/package-lock.json` and keep `npm ci` (owner decision).
2. Reject lockfile-less CI install (STOP).
3. Use root tooling only for static checks that do not need frontend-app node_modules.
4. Avoid mixing graphs beyond intentional sequencing.
