# CONFORA-REPO-HEALTH-8 — Packages inventory

Untracked via `git ls-files --others --exclude-standard -- packages` → **158** files.

| Package | Untracked | Kind mix (approx) | Notes |
|---------|----------:|-------------------|-------|
| `database` | 75 | schema/migrations 63; seed/src/test; `.env.example` | Highest risk / volume |
| `config` | 13 | eslint/prettier/csp + typescript presets + manifest | Tooling |
| `notification-templates` | 12 | mjml templates + src + tsconfig | Notifications |
| `ui` | 11 | components + styles + tokens + configs | Design system |
| `shared-kernel` | 9 | tenant/entities/audit-context + tests | Shared domain primitives |
| `ai-prompts` | 9 | JSON prompts + src | AI governance-sensitive |
| `ai-client` | 8 | src + **compiled** `.js`/`.map`/`.d.ts` | Prefer source only later |
| `shared-types` | 7 | auth/roles/health types + tsconfig | Partial track already |
| `audit-client` | 5 | append client + test | Audit append helper |
| `sdk` | 5 | generated schema + index | API SDK |
| `types` | 1 | README only | Stub |
| `audit` | 1 | README only | Stub |
| `auth` | 1 | README only | Stub — high-risk name |
| `ai-governance` | 1 | README only | Stub |
| `i18n` | 0 untracked | already tracked | — |

## Directory present

`ai-client`, `ai-governance`, `ai-prompts`, `audit`, `audit-client`, `auth`, `config`, `database`, `i18n`, `notification-templates`, `sdk`, `shared-kernel`, `shared-types`, `types`, `ui`
