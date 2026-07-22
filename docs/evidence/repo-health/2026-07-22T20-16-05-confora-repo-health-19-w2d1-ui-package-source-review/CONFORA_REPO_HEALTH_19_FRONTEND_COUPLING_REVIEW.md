# CONFORA-REPO-HEALTH-19 — Frontend coupling review

| Check | Result |
|-------|--------|
| Framework | React 18 peer (`peerDependencies` in already-tracked `package.json`) — type-only imports in components |
| Next.js / react-router / Redux / Zustand / RHF | absent |
| Absolute `@/` / `~` aliases | absent |
| API client / GraphQL / Cognito / FastAPI / DynamoDB | absent |
| Env vars | absent |
| Bootstrap / provider order | absent |
| Global CSS assumptions | `styles.css` is Tailwind layers entry; consuming app must run package CSS build / include `./styles.css` export |
| Tailwind / theme | Prefixed utilities `cf-*`; tokens comment references Tailwind classes; already-tracked `tailwind.config.ts` |
| Missing shared hooks/types | Components self-contained except React types |
| Legacy frontend-app structure | No imports from `frontend-app` |
| Hardcoded user-facing English | **Yes** in `AiDisclosure` (and default skip-link label) — violates CONFORA “no hardcoded UI text / use i18n” for disclosure copy |

## Findings count

| Finding | Severity |
|---------|----------|
| Tailwind entry CSS + `cf-` class coupling | low — expected for `@confora/ui` |
| React peer coupling | low — declared |
| Hardcoded English in `AiDisclosure` | **medium** — drives REWORK_REQUIRED |
| Default English skip-link label | low — overridable via `label`/`children` |

| Field | Value |
|-------|-------|
| `frontend_coupling_findings_count` | **4** (1 medium + 3 low) |
