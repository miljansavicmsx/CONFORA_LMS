# CONFORA-REPO-HEALTH-12 — Risk classification

| Package / area | Class | Rationale |
|----------------|-------|-----------|
| `packages/config` remaining tooling | **W2C safe now** (W2C-1) | ESLint/Prettier/CSP nonce rule + build stamp — security-positive, no secrets |
| `packages/audit-client/src` | **review before import** → W2C-2 | Zod audit append schemas + optional `getAccessToken` callback (no hardcoded token) |
| `packages/sdk/src` | **review before import** → W2C-3 | Tiny OpenAPI client; generated `schema.ts` is an empty `paths` stub pending CI generate |
| `packages/ui` | **defer** | UI components + design tokens — not required for monorepo contracts yet |
| `packages/notification-templates` | **defer** | Event-key identifiers (incl. `password_reset_required` **name**) + MJML — later wave |
| `packages/database/**` | **do not import** | Out of W2C |
| `packages/auth/**`, `packages/ai-*/**` | **do not import** | Out of W2C |
| App `src`, `scripts/ops`, evidence bulk | **do not import** | Later waves |

## Special attention

| Theme | Finding |
|-------|---------|
| Generated SDK | Stub only (~137 bytes); safe after skim — regenerate later against Nest OpenAPI |
| API client | `createConforaSdk` fetches `/openapi/json` with `baseUrl` only |
| Audit schemas | Append-only ledger input Zod; tests cover tenantScoped vs platformScope |
| Config/security | CSP builder + eslint rule ban inline scripts without nonce |
| Token wording | audit-client: runtime Bearer from caller-supplied `getAccessToken` — not a committed secret |
| `ui/tokens.ts` | Design tokens (path-name risk only) |
