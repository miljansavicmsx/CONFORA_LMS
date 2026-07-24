# CONFORA-REPO-HEALTH-26 — Workflow Boundary Review

Event keys remain **separate** identifiers. Catalog does **not** imply:

| Forbidden conflation | Separated keys (examples) |
|----------------------|---------------------------|
| Exam pass = certified | `exam.passed` ≠ `application.decision.approved` ≠ `certificate.issued` |
| Decision = issuance | `application.decision.*` ≠ `certificate.issued` |
| ISSUED = ACTIVE | No `ACTIVE` lifecycle key; issued/expiring/expired/recert are distinct |
| Education = certification | `enrollment.*` ≠ certification/certificate keys |
| Žalba = prigovor | `appeal.*` ≠ `complaint.*` ≠ `contact.*` |
| Lifecycle = recertification | expiring/expired ≠ `certificate.recertification.*` |

**`workflow_boundary_blocking_findings`: 0**
