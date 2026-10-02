# Detailed RBAC / SoD matrix freeze

```text
RECORD_UTC = 2026-10-02T20:05:52Z
SOD_MATRIX_FROZEN = true
SOD_COMPLETE_CLAIMED = false
OQ_5_STATUS = DIRECTIONAL
COMPLAINT_HANDLER_ROLE = NOT_NAMED
```

## Frozen Alternative A pins

| Pin | Value |
| --- | --- |
| APPEAL_RESOLUTION_COMMITTEE_ID_REQUIRED | true |
| AUTHENTICATED_CASE_EMPTY_USER_ID_ALLOWED | false |
| IMMUTABLE_CASE_AUDIT_EVENTS_REQUIRED | true |
| TENANT_ISOLATION_REQUIRED | true |
| ORIGINAL_CERTIFICATION_DECISION_MAKER_MAY_APPROVE_APPEAL | false |
| ADMINISTRATOR_CASE_DECISION_ROLE | false |
| AUDITOR_CASE_MUTATION_ROLE | false |
| LEGACY_V1_ALIAS_ROUTING_CANONICAL | false |

## Frozen actor matrix

| Actor | Frozen rule |
| --- | --- |
| Appellant or complainant | Authenticated learner/candidate; own cases only |
| Public submitter | Complaint intake only; no appeal; no staff mutation |
| `appeals_committee` | Appeal acknowledge/void/decision start/outcome only if not original decider |
| Original certification decision-maker | Prohibited from those appeal mutations for that case |
| Complaint handler | NOT_NAMED; cannot borrow `com_cert`, `admin`, `sys_admin`, `director`, `auditor` |
| Auditor | No mutation |
| admin / sys_admin / director / training_admin / staff_dir / staff_sysadm / com_app / com_imp / com_cert | Not appeal or complaint mutation roles |

## Frozen operations

| Operation | Allowed actor | Server obligation |
| --- | --- | --- |
| Submit own appeal | Appellant | Bind token subject and tenant; reject client-supplied user/tenant ids |
| Submit complaint | Complainant or public | Public status omits submitter email |
| Read own case | Owning party | Cross-subject empty list or 404; no existence leak |
| Staff list/read appeals | `appeals_committee` | Tenant from token; not original-decider shortcut |
| Acknowledge/void appeal | `appeals_committee` not original decider | Persist actor, case, tenant, time; void needs reason |
| Start appeal decision | Same | 409 if already started; client must not continue |
| Record appeal outcome | Same | Require server committee reference; disposition only |
| Acknowledge/void complaint | Named complaint handler only after owner names role | Must not record appeal outcome |
| Certificate lifecycle via this residual | Nobody | Hard refusal |

## Known live defect (not patched)

`evaluateStaffAppealsComplaintsAccess` currently allows roles beyond
`appeals_committee`. That is a defect relative to this freeze. This
package does not modify that file. `IsoGrievancesAdminPanel` still passes
`resolutionCommitteeId: "appeals_committee"` (role label as committee id);
that remains rejected by this freeze and is not patched here.

## Baseline alignment

Baseline §7 requires that a certification committee member shall not
decide an appeal against their own decision, and that SoD is enforced
server-side. This freeze records that requirement for MD05 Alternative A
without claiming complete SoD implementation.
