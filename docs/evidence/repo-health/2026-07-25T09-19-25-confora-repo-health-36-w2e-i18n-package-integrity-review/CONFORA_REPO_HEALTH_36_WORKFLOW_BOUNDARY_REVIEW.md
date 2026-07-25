# CONFORA-REPO-HEALTH-36 — Workflow Boundary Review

Locale copy inspected against mandated CONFORA boundaries.

| Boundary | Enforced in copy? | Evidence |
|----------|-------------------|----------|
| Exam pass ≠ certified status | **yes** | `candidatePortal.wallet` distinguishes `EXAM_PASS_CERTIFICATE` / `COURSE_COMPLETION_CERTIFICATE` / `PERSON_CERTIFICATION`; HR: "jasnom granicom između edukacije, ispita i certifikacije" |
| Certification decision ≠ certificate issuance | **yes** | HR notice: professional cert issued "tek nakon odvojenog postupka certifikacije, odluke … i izdavanja certifikata" |
| ISSUED ≠ ACTIVE | **yes** | `statusLabels`/`wallet.status` list ISSUED ("Izdano/Izdat") and ACTIVE ("Aktivan") as distinct entries |
| Education ≠ certification | **yes** | Separate document types + "Ova potvrda nije ISO/IEC 17024 certifikat osobe." |
| žalba ≠ prigovor | **yes** | `navigation`: `appeals`="Žalbe", `complaints`="Prigovori" distinct (combined menu label `appealsComplaints`="Žalbe i prigovori" is a grouping label only) |
| Lifecycle ≠ recertification | **yes** | `recertification` namespace scoped to CPD/recert; no conflation with generic lifecycle |
| Contact request ≠ žalba/prigovor | **yes** | No contact-request copy conflated with appeals/complaints in these namespaces |

## Result

`workflow_boundary_blocking_findings: 0` — boundaries actively reinforced by copy (especially HR candidate portal).

Caveat: the `appealsComplaints` extra key (parity drift) is a **structural** issue (see completeness review), not a boundary violation — it keeps žalbe and prigovori distinct.
