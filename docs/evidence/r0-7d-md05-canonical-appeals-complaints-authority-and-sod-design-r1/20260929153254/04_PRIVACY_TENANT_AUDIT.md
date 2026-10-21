# Privacy, tenant isolation, audit, and errors

DESIGN_UTC = 2026-09-29T15:32:54Z

## Privacy

Personal data in this residual includes appeal grounds and summary,
complaint narrative, public submitter name and email, certificate
numbers, and actor identifiers.

| Data | Design rule |
| --- | --- |
| Appellant or complainant subject id | Kept on the server case. Omitted from public status. Not replaced with an empty string in a staff view model. Shown to an authorized handler of that case only. |
| Public submitter email and name | Accepted for intake contact. Not returned on the public status read. |
| Grounds, summary, complaint narrative | Case content. Not written into unrelated client logs. |
| Certificate number | Staff case view only, for an authorized handler of that case. |
| Tenant id | Not accepted from the client body or query. The present http client already strips `tenant_id` and `tenantId`. That client behaviour is not server isolation. |

No GDPR lawful-basis record is created by this design. Implementation
remains blocked until that basis is recorded for this residual.
PRIVACY_BASIS_RECORDED = false

## Tenant

Every read and write is limited to the tenant in the authenticated
token. Cross-tenant access returns 404 or an empty list and does not
reveal that the other tenant's case exists. Public complaint status is
looked up by public reference, not by tenant id supplied by the caller.

SERVER_TENANT_ENFORCEMENT_VERIFIED = false

## Audit

The UI facade is not the audit record. A later server implementation
must append an immutable event for submit, acknowledge, void, decision
start, and decision outcome. Each event carries actor, action, case id,
tenant, and time. An empty `events` array is not an audit trail.

The e2e test on this tree imports
`apps/api/src/cert-appeals/staff-appeals-audit.constants` and
`apps/api/src/cert-complaints/staff-complaints-audit.constants`.
Those files are absent. This design does not recreate them.

AUDIT_IMPLEMENTATION_VERIFIED = false

## Errors

| Situation | Design result |
| --- | --- |
| No token | 401 |
| Wrong role, or actor is the original decider | 403 |
| Case not in the caller's tenant, or unknown public reference | 404 without a cross-tenant leak |
| Decision already started | 409, and no outcome write follows |
| Committee id missing or not a server committee | 403 or 422, and no outcome write |
| Legacy appeal alias requested by MD05 | Not called. No 410 fallback that continues on a legacy path. |

Notes and assignment of an arbitrary user id are out of scope. They are
not emulated with status 410.
