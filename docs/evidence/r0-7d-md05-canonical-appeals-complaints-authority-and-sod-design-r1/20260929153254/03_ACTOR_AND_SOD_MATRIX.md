# Actor and segregation-of-duties matrix

DESIGN_UTC = 2026-09-29T15:32:54Z
SOD_COMPLETE_CLAIMED = false
OQ_5_STATUS = DIRECTIONAL

This matrix is a design requirement for a later implementation. It is
not the current `evaluateStaffAppealsComplaintsAccess` allow-list, and
it does not change that function.

## Actors

| Actor | Design rule |
| --- | --- |
| Appellant or complainant | Authenticated learner or candidate. Reads and submits only their own cases. |
| Public submitter | Unauthenticated complaint intake only. No appeal. No staff operation. |
| Appeals committee member | Role id already present in the staff helper: `appeals_committee`. May acknowledge, void, start, and record an appeal only when the server proves they are not the original certification decision-maker for that case. |
| Original certification decision-maker | The recorded decider on the decision under appeal. Prohibited from acknowledge, void, decision start, and decision outcome for that appeal, even if they also hold `appeals_committee` or `com_cert`. |
| Complaint handler | Not named by this design. `COMPLAINT_HANDLER_ROLE = NOT_NAMED`. Implementation cannot borrow `com_cert`, `admin`, `sys_admin`, `director`, or `auditor`. |
| Auditor | No mutation. A read-only audit view is outside this design until separately authorized. |
| Admin, sys_admin, director, training_admin, staff_dir, staff_sysadm, com_app, com_imp, com_cert | Not appeal or complaint mutation roles under this design. Holding those roles does not grant acknowledge, void, or decide. |

## Operations

| Operation | Allowed actor | Server obligation |
| --- | --- | --- |
| Submit own appeal | Appellant | Bind the case to the token subject and tenant. Do not accept a client-supplied user id or tenant id. |
| Submit own or public complaint | Complainant or public submitter | Public response returns reference and status, not the submitter email. |
| List or read own case | Owning party | Other subjects in the same tenant receive an empty list or 404, with no existence leak. |
| Staff list appeals | Appeals committee member | Not the original decider's personal queue shortcut. Tenant from token. |
| Acknowledge or void appeal | Appeals committee member who is not the original decider | Void requires a non-empty reason. Persist actor, case, tenant, and time. |
| Start appeal decision | Same | Status 409 if already started. The client must not ignore 409 and continue. |
| Record appeal outcome | Same | Require a server-known committee reference. Reject a role label such as the string `appeals_committee` as if it were a committee id. Outcome is appeal disposition only. |
| Acknowledge or void complaint | Named complaint handler, once an owner names the role | Must not record an appeal outcome. |
| Issue, revoke, or alter a certificate | Nobody, through this residual | Refusal is part of the appeal and complaint boundary. |

## Current code that this design does not adopt

`evaluateStaffAppealsComplaintsAccess` currently allows
`appeals_committee` together with `sys_admin`, `admin`, `director`,
`auditor`, `quality_manager`, `training_admin`, `staff_dir`,
`staff_sysadm`, `com_app`, `com_imp`, and `com_cert`. That list is a
defect relative to this design. This package does not patch it.

`IsoGrievancesAdminPanel` passes `resolutionCommitteeId: "appeals_committee"`.
The only known historical wrapper discards that field. Both are
rejected by this design. Neither file is modified here.

## Committee identity

A committee reference is a server-side identifier of a constituted
appeals committee, not a role name. The client sends it. The server
checks that the actor is a member of that committee and is not the
original decider. Missing, unknown, or self-decided cases are refused.
The refusal is an authorization result, not a successful decision with
an empty committee.
