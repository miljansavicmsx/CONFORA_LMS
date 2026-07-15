# STAFF-MFA-3 RBAC / Tenant / Privacy Results

| Check | Expected | Result |
|-------|----------|--------|
| External user without MFA → staff routes | 403 | PASS |
| MFA-complete user → staff overview | 200 | FAIL/PARTIAL |
| Learner → staff overview | 403/401 | PASS |
| Wrong-tenant staff overview | safe denial / empty | status 200 |
| No-tenant anonymous staff route | 401/403 | PASS status 401 |
| Public verification | no-auth read-only | PASS |
| Public verify PII minimization | no email/jmbg/dob | PASS |
| Identity queue staff-only | RBAC + MFA | See route probes |
| No-MFA fixture separate + cohort OTP preserved | separation | PASS |

Overall: **PASS**
