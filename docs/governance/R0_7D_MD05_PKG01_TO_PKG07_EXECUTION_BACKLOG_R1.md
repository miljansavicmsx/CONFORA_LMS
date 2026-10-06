# R0-7D MD05 PKG-01 to PKG-07 execution backlog R1

Authorization consumed by this candidate:

`OWNER_AUTHORIZE_R0_7D_MD05_PKG01_TO_PKG07_MACHINE_READABLE_EXECUTION_BACKLOG_AND_FIRST_READY_PACKAGE_IMPLEMENTATION_R1`

```text
DEFINITION_ORIGIN = PROSPECTIVE_OWNER_DELEGATED_TECHNICAL_BACKLOG_2026
HISTORICAL_PACKAGE_MAP_RECOVERED = false
HISTORICAL_PACKAGE_MAP_CLAIMED = false
BASE_COMMIT = 577f16f3541729e10ce09a60b834a1a808103916
BASE_TREE = 7806f2dd61dc2e3dfd69f0fce135ced886d64c99
MODEL_D = 17/9/8/8/0
MD05_FORMALLY_RESOLVED = false
MD05_SCOPE_READY = false
PRIMARY_PATH = frontend-app/src/lib/api-grievances.ts
ADDITIONAL_PATHS = none
IMPLEMENTATION_AUTHORIZATION = LIMITED_TO_SELECTED_FIRST_READY_PACKAGE_ONLY
SELECTED_FIRST_READY_PACKAGE = PKG-01
DEPLOYMENT_AUTHORIZATION = false
R0_7E_IMPLEMENTATION_AUTHORIZATION = false
GENERAL_C3_S9_IMPLEMENTATION_RESUME_AUTHORIZATION = NOT_GRANTED
```

This document is the human-readable authority for the seven-package backlog.
The machine-readable contract is
`docs/governance/r0-7d-md05-pkg01-pkg07-execution-backlog-r1.yaml`.
If they diverge, this Markdown file controls.

Package numbers are the dependency order established in this run. They are
not recovered historical identifiers. Commit `a277a19` is not implementation
authority.

PKG-00 observations stay open:

- O01: the serializable transaction starts before `appendWithin`.
- O02: the PT24H anchor is `metadata.occurredAt`.
- O03: authority is enforced on metadata roles rather than `actor.roles`.

PKG-01 requires `actor.roles` at the new application boundary. That does not
close O03, because the audit service is unchanged.

## Selection

1. Order is PKG-01, then PKG-02, then PKG-03, then PKG-04 and PKG-05, then
   PKG-06, then PKG-07.
2. PKG-03 through PKG-07 need an owner or DPO decision and are excluded.
3. PKG-02 depends on PKG-01, which is not yet integrated, so PKG-02 is not
   eligible in this run.
4. PKG-01 does not need credentials or an external system.
5. PKG-01 is the earliest remaining READY package.

## PKG-01 — Executable role-administration application boundary

Status: READY.

Purpose: evaluate one PKG-00 contract snapshot against the authenticated
actor and return a fail-closed decision. No grant, revoke, audit append,
identity-provider call, or local role row is performed.

Dependencies: none inside this backlog. The merged PKG-00 contract is the
integration precondition.

Production allowlist:

- `apps/api/src/app.module.ts`
- directory `apps/api/src/role-administration/`
- `apps/api/src/role-administration/role-administration.module.ts`
- `apps/api/src/role-administration/role-administration-boundary.service.ts`
- `apps/api/src/role-administration/role-administration-boundary.types.ts`
- `apps/api/src/role-administration/role-administration-legacy-aliases.ts`

Test allowlist:

- `apps/api/src/role-administration/role-administration-boundary.service.spec.ts`

Schema and migration: none.

Forbidden: the audit service and registry, both canonical case directories,
shared-types role and contract sources, Prisma schema, and the grievances
facade.

Tenant control: the actor tenant must equal the command tenant and every
declared party tenant.

Authorization: `actor.roles` must include `STAFF_ROLEADM`. Metadata role
fields are not sufficient. `COMPLAINT_HANDLER` is the only managed role and
is not an authority role.

SoD: no self-assignment, no self-revocation, no `STAFF_ROLEADM`
self-management, and the caller must be the party who owns the submitted
decision. `STAFF_ROLEADM` does not gain complaint-case mutation.

Audit events: none. This package must not append.

Privacy: authenticated user identifier, external subject identifier, tenant
identifier, role code, reason code, and correlation identifier are read in
memory. `privacy_basis_status` is `NO_NEW_PROCESSING_ACTIVITY`. No statutory
basis is claimed. No store and no retention period are created.

Acceptance: the test file must cover the happy path, missing actor, wrong
role, missing MFA, wrong tenant, cross-tenant target, empty identity, SoD
conflict, invalid state pairing, duplicate evaluation, absence of audit,
absence of sensitive result fields, legacy alias rejection, and no
persistence call.

Commands: the API Jest file above; API and shared-types typecheck; API and
shared-types build; the existing PKG-00 regression commands listed in the
YAML.

Risk: medium. The gate can be mistaken for a completed grant if a later
caller ignores `roleMutationPerformed: false`.

Owner decision still required: none.

## PKG-02 — External identity-provider role-management port

Status: READY. Depends on PKG-01. Not selected, because PKG-01 is earlier
and is not yet integrated.

Purpose: a provider-neutral port and an unbound adapter that fails closed
without a credential, host, or network call.

Production allowlist is the role-administration directory plus:

- `apps/api/src/role-administration/external-idp-role-management.port.ts`
- `apps/api/src/role-administration/unbound-external-idp-role-management.adapter.ts`
- `apps/api/src/role-administration/role-administration.module.ts`

