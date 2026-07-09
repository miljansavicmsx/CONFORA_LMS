# TD-083 Tenant Negative Results

**Run:** 2026-07-09T14:17:33 (ops:td-083-tenant-negative-api)  
**API:** http://localhost:4000

## Probe results

| Probe | Status | Detail |
|-------|--------|--------|
| anonymous_denied | PASS | status=401 |
| no_tenant_denied | PASS | status=403 |
| wrong_tenant_safe_response | PASS | status=403 items=0 |
| wrong_tenant_no_leakage | PASS | leak=false (CON-PILOT-000082 not visible) |
| other_candidate_scope | PASS | items=0 leak=false |
| privacy_no_forbidden_keys | PASS | wallet payload clean |

## Wrong-tenant before vs after

| Metric | TD-082 | TD-083 |
|--------|--------|--------|
| HTTP status | 500 | **403** |
| Items returned | 0 | 0 |
| Data leakage | none | none |
| Error body | internal error | `{"message":"Tenant mismatch.","error":"Forbidden","statusCode":403}` |
| Stack trace exposed | risk | no |

## Identity vs wallet separation

`pilot.wrong-tenant@confora.test`:

| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /auth/login` | 200 | Token issued |
| `GET /auth/me` | 200 | `userId=b2000000-0000-4000-8000-000000000004` resolved |
| `GET /v1/me/certificates` | 403 | Tenant mismatch — no default-tenant certificates |

## Chosen response policy

**403 Forbidden** with message `Tenant mismatch.` for JWT tenant ≠ DB tenant on wallet/recert paths.

Rationale:
- Clearly denies access without implying resource absence (404).
- Distinguishes from empty wallet (200 + `items: []`) for valid same-tenant users with no certs.
- Does not expose internal IDs beyond already-permitted safe identifiers.
