# CONFORA-REPO-HEALTH-10 — Risk review

## Classification

| Path | Class | Notes |
|------|-------|-------|
| `shared-types/src/index.ts` | **W2B safe now** | Health helpers |
| `shared-types/src/health.test.ts` | **W2B safe now** | Test |
| `shared-types/src/roles.ts` | **review before import** | RBAC role identifiers (`USR_CAND`, `COM_CERT`, …) — expected enums, skim OK |
| `shared-types/src/auth.ts` | **review before import** | JWT payload / login / MFA / token response **Zod schemas**; `password`/`otp` as **field names**; `ROUTE_PERMISSIONS`; MFA role constants — not live secrets |
| `shared-kernel/src/entities.ts` | **W2B safe now** | Entity interfaces |
| `shared-kernel/src/audit-context.ts` | **W2B safe now** | Audit actor shape |
| `shared-kernel/src/index.ts` | **W2B safe now** | Barrel |
| `shared-kernel/src/tenant.test.ts` | **W2B safe now** | Tests |
| `shared-kernel/README.md` | **W2B safe now** | Docs |
| `shared-kernel/src/tenant.ts` | **review before import** | Tenant isolation primitives + well-known **test/default UUID** constants (`DEFAULT_TENANT_ID`, `TENANT_B_TEST_ID`) — not credentials |

## Defer (within this scope)

None. No file in these two packages needs deferral; high-attention files stay in W2B after skim.

## Attention themes

| Theme | Finding |
|-------|---------|
| JWT / token naming | Schema types (`ConforaJwtPayload`, `TokenResponse`) — structural |
| Password / OTP | Request schema **property names** only |
| RBAC / permissions | `roles.ts` + `ROUTE_PERMISSIONS` in `auth.ts` |
| Tenant | Branded IDs + claim parsing — supports isolation |
| Security package confusion | This is **types/kernel**, not `packages/auth` implementation |

## Boundary note

These packages define shared contracts; they must not be used later to blur education vs certification or decision vs issuance. Importing schemas does not weaken those boundaries by itself.
