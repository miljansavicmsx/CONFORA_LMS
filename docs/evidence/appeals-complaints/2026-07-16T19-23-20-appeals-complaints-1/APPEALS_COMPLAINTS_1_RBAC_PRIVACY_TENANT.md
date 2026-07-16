# RBAC / privacy / tenant

| Control | Status |
|---------|--------|
| Learner roles USR_CAND/USR_CERT on learner routes | Existing B14/B15 |
| Staff routes require staff RBAC | Boundary e2e + existing guards |
| Learner sees own cases only | Existing service standing checks |
| Tenant isolation | tenantScoped audit + Prisma tenant filters |
| No public PII on public complaint status | Existing B15 public surface |
