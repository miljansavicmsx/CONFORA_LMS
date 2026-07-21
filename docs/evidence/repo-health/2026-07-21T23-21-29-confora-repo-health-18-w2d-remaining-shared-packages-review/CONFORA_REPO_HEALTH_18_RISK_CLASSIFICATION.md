# CONFORA-REPO-HEALTH-18 — Risk classification

| Package group | Class | Rationale |
|---------------|-------|-----------|
| `packages/ui` (6 source files) | **review before import** → Option A W2D-1 | Small design-system set; browser components (`Button`, `AiDisclosure`, `SkipToMainLink`); no fetch/env found in spot check; ARIA `role` / design `ColorTokenRole` only |
| `packages/notification-templates` | **review before import** → Option B later | Event-key catalog includes MFA/password_reset **names**; MJML may carry recipient placeholders — review for PII template hygiene before import |
| `packages/audit`, `auth`, `types`, `ai-governance` | **defer** | README stubs only — no real source; avoid inventing packages via README-only commits |
| `packages/ai-prompts` | **defer** | AI prompt JSON — governance review later |
| `packages/ai-client` | **defer** / compiled **do not import** | Real TS exists, but `.js`/`.map`/`.d.ts` build artifacts must not be tracked; defer whole package until source-only plan |
| `packages/database` | **do not import** (this phase) | Migrations + schema + seeds + `.env.example` — dedicated high-risk wave after app needs clarified |
| `apps/**`, `frontend-app/**`, ops, terraform, evidence bulk | **do not import** | Out of W2D |

## Attention themes

| Theme | Finding |
|-------|---------|
| UI runtime/browser | Presentational React + CSS; skip-link; AI disclosure component |
| Frontend coupling | Package is shared UI — still review before coupling assumptions harden |
| Auth/RBAC | `auth` README only; UI has no JWT/token provider |
| Tenant | Comment-only “per app/tenant” override text on skip-link — not isolation logic |
| Notification PII | Event keys + MJML — Option B needs template placeholder review |
| Generated/compiled | `ai-client` compiled outputs — exclude |
| Database/Prisma | 75 files — separate wave |
| AI prompts/governance | Defer |
