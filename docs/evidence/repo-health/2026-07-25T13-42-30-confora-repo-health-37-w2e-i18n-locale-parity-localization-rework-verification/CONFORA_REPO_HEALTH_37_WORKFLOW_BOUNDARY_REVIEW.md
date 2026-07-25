# CONFORA-REPO-HEALTH-37 — Workflow Boundary Review

Reviewed the 14 modified locale files against CONFORA boundaries.

| Boundary | Status | Evidence |
|----------|--------|----------|
| Education ≠ certification | **hold** | Wallet hero: clear boundary between education, exams, and certification |
| Exam result ≠ certification decision | **hold** | Distinct `EXAM_PASS_CERTIFICATE` vs `PERSON_CERTIFICATION` |
| Decision ≠ issuance | **hold** | `professionalSection`: process + decision + issuance sequence |
| ISSUED ≠ ACTIVE | **hold** | Distinct status labels (`Izdano` / `Aktivan`) |
| Lifecycle ≠ recertification | **hold** | Recertification scoped as its own module copy |
| žalba ≠ prigovor | **hold** | Separate `appeals` / `complaints`; combined label only as grouping |
| Contact ≠ žalba/prigovor | **hold** | `supportContact` remains distinct from appeals/complaints items |

## Terminology

| Rule | Result |
|------|--------|
| `upravljanje` not `menadžment` (bs/sr) | **pass** — no `menadžment` in modified files; `Upravljanje` used |
| `komitet` for certification committee (dashboard) | **pass** — `Certifikacijski komitet` in bs/sr/hr dashboard roles |

Note: pre-existing navigation section label `appealsCommittee` / `Žalbena komisija` was not part of F1–F5 rework scope (only `items.appealsComplaints` added/corrected).

`workflow_boundary_blocking_findings: 0`
