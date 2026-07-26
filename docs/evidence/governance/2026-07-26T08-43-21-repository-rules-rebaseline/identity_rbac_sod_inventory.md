# Identity, RBAC and Segregation-of-Duties Inventory

**Headline: two parallel identity/authorization systems exist. The documented canonical one (Nest + Keycloak) is largely absent from disk; the operational one (FastAPI + Cognito) is complete on disk but entirely untracked.**

`git ls-files backend` returns **0**. Every runtime authorization control in the FastAPI stack is therefore outside version control and cannot be reviewed, merged, or CI-enforced through this repository.

---

## 1. Keycloak integration — **PARTIALLY VERIFIED**

| Layer | Path | Status |
|-------|------|--------|
| Docker IdP | `infra/docker/docker-compose.yml` | UNTRACKED |
| Terraform realm | `infra/keycloak/terraform/main.tf` | UNTRACKED |
| MFA flow note | `infra/keycloak/realm-import/confora-authentication-flow-note.json` | UNTRACKED |
| Pilot provisioning | `scripts/ops/keycloak-setup-pilot.mjs` | UNTRACKED |
| Env template | `.env.example` (`KEYCLOAK_*`) | **TRACKED** |
| Shared JWT/role types | `packages/shared-types/src/auth.ts`, `roles.ts` | **TRACKED** |
| Nest JWT strategy / Keycloak token service / guards | `apps/api/src/auth/jwt.strategy.ts`, `keycloak-token.service.ts`, `auth.module.ts` | **NOT FOUND on disk** |
| Auth surface doc | `docs/architecture/G4_AUTH_SURFACE_INVENTORY.md` | UNTRACKED |

```ts
/** Keycloak / OIDC tenant claim (canonical). */
tenant_id: z.string().uuid().optional(),
...
realm_access: z.object({ roles: z.array(z.string()) })
```
(`packages/shared-types/src/auth.ts` lines 21–32 — TRACKED)

**Runtime wiring:** infra/ops can provision Keycloak if run from disk. Nest JWKS validation and `AuthModule` are **absent**, so Nest cannot validate Keycloak tokens from this checkout. `apps/api/package.json` (TRACKED) still declares `passport-jwt` and `jwks-rsa`.

## 2. Cognito integration — **VERIFIED on disk / NOT FOUND in git**

| Path | Status |
|------|--------|
| `backend/config.py`, `backend/deps.py` (`decode_cognito_access_token`) | UNTRACKED |
| `backend/routers/auth.py` | UNTRACKED |
| `terraform/cognito.tf`, `infrastructure/terraform/cognito.tf` | UNTRACKED |
| Any Cognito reference in `git ls-files` | **none** |

```python
claims = jwt.decode(token, key, algorithms=["RS256"], issuer=issuer,
                    options={"verify_aud": False, "verify_exp": True})
```
(`backend/deps.py` lines 408–453)

Wired: `main.py` includes `auth.router`; `get_current_user_payload` prefers Cognito when configured. G4 docs classify Cognito as **LEGACY**.

## 3. Other authentication — **VERIFIED on disk, UNTRACKED**

`backend/services/dev_local_jwt.py` (HS256 dev-only, gated on `DEV_LOCAL_AUTH`), `backend/routers/auth_google.py`, `auth_linkedin.py`, `backend/services/confora_oauth_jwt.py`. All wired in `backend/main.py` lines 304–307. All untracked.

## 4. Authentication guards — **CONTRADICTED across stacks**

| Mechanism | Path | Status |
|-----------|------|--------|
| FastAPI Bearer + JWT decode | `backend/deps.py` `get_current_user_payload` | UNTRACKED, **wired** |
| Nest `JwtAuthGuard` / `JwtStrategy` | documented in G4 | **NOT FOUND** |
| `AppModule` imports `AuthModule` | `apps/api/src/app.module.ts` line 9 | **TRACKED, but target missing** |

The tracked `app.module.ts` cannot boot as checked in.

## 5. Authorization guards — **VERIFIED (FastAPI) / NOT FOUND (Nest)**

```python
def require_permission(*required: str) -> Any:
    ...
    grant = get_effective_permissions(canonical_roles=eff)
    if not req <= grant:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, ...)
```
(`backend/deps.py` lines 1986–2027 — UNTRACKED)

Approximately **39 FastAPI routers** import role/permission dependencies. On the Nest side, `packages/shared-types/src/auth.ts` (TRACKED) defines a `ROUTE_PERMISSIONS` table, but **no guard file in this tree consumes it** — it is data without an enforcer.

## 6. Role and permission definitions — **VERIFIED (two incompatible models)**

**A) Nest / Keycloak (TRACKED)** — `packages/shared-types/src/roles.ts`:

```ts
export const rbacRoleSchema = z.enum([
  'USR_CAND', 'USR_CERT', 'STAFF_DIR', 'STAFF_SYSADM', ..., 'COM_CERT', ...
]);
```

**B) FastAPI / DynamoDB (UNTRACKED)** — `backend/core/roles.py`, `permissions.py`, `role_permissions.py`:

```python
ROLE_CERT_COMMITTEE: Final = "cert_committee"
ROLE_SYS_ADMIN: Final = "sys_admin"
PERM_CERTIFICATION_APPLICATION_APPROVE: Final = "certification.application.approve"
ROLE_PERMISSIONS: Final[dict[str, frozenset[str]]] = { "learner": _LEARNER, "cert_committee": _CERT_COMMITTEE_PERMS, ... }
```

