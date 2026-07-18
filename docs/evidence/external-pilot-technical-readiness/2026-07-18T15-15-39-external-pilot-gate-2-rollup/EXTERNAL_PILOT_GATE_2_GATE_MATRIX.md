# EXTERNAL-PILOT-GATE-2 — Gate Matrix

| # | Gate | Packaged? | Signed / approved? | Status | Blocks external pilot? |
|---|------|:---------:|:------------------:|--------|:----------------------:|
| 1 | Technical security conditions (A-02-R3) | Yes | No | Ready for actual security delegate signoff | Indirect (needs A-03) |
| 2 | Security delegate actual decision (A-03) | Yes | **No** | `A03_SECURITY_DELEGATE_DECISION_PENDING` | **YES** |
| 3 | DPO/legal preparation (DPO-LEGAL-SIGNOFF-1) | Yes | No | Ready for review, not signed | Indirect (needs DPO-LEGAL-2) |
| 4 | DPO/legal actual decision (DPO-LEGAL-2) | Yes | **No** | `DPO_LEGAL_2_DECISION_PENDING` | **YES** |
| 5 | Real personal data approval | No | **No** | Not approved | **YES** |
| 6 | External pilot gate decision | This rollup | **No** | NO-GO | **YES** (self) |
| 7 | Staging validation (if required) | No | **No** | Not claimed | **YES** if required |
| 8 | Production readiness | No | **No** | Not claimed | **YES** if claimed needed |
| 9 | Appeals & Complaints module | Yes (final GO) | N/A (module evidence) | Module confirmed; not a pilot approval | No (does not unblock PII/external) |
| 10 | Public verification privacy posture | Yes (via A-02-R3 / TD-085 chain) | N/A | Preserved in technical evidence | Accept-as-condition candidate |

## Gate interpretation

| Question | Answer |
|----------|--------|
| Are decision **packages** ready for humans to sign? | **Yes** — A-03 and DPO-LEGAL-2 exist |
| Are decision **signatures** present? | **No** |
| Is external pilot approved? | **No** |
| Can program continue internal/synthetic technical work? | Yes, subject to existing local pilot constraints |
| Can program start external real-candidate pilot? | **No** |

## Summary counts

| Category | Count |
|----------|------:|
| Packaged for human decision | 2 (A-03, DPO-LEGAL-2) |
| Signed decisions | 0 |
| Hard blockers for external pilot | 4 (see blockers list) |
| Module GO items that do not approve pilot | 1 (Appeals & Complaints final) |
