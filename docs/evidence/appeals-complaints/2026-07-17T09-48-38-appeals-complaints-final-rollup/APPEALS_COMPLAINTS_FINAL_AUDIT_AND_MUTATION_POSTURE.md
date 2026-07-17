# APPEALS-COMPLAINTS-FINAL — Audit and Mutation Posture

## Audit

| Operation | Audit posture | Notes |
|-----------|---------------|-------|
| Learner submit appeal / complaint | Written (slice 1: `audit_events_written: true`) | Intake creates auditable cases |
| Staff acknowledge | Written by backend API | Case status transition |
| Staff void | Written by backend API | Requires reason in UI |
| Full B14/B15 decision / remedy / action UI | **Deferred** | Not executed from staff resolution screen |

### Rollup audit field

`audit_events_written_or_deferred`: **`WRITTEN_FOR_ACK_VOID_FULL_PIPELINE_DEFERRED`**

Meaning:

- Acknowledge / void paths write audit via existing APIs.
- Full formal resolution pipeline UI remains deferred; domain lifecycle side effects are not exposed on the staff screen.

## Mutation posture (what this module may change)

| May change | May not change |
|------------|----------------|
| Appeal case status (e.g. acknowledge / void) | Certification status |
| Complaint case status (e.g. acknowledge / void) | Exam result / pass-fail |
| Staff/learner case metadata as designed by APIs | Certificate issuance |
| | Certificate lifecycle (activate/suspend/withdraw/renew/revoke) |
| | Public verification records |
| | Reports / export contracts |

## Staff UX deferred notice (product copy)

Staff page states that full B14/B15 flow (admissibility, evidence, triage, investigation, remedy/action with domain links) remains on the API / future work; this screen supports queue, detail, acknowledge, and void only.
