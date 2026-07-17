# RBAC denial

| Actor | Route | Expected | Result |
|-------|-------|----------|--------|
| Staff (`pilot.sysadmin@confora.test`) | `/dashboard/admin/appeals-complaints` | page visible | PASS |
| Learner (`pilot.learner@confora.test`) | `/dashboard/admin/appeals-complaints` | redirect `/unauthorized` | PASS |

Guard: `StaffAppealsComplaintsGuard` → `evaluateStaffAppealsComplaintsAccess`. Learners/candidates are denied.
