# CONFORA-REPO-HEALTH-15 — Audit-client source review

**No secret values are reproduced.**

## Token callback

| Check | Result |
|-------|--------|
| `getAccessToken?: () => Promise<string \| undefined>` | present |
| Hardcoded JWT triple | **absent** |
| Bearer long literal | **absent** |
| Runtime pattern | `Bearer ${token}` from callback only |
| `token_callback_review` | `callback_only_no_hardcoded_token` |

## Credentials / keys

| Check | Result |
|-------|--------|
| Hardcoded passwords | **absent** |
| `client_secret` literals | **absent** |
| PEM private key blocks | **absent** |

## Tenant / platform scope

| Check | Result |
|-------|--------|
| Schema fields `tenantScoped` / `platformScope` / `tenantId` | present |
| `superRefine` / refine validation | present |
| Rule: tenant-scoped requires `tenantId` | enforced |
| Rule: cannot set both `platformScope` and `tenantScoped` | enforced |
| Tests reject tenantScoped without tenantId | **yes** |
| Tests accept platformScope aggregates | **yes** |
| `tenant_platform_scope_review` | `validated` |

## Regulated / AI audit handling

| Check | Result |
|-------|--------|
| `regulated` optional flag | present; refine requires `action` when regulated |
| Failure detail mentions regulated action | present (transport error path) |
| `isAiGenerated` / `aiModelVersion` schema fields | present (AI disclosure metadata) |
| Test covers `certification.decision_recorded` action id | yes (identifier only) |

## Overall

Source matches RH14 expectations: append schema + optional token injection + tenant/platform/regulated guards. Safe controlled import confirmed.