**No shared runtime mapping exists** between `USR_CAND`/`COM_CERT`/`STAFF_SYSADM` and `learner`/`cert_committee`/`sys_admin`.

`packages/auth/` is a **README stub only** (UNTRACKED, no `package.json`).

## 7. RBAC enforcement points — **VERIFIED (FastAPI) / PARTIALLY VERIFIED (Nest)**

FastAPI (UNTRACKED): `Depends(require_sys_admin)` in `admin_sys.py`, `admin_jobs.py`, `admin_tenants.py`; `Depends(require_permission(...))` broadly; certification SoD + ABAC in `certification_decisions.py`.

Nest tracked fragment:

```ts
if (jwtTenantId && resolution.tenantId !== jwtTenantId) {
  throw new ForbiddenException('Tenant mismatch.');
}
```
(`apps/api/src/auth/actor-db-access.ts` lines 17–35 — TRACKED, but depends on missing `PrismaService` and `ConforaUser`)

## 8. Segregation of Duties — **VERIFIED (FastAPI) / NOT FOUND (Nest)**

```python
_FORBIDDEN_PAIRS: frozenset[frozenset[str]] = frozenset({
    frozenset({"instructor", "tech_committee"}),
    frozenset({"author", "cert_committee"}),
    frozenset({"cert_committee", "appeals_committee"}),
    frozenset({"admin", "auditor"}),
})
```
(`backend/core/sod.py` lines 17–33 — UNTRACKED)

```python
SoDViolation(code="CERT_DECISION_SYS_ADMIN", severity="HARD_BLOCK")
SoDViolation(code="CERT_DECISION_SELF_AS_CANDIDATE", severity="HARD_BLOCK")
```
(`backend/services/sod_policy.py` lines 236–269 — UNTRACKED)

Wired into `certification_decisions.py`, `certification_schemes.py`, CAPA and curriculum paths.

**Important nuance (CONTRADICTED):** `backend/core/roles.py` lines 91–97 define `ISO_FORBIDDEN_ROLE_COMBINATIONS` with the explicit comment "Pripremanje za kasnije SoD (**bez enforcementa u guardovima**)" — prepared for later SoD, *not enforced in guards*. The ISO-named list and the actually-enforced list in `core/sod.py` are **different sets**. Anyone reading only `roles.py` would overestimate SoD coverage.

Nest side: `no-conflict-of-interest.guard.ts` documented in G4 — **NOT FOUND**. Only `coiActionTypeSchema` in `packages/shared-types` (TRACKED) exists as a type.

**Net:** ISO/IEC 17024 segregation of duties is enforced **only** in the untracked legacy FastAPI stack, and only for the subset in `core/sod.py` + `sod_policy.py`.

## 9. Platform-scoped vs tenant-scoped permissions — **PARTIALLY VERIFIED**

| Mechanism | Path | Status |
|-----------|------|--------|
| `TenantContext.isPlatformScope` | `packages/shared-kernel/src/tenant.ts` | **TRACKED** |
| `@PlatformScope` decorator / `TenantGuard` | documented | **NOT FOUND** |
| FastAPI `sys_admin` cross-tenant bypass | `backend/core/tenant_guard.py` | UNTRACKED |
| `sys_admin` blocked from cert business decisions | `assert_not_sys_admin_for_business_decisions` | UNTRACKED |

```ts
/** Absent only for @PlatformScope platform-admin requests. */
tenantId?: TenantId;
/** True when platform admin operates without a tenant claim (@PlatformScope). */
isPlatformScope: boolean;
```
(`packages/shared-kernel/src/tenant.ts` lines 26–32 — TRACKED)

The type exists; **the guard that would set it does not**. No first-class `platform_admin`/`SUPER_ADMIN` role; platform power is `sys_admin` (FastAPI) / `STAFF_SYSADM` (Nest types).

Positive finding: the legacy stack does encode the ISO-correct rule that a system administrator must not act on certification business decisions:

```python
def assert_not_sys_admin_for_business_decisions(canonical_primary_role: str) -> None:
    """Hard stop: sys_admin ne smije akterovati odobrenje/glasanje/ručno izdavanje certifikata."""
```
(`backend/core/roles.py` lines 184–190 — UNTRACKED)

---

## Overall posture

| Question | Answer |
|----------|--------|
| Is there a working canonical (Nest+Keycloak) authorization path in the tracked tree? | **No** — types only; guards, strategy and module absent |
| Is there a working authorization path anywhere? | **Yes** — FastAPI, complete but **untracked** |
| Is SoD implemented? | **Yes, in the legacy stack only**, and narrower than the ISO-named list suggests |
| Can CI verify any of this? | **No** — see `testing_ci_inventory.md` |

## Contradictions and gaps

1. **IdP conflict** — G4 marks Keycloak canonical and Cognito legacy; disk reality centres Cognito; Nest Keycloak adapters absent. Root `.env.example` (TRACKED) is Keycloak-oriented; `backend/.env.example` (UNTRACKED) is Cognito-oriented.
2. **Two role vocabularies with no mapping.**
3. **Tracked Nest imports missing modules** — `app.module.ts`, `actor-db-access.ts`, `prisma-tenant-extension.ts` all reference absent files.
4. **Security controls live outside git** — the entire enforcement layer is unreviewable via pull request.
5. **ISO SoD list is declaratory, not enforced** — explicitly stated in the source comment.
6. **`packages/auth` is an empty stub** while `packages/shared-types` carries the role model — no owning module.
7. **Documentation overstates readiness** — tracked Keycloak MFA *evidence* and untracked G3/G4 reports describe a Nest posture the current tree does not have.
