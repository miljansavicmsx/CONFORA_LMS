# CONFORA R0-7E Work-Package Governance

**Document ID:** CON-GOV-R07E-WP-001
**Status:** PROPOSED NORMATIVE REPOSITORY PROMOTION — EFFECTIVE ONLY AFTER REVIEWED MERGE
**Owner:** CONFORA Architecture & Governance
**Authority level:** Governance Hierarchy Level 3
**Owner decisions:** OD-R07E-1 through OD-R07E-8

## Purpose and authority

This document defines separation, sequencing, and authorization gates for
future R0-7E work. It does not authorize implementation, workflows, settings,
merge, deployment, R0-7D execution, or R0-7F.

Until this document is integrated by a separately reviewed and authorized
merge into the authoritative integration branch, it has no normative effect.

## Authorization rule

No work package is implicitly authorized by planning, policy adoption, evidence,
independent review, predecessor completion, check state, or merge readiness.
Before execution, every package must receive a separate owner authorization that
identifies its exact base, branch, path allowlist, prohibited paths, commands,
tests, commit and push limits, evidence boundary, reviewers, stop conditions,
and merge and deployment state.

Implementation authorization, merge authorization, repository-setting
authorization, and deployment authorization are distinct decisions and cannot
be inferred from one another.

## Authorization state at promotion

```text
R0_7E_NORMATIVE_PROMOTION_PACKAGE_AUTHORIZATION = GRANTED
NORMATIVE_PROMOTION_PR_AUTHORIZATION = false
R0_7D_IMPLEMENTATION_AUTHORIZATION = false
R0_7E_IMPLEMENTATION_AUTHORIZATION = false
IMPLEMENTATION_AUTHORIZATION = false
MERGE_AUTHORIZATION = false
DEPLOYMENT_AUTHORIZATION = false
```

## Required sequence

1. Complete R0-7D through a separately authorized forward-only package and
   independently reviewed merge before any R0-7E implementation.
2. Keep OD-R07E-3 deferred until approved database source authority and an exact
   owner decision exist. Database-dependent work remains blocked.
3. Scope and authorize `R0-7E-Q1` separately for the isolated tracked quality
   baseline cause after prerequisites are satisfied.
4. Scope and authorize `R0-7E-Q2` separately for six-lane orchestration and
   honest missing-authority behavior.
5. Scope and authorize `R0-7E-C1` separately for policy and implementation
   validation separation.
6. Restore the F4 validator only through a separate prerequisite package with
   approved source authority and an exact path allowlist.
7. Restore canonical technical-debt authority only through a separate
   reconciliation package. Do not create `docs/governance/TECH_DEBT.md` or
   close TD-006 by implication.
8. Create closure evidence only after authorized operational packages are
   complete at an exact published head.
9. Require independent read-only review, then a separate owner readiness
   decision, then a separate exact merge authorization.
10. Treat R0-7F as a later programme requiring its own plan, review, and owner
    authorization after R0-7E post-merge verification.

## Separation requirements

- Operational, test, normative-governance, and evidence changes must remain
  reviewable and traceable. Any mixed commit requires explicit authorization and
  classification; convenience alone is insufficient.
- Evidence packages are Level 7 and cannot create policy or prove an untested
  implementation.
- Rejected branches and local-only files cannot become source authority through
  wholesale promotion.
- Workflow changes cannot conceal missing paths, broaden permissions, add
  deployment behavior, or use unpinned artifacts.
- Database recovery, R0-7D, F4 restoration, technical-debt restoration, R0-7E
  lane implementation, R0-7F, and deployment are separate authorization tracks.

## Stop conditions

Stop the affected package when identity changes, source authority is absent,
an unapproved path is required, a missing lane becomes silently green, a policy
result implies implementation conformity, immutable pinning cannot be met,
production credentials or deployment are required, secrets or personal data
would enter evidence, or the requested change exceeds its exact authorization.

## Non-claims

The adopted planning disposition does not claim completion of R0-7D or R0-7E,
healthy repository-wide CI, a successful clean-clone build, implementation
compliance, ISO conformity, accreditation, production readiness, deployment
authorization, TD-006 closure, or the start of R0-7F.
