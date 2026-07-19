# CONFORA-REPO-HEALTH-6 — High-risk source review

**No secret values are reproduced.** Path and category review only.

## Must manually review before tracking

| Candidate | Why |
|-----------|-----|
| `apps/api/src/auth/**` (~28 untracked; some auth already tracked) | JWT/MFA/Keycloak/RBAC — verify no hardcoded secrets |
| `apps/api/src/auth/jwt-hs256-secret.ts` | Name + secret-handling module — open and review |
| `apps/api/src/security/**` | Security controls |
| `apps/api/src/tenant/**` | Tenant isolation |
| `apps/api/src/prisma/**` (~10 untracked) | Tenant extension / access filters |
| `frontend-app/.env.example` | Env *names* only expected; confirm no live values |
| `scripts/ops/keycloak-mfa-pkce-enrollment.mjs` | RH3 flagged otpauth-related patterns |
| `scripts/ops/run-ep-tech-8-mfa-training-closure.mjs` | Same |
| Other `scripts/ops/*keycloak*`, `*mfa*`, `*token*` | Spot-scan for embedded credentials before add |
| GitHub workflows already tracked | Confirm untracked source deps they assume exist before claiming CI green |

## Workflow / deploy coupling note

Tracked CI (e.g. F4 cutover / backend tests) may reference paths that are still untracked. Import waves should prefer **config + shared packages + core** before expecting CI to pass on a clean clone.

## Not treated as high-risk for content (still path-scoped)

| Item | Guidance |
|------|----------|
| `frontend-app/e2e/*screenshots*.spec.ts` | Specs OK after review; generated screenshot binaries stay ignored |
| Certification domain modules | Boundary risk (decision≠issuance), not secret risk — review for SoD |

## Secrets posture for RH6

- `secrets_committed: false` (this task commits nothing)
- High-risk list must be cleared **before** Wave 4 (auth) and before MFA ops scripts
