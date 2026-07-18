# DPO-LEGAL-2 — Conditions

Privacy/legal conditions carried forward from DPO-LEGAL-SIGNOFF-1 and current security posture. Status values reflect **evidence summaries**, not a signed acceptance.

| # | Condition | Evidence status | Blocks external pilot? |
|---|-----------|-----------------|:----------------------:|
| 1 | DPO-LEGAL-SIGNOFF-1 package prepared (inventory, purposes, DPIA brief, DSR/retention, processors, gate) | READY_FOR_REVIEW_NOT_SIGNED | Needs decision |
| 2 | DPIA decision | PENDING_DPO_DECISION (per DPO-LEGAL-1) | **YES** if external real-candidate processing |
| 3 | DSR procedure | PARTIAL (per DPO-LEGAL-1) | **YES** until adequate |
| 4 | Retention schedule | PARTIAL (per DPO-LEGAL-1) | **YES** until adequate |
| 5 | Privacy notice | PARTIAL (per DPO-LEGAL-1) | **YES** until adequate |
| 6 | Processor agreements / transfers | PARTIAL (per DPO-LEGAL-1) | **YES** until adequate |
| 7 | External pilot gate (G-EP) | NOT APPROVED; G-EP conditions unmet | **YES** |
| 8 | Real personal data approval | NOT APPROVED | **YES** |
| 9 | Security delegate actual signed decision (A-03) | PENDING | **YES** (parallel gate) |
| 10 | A-02-R3 technical security conditions | Ready for delegate signoff; unsigned | Needs security decision |
| 11 | Appeals & Complaints module | GO (module evidence only) | Does not authorize PII/external pilot |
| 12 | Public verification privacy posture (no-auth / read-only / PII minimized) | Preserved in security evidence chain | Accept-as-condition candidate |
| 13 | Staging / production validation | NOT CLAIMED | **YES** if required by program |

## Condition notes for any future APPROVE_WITH_CONDITIONS

If DPO/legal later selects `APPROVE_WITH_CONDITIONS_FOR_EXTERNAL_PILOT_GATE_REVIEW`, typical condition candidates include:

- C-01: Formal DPIA completed and accepted before real-candidate processing.
- C-02: DSR and retention procedures operationalized and evidenced.
- C-03: Processor / transfer agreements in place for in-scope processors.
- C-04: Security delegate signed decision recorded (A-03 or successor).
- C-05: External pilot gate package still required separately; this DPO decision alone is not external approval.

Condition rows in the signed template remain blank until a real DPO/legal reviewer fills them.
