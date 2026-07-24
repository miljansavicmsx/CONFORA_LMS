# CONFORA-REPO-HEALTH-27 — Workflow Boundary Review

**`workflow_decision_logic_present`: false**  
**`workflow_boundary_findings_count`: 0** (blocking)

Loader does not compute certification outcomes. Subjects name discrete events already separated in `event-keys.ts`:

| Forbidden conflation | Status in this package surface |
|----------------------|--------------------------------|
| Exam pass = certified | Separate subject keys; no merge logic |
| Decision = issuance | Separate subjects |
| ISSUED = ACTIVE | No ACTIVE machine |
| Education = certification | Separate enrollment vs cert subjects |
| Žalba = prigovor | Separate appeal vs complaint vs contact |
| Lifecycle = recertification | Separate expiring/expired vs recert subjects |

Residual: notification **body** text (caller-owned via placeholders) must not conflate — enforce in notification service content builders, not in this loader.