Test allowlist:

- `apps/api/src/role-administration/unbound-external-idp-role-management.adapter.spec.ts`

Schema and migration: none. Audit events: none.

Privacy: `NO_NEW_PROCESSING_ACTIVITY`. The adapter returns before any
transmission.

Owner decision still required: none for the unbound port. Selecting a
provider remains forbidden and is a PKG-03 blocker, not a PKG-02 blocker.

Risk: low.

## PKG-03 — Role grant and revoke workflow with immutable audit

Status: IMPLEMENTED_PENDING_INDEPENDENT_REVIEW. Depends on PKG-01 and PKG-02.

Owner selection: A1, B1, C1R, D1. The policy record is
`docs/governance/R0_7D_MD05_PKG03_POLICY_AND_SCOPE_FREEZE_R1.md`.

Purpose: four-eyes grant, immediate revoke, PT24H post-review, and the ten
PKG-00 audit events. Apply stays an external identity-provider effect. This
slice appends the existing audit ledger only and leaves PKG-02 unbound.

Adopted processing: no new workflow store and no new retention clock. Personal
data in this package is limited to the existing audit-event metadata.
Retention inherits the platform audit-log policy of 10 years. Statutory
article citation is not fixed. DPO or controller validation is required before
production deployment and does not block implementation. No identity-provider
provider, host, realm, or credential is selected.

Production paths:

- `apps/api/src/role-administration/role-administration-workflow.service.ts`
- `apps/api/src/role-administration/role-administration.controller.ts`
- `apps/api/src/role-administration/dto/role-administration-command.dto.ts`
- `apps/api/src/role-administration/role-administration.module.ts`

Test paths:

- `apps/api/src/role-administration/role-administration-workflow.service.spec.ts`
- `apps/api/src/role-administration/role-administration.controller.spec.ts`

Schema: none. A local role column is forbidden. The audit service file is
forbidden, so O01, O02, and O03 stay open unless a later authorization names
them. `apps/api/src/app.module.ts` stays unchanged because
`RoleAdministrationModule` is already imported.

`PROVIDER_UNBOUND` appends `ROLE_GRANT_FAILED` or `ROLE_REVOKE_FAILED` and
does not append an applied event. An unapplied revoke creates no post-review
deadline.

Risk: medium. The slice writes the existing audit ledger and cannot change an
external role while the port is unbound.

## PKG-04 — Canonical complaints domain module

Status: BLOCKED_POLICY. No backlog dependency. It does not wait on the
identity-provider port, and the port does not wait on it.

Purpose: `apps/api/src/cert-complaints/` as a complaints-only module.
Appeals types are forbidden in this module.

Blocked decisions:

- statutory privacy basis for complaint content, public reference, and
  evidence metadata;
- retention period;
- who may acknowledge, investigate, recommend, and finally decide.
  `COMPLAINT_HANDLER` was named as a role. Phase 0 did not grant complaint
  operations.

SoD already frozen and still binding when this package is later authorized:
intake, investigation, and final decision cannot be the same actor on one
case; auditor, director, system administrator, and role administrator are
not complaint mutation roles.

Risk: high.

## PKG-05 — Canonical appeals domain module

Status: BLOCKED_POLICY. No backlog dependency.

Purpose: `apps/api/src/cert-appeals/` as an appeals-only module. The original
certification decision-maker cannot acknowledge, void, start, or record the
outcome. A committee identifier is required. The string `appeals_committee`
is not a canonical RBAC role and must not be added by inference.

Blocked decisions:

- statutory privacy basis for appeal content and certification-decision
  linkage;
- retention period;
- how a constituted committee identifier is proved.

Risk: high.

## PKG-06 — Tenant-scoped complaints and appeals persistence

Status: BLOCKED_POLICY. Depends on PKG-04 and PKG-05.

Purpose: separate tenant-owned complaint and appeal aggregates, additive
reversible migration, no shared grievance table, no role column, no
production migrate.

Prospective files:

- `packages/database/prisma/schema.prisma`
- `packages/database/prisma/migrations/20261005120000_md05_complaints_appeals_cases/migration.sql`
- `packages/database/test/md05-complaint-appeal-schema.test.ts`

Privacy basis and retention are inherited from PKG-04 and PKG-05 and are not
recorded. Risk: high.

## PKG-07 — Canonical grievances facade, consumers, and legacy-alias removal

Status: BLOCKED_POLICY. Depends on PKG-04, PKG-05, and PKG-06.

Purpose: restore `frontend-app/src/lib/api-grievances.ts` as a thin facade
and align the current consumers. The facade must not write the audit trail,
must not blank an authenticated subject, must forward a real committee
reference, and must surface decision-start 409. Legacy `/v1/me/*` and
`/v1/admin/*` grievance aliases are removed only inside this package.

`ADDITIONAL_PATHS` stays none. The other frontend files are package paths.
They are not additional Model D paths. Client guards are not server
authority.

Blocked because complaint and appeal content would be presented to clients
without a recorded privacy basis, and because the server modules do not
exist.

Implementing this package would still not formally resolve MD05.

Risk: high.

## Counts

```text
BACKLOG_PACKAGE_COUNT = 7
BACKLOG_READY_PACKAGE_COUNT = 2
BACKLOG_BLOCKED_PACKAGE_COUNT = 5
BACKLOG_DEFERRED_PACKAGE_COUNT = 0
```

## Non-claims

This backlog does not resolve MD05, change Model D, authorize deployment,
authorize R0-7E, or grant a general C3-S9 resume. OQ-4 stays open.
R0-7D stays `OPEN_IMPLEMENTATION_BLOCKER`.
