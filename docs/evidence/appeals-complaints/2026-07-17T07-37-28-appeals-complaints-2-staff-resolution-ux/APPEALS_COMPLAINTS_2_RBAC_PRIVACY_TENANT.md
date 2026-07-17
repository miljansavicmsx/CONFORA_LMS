# RBAC / privacy / tenant

| Check | Result |
|-------|--------|
| Staff route requires staff roles | PASS (unit) |
| Learner denied staff route | PASS (unit) |
| Tenant isolation | PRESERVED (API staff controllers enforce tenant; FE does not weaken) |
| Privacy | No extra PII fields surfaced beyond existing staff list/detail DTOs |
| Staff RBAC | PRESERVED |
