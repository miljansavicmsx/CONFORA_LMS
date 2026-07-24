# CONFORA-REPO-HEALTH-25 — Workflow Boundary Review

## Findings count

**`workflow_boundary_findings_count`: 1** (residual on opaque body + English subjects — not a conflated decision engine)

## Positive separations in `event-keys.ts`

Distinct keys for:

- enrollment vs exam vs application decision vs certificate issued/expiring/expired vs recertification
- `appeal.*` vs `complaint.*` vs `contact.*` (žalba / prigovor / contact not conflated at key level)
- `exam.passed` / `exam.failed` ≠ `application.decision.approved` ≠ `certificate.issued`

## Template / subject behavior

| Check | Result |
|-------|--------|
| Template creates certification decision | **no** |
| Template implies exam pass = certification | **no** in MJML; subjects keep separate event titles |
| Template implies certificate ACTIVE solely because issued | **no** (no lifecycle status machine in templates) |
| Conflates education/exam/decision/issuance/lifecycle/recert | **keys do not**; freeform `bodyText` could if caller miswrites |
| Conflates žalba/prigovor/contact | **keys do not** |

## Residual

SUBJECT_EN strings are product English event titles (e.g. “Exam passed”, “Certificate issued”). They notify discrete events; they must not be expanded in body copy to claim certification from exam alone. Enforce in notification service content builders.

## Verdict

Taxonomy **PASS**. Loader/subjects need i18n rework but are not a decision authority.
