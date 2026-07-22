# CONFORA-REPO-HEALTH-19 — Auth / RBAC / tenant review

| Check | Result |
|-------|--------|
| JWT parsing / token storage | absent |
| Client-side role enforcement as access control | absent |
| Hardcoded RBAC role codes (`USR_*`, `STAFF_*`, …) | absent |
| `tenantId` read/write / tenant picker | absent |
| Keycloak / Cognito bypass | absent |
| Privileged actions without server contract | absent |
| SoD mixing (learner/staff/cert/admin) | absent |
| “tenant” wording | Comment only on `SkipToMainLink` (“overridable per app/tenant”) — not isolation logic |
| `role` wording | ARIA `role="note"`; design-token `ColorTokenRole` — not RBAC |

| Field | Value |
|-------|-------|
| `auth_rbac_tenant_findings_count` | **0** |
