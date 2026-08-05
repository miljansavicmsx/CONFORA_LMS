# CONFORA R0-7E Implementation and Work-Package Boundary

**Document ID:** CON-GOV-R07E-WORK-001
Status: PROPOSED NORMATIVE REPOSITORY PROMOTION — EFFECTIVE ONLY AFTER REVIEWED MERGE
**Owner:** Repository Owner + Architecture Lead
**Authority level:** Governance Hierarchy Level 3

## Effectiveness

This proposed policy becomes effective only after independent review and a
separately authorized true merge. It does not authorize any work package.

The NP2 author self-review NO-GO is not independent review. A genuinely separate
reviewer execution identity must review the corrected NP1D head.

## Separate authorization gates

No work package is implicitly authorized by planning, owner decisions, policy
adoption, evidence, independent review, predecessor completion, CI state, or
merge readiness. Every future package requires a separate owner authorization
naming:

- exact base, branch, and path allowlist;
- prohibited paths and scope-expansion stop conditions;
- explicit entry criteria and predecessor state;
- commands, tests, and clean-tree requirements;
- commit, push, and evidence boundaries;
- required reviewers and segregation-of-duties controls;
- merge-readiness, merge, repository-setting, and deployment states;
- rollback method and residual limitations.

Planning, owner decisions, normative promotion, implementation, evidence,
independent review, merge readiness, merge authorization, merge execution,
post-merge verification, and deployment authorization remain separate gates.

## Required predecessor and package boundaries

1. Normative promotion is followed by genuinely independent review. The
   proposed documents require reviewed merge before they become effective.
2. R0-7D remains open and blocks all R0-7E implementation. Its closure must be
   forward-only, separately authorized, independently reviewed, and merged.
3. OD-R07E-3 remains deferred. Database-dependent implementation remains blocked
   until approved `packages/database/**` source authority and a separate owner
   recovery decision exist, or remains an explicit blocked state.
4. `R0-7E-Q1` is a separate tracked-quality correction package.
5. `R0-7E-Q2` is a separate six-lane orchestration package.
6. `R0-7E-C1` is a separate policy-versus-implementation validation package.
7. F4 validation restoration is a separate focused prerequisite and cannot be
   silently included in a quality or compliance package.
8. `docs/governance/TECH_DEBT.md` restoration is a separate governance task;
   it cannot be synthesized and TD-006 remains open.
9. Closure evidence follows operational work and cannot correct operational
   defects.
10. Independent review must inspect exact published history before any owner
   merge-readiness decision.
11. Owner merge readiness is separate from explicit merge authorization. Merge
   requires a separate exact authorization. Deployment remains a later,
   separately governed decision.
12. R0-7F may begin only after R0-7E exit and a separate plan, review, and owner
   authorization.

## Stop conditions

Stop when an identity changes, approved source authority is absent, an
unauthorized path is required, blocked becomes pass, policy validation implies
implementation conformity, immutable artifact verification cannot be met,
production credentials or deployment are required, or evidence would contain
secrets, personal data, or unrelated content.

`R0_7E_IMPLEMENTATION = NOT_STARTED`

`IMPLEMENTATION_AUTHORIZATION = false`

`MERGE_AUTHORIZATION = false`

`DEPLOYMENT_AUTHORIZATION = false`

`NP2_AUTHOR_SELF_REVIEW = NO_GO`

`INDEPENDENT_REVIEW_REQUIRED = true`
