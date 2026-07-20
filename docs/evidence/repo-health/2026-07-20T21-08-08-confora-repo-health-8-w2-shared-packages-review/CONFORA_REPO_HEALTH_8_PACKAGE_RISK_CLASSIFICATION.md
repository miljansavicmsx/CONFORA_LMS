# CONFORA-REPO-HEALTH-8 — Package risk classification

| Package | Class | Rationale |
|---------|-------|-----------|
| `shared-types` | **W2A** manifests/tsconfigs; **W2B** source | Types include `auth.ts`/`roles.ts` (identifiers only); review source before W2B |
| `shared-kernel` | **W2A** manifests/tsconfigs; **W2B** source | Tenant primitives — low secret risk; boundary-aware review |
| `config` | **W2A** `package.json` + `typescript/*.json`; **W2C** eslint/prettier/csp scripts | Tooling; safe but separate from type packages |
| `ui` | **W2A** manifests/configs; **W2C** or follow-on source | `tokens.ts` is design tokens (path matched “token”; not a secret) |
| `audit-client` | **W2A** manifests/tsconfigs; **W2C** source | Audit append client — review for append-only semantics |
| `sdk` | **W2A** manifests/tsconfigs; **W2C** source | Includes generated schema — review before source import |
| `notification-templates` | **W2A** manifests/tsconfigs; later source/templates | Low secret risk; not first W2A source |
| `auth` | **defer** / README-only | Auth package name; no real source yet — do not expand blindly |
| `audit` | **defer** / README-only | Stub |
| `types` | **defer** / README-only | Stub |
| `ai-governance` | **defer** | AI governance stub — human-oversight package later |
| `ai-client` | **defer** | AI client + build artifacts (`.js`/`.map`) — do not import compiled outputs |
| `ai-prompts` | **defer** / **review** | Prompt JSON — AI governance; not W2A |
| `database` | **do not import yet** (this wave family) | 63 migrations + seeds + `.env.example` — dedicated later wave after review |
| `i18n` | already tracked | No W2 action |

## High-risk themes

| Theme | Packages | Action |
|-------|----------|--------|
| Auth / JWT / RBAC | `auth` (stub), `shared-types` auth/roles types | Types OK in W2B after skim; no auth implementation package yet |
| Database / Prisma | `database` | Defer entire tree from W2A–W2C |
| AI prompts / governance | `ai-prompts`, `ai-client`, `ai-governance` | Defer |
| Env / secret path names | `database/.env.example` | Placeholder review only; defer with database |
