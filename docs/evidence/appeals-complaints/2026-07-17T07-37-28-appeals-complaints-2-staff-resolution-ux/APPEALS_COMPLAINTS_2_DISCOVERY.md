# APPEALS-COMPLAINTS-2 Discovery

| Item | Status |
|------|--------|
| Based on | `3010d84` |
| Staff page | true |
| Staff guard / access | true / true |
| Route `/dashboard/admin/appeals-complaints` | true |
| B14 staff API | true |
| B15 staff API | true |
| No cert lifecycle hooks in staff page | true |

Canonical staff APIs already expose list/detail/acknowledge/void plus deeper pipeline (admissibility, triage, decision, remedy/action). This slice wires staff queues + detail + safe foundation mutations; deeper pipeline UI is deferred.
