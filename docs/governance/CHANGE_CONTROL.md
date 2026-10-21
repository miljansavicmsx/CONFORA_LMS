# CONFORA Change Control

**Document ID:** CON-GOV-CHANGE-CONTROL-001
**Status:** Normative (authored in R0-1B1)
**Owner:** Repository Owner + Architecture Lead
**Authority level:** Governance Hierarchy Level 3

Defines how CONFORA governance and architecture documents are owned, changed, reviewed, and rolled back.

---

## 1. Governance document ownership

| Document class                            | Owner(s)                                                                |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| Canonical Development Baseline            | Repository Owner **and** Architecture Lead                              |
| Engineering Constitution / Change Control | Repository Owner **and** Architecture Lead                              |
| Owner Decision Register / Package         | Repository Owner                                                        |
| ADRs                                      | Architecture Lead (draft) + Repository Owner (approval of supersession) |
| Compliance mappings                       | Compliance **and** Architecture review                                  |
| Standards Reference Policy                | Architecture Lead + Compliance                                          |
| Evidence packages                         | Task author (append-only; not normative)                                |

## 2. Baseline modification approval

Changes to the Canonical Development Baseline require **both the Repository Owner and the Architecture Lead**. Changes are recorded with a dated rebaseline note and evidence; the Baseline's §0 addendum pattern is preferred over silent rewrites.

## 3. ADR authoring and supersession

- ADRs are drafted by the **Architecture Lead**.
- Superseding an accepted ADR (e.g. ADR-001 frontend, ADR-002 backend) requires an Architecture Lead draft **and** Repository Owner approval.
- Supersession must reference the superseded ADR ID and preserve the historical record.

## 4. Compliance mapping approval

ISO/standards control mappings require **Compliance and Architecture** review before entering the authoritative corpus, and must pass the copyright checks in `STANDARDS_REFERENCE_POLICY.md`.

## 5. Emergency exception process

An emergency change may proceed only when: (a) a named approver authorizes it, (b) the reason and scope are recorded immediately, and (c) a follow-up review and evidence package are filed within 5 working days. Emergency changes must not bypass SoD for certification decisions.

## 6. Temporary waiver requirements

A waiver temporarily accepts a known deviation. Every waiver must record: the deviation, the compensating control, the approver, the **expiry/review date**, and the exit condition. Waivers without an expiry are invalid.

## 7. Risk acceptance expiry

Accepted risks (e.g. RA-R03-1 administrator bypass) are **temporary**. Each carries a review date after which acceptance lapses unless explicitly renewed in evidence. No permanent risk acceptance is allowed.

## 8. Required evidence

Governance and high-risk changes require a dated evidence package containing at minimum: identity/verification, changed-file scope, validation results, and a summary with a verdict. Evidence distinguishes requirement, implementation, verification, and residual gap.

## 9. Review cadence

- Baseline and Constitution: reviewed at each phase gate or on material change.
- Owner Decision Register: reviewed whenever a new OD/OQ is decided.
- Waivers and accepted risks: reviewed on or before their expiry date.

## 10. Rollback

Every governance change identifies its rollback boundary. Document changes are reverted by reverting the specific commit/PR. Rollback must not silently re-enable a previously contained risk (e.g. reverting R0-3 re-arms auto-deploy and is prohibited without Security/Release acceptance).

## 11. Document versioning

Governance documents carry a Document ID and are versioned through git history. Material changes update the status line and, where applicable, add a dated addendum rather than erasing prior text.

## 12. Conflict resolution

Conflicts between documents are recorded and escalated per `GOVERNANCE_HIERARCHY.md`. An agent must not silently resolve a conflict.

## 13. Security Review Gate

Owner decision of 2026-10-21. Normative text: [SECURITY_REVIEW_GATE.md](./SECURITY_REVIEW_GATE.md).

Every pull request that changes authentication, authorization, RBAC, tenant isolation, processing of sensitive data, or other security-critical functionality must pass an independent review before merge approval. The reviewer must not be the author of the changes. The review covers change analysis, access-control verification (authn, authz, tenant isolation), regression tests proving the fix and no breakage, all relevant CI checks passing, and an independent reasoned GO/NO-GO tied to a specific commit SHA. Any later change to security-relevant code requires re-review of that part. Known tenant-isolation gaps block production use with real data until fixed.

The pull-request template checklist records these items. Merge approval waits for the independent GO on the reviewed SHA.

---

## Role-combination rule

Where one person temporarily holds multiple roles (e.g. Repository Owner and Architecture Lead), this must be **explicitly recorded** in the relevant decision, and **material supersessions require independent review** by a person other than the author.
