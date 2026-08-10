# CONFORA R0-7E Implementation and Work-Package Boundary

**Document ID:** CON-GOV-R07E-WORK-001
Status: PROPOSED NORMATIVE REPOSITORY PROMOTION — EFFECTIVE ONLY AFTER REVIEWED MERGE
**Owner:** Repository Owner + Architecture Lead
**Authority level:** Governance Hierarchy Level 3

## Effectiveness

This proposed policy becomes effective only after independent review and a
separately authorized true merge. It does not authorize any work package.

The NP2 author self-review NO-GO was not independent review. The later
`R0_7E_NP2_R4_INDEPENDENT_REVIEW = NO_GO` established reviewer independence and
identified four blocking normative finding groups. The exact published NP1G
head requires a genuinely independent re-review.

## Separate authorization gates

No work package is implicitly authorized by planning, owner decisions, policy
adoption, evidence, independent review, predecessor completion, CI state, or
merge readiness. Every future package requires a separate owner authorization
naming:

- the applicable owner-decision gate;
- exact base, branch, entry criteria, predecessor state, and path allowlist;
- prohibited paths and scope-expansion stop conditions;
- commands, tests, and clean-tree requirements;
- commit, push, and evidence boundaries;
- rollback method and residual limitations;
- a genuinely independent reviewer and segregation-of-duties controls;
- merge-readiness verification;
- separate explicit merge authorization;
- deployment authorization state and repository-setting authorization state.

Planning, owner decisions, normative promotion, implementation, evidence,
independent review, merge readiness, merge authorization, merge execution,
post-merge verification, and deployment authorization remain separate gates.

`NO_IMPLEMENTATION_PACKAGE_IS_AUTHORIZED_BY_THIS_POLICY_ALONE`

## Required predecessor and package boundaries

1. The normative promotion package is prepared without implementation effect.
2. A genuinely independent read-only review inspects its exact published head.
3. A separately authorized reviewed true merge integrates the normative
   governance before it becomes effective.
4. Separately authorized `R0-7D-CLOSURE` is completed, independently reviewed,
   and merged; R0-7D remains open and blocks all R0-7E implementation until then.
5. OD-R07E-3 receives an approved database disposition, or every
   database-dependent result remains explicitly
   `BLOCKED_MISSING_TRACKED_AUTHORITY`.
6. `R0-7E-Q1` is a separately authorized tracked-quality correction package.
7. `R0-7E-Q2` is a separately authorized six-lane orchestration package.
8. `R0-7E-C1` is a separately authorized policy-versus-implementation
   validation package.
9. F4 validation restoration is a separately authorized focused prerequisite
   and cannot be silently included in a quality or compliance package.
10. `R0-7E-E1` is a separate closure-evidence package that follows operational
    work and cannot correct operational defects.
11. `R0-7E-R1` is a genuinely independent read-only review of exact published
    implementation and evidence history.
12. The owner performs a separate merge-readiness gate after R0-7E-R1.
13. Merge requires separate explicit owner authorization; deployment remains a
    later, separately governed authorization state.
14. R0-7F may begin only after R0-7E exit and a separate plan, review, and owner
    authorization.

Restoration of `docs/governance/TECH_DEBT.md` remains a separate governance
task. It cannot be synthesized inside these packages, and TD-006 remains open.

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

`R0_7E_NP2_R4_INDEPENDENT_REVIEW = NO_GO`

`INDEPENDENT_REREVIEW_REQUIRED = true`
