# Owner Decisions Required

All eight decisions are UNRESOLVED_NOT_ADOPTED. Recommendations are reviewable
proposals and have no normative effect until an explicit owner response is
recorded under the governance hierarchy.

## OD-R07E-1 - Adopt the bounded R0-7E definition

- Exact question: Should the owner adopt, revise, defer, or reject the bounded R0-7E CI-quality and honest-compliance implementation boundary?
- Available options: ADOPT_AS_LIMITED; REVISE_WITH_EXACT_SCOPE; DEFER; REJECT.
- Recommendation: ADOPT_AS_LIMITED after independent P1C review passes.
- Recommendation limitations: adoption applies only to bounded R0-7E CI-quality and honest-compliance scope; it does not adopt implementation details; it does not authorize workflows or source changes; it does not close R0-7D; it does not resolve database authority; it does not claim implementation compliance; it does not start R0-7F; every package remains subject to package-specific authorization.
- Technical effect: establishes the allowed problem boundary but approves no command, path, or implementation.
- Governance effect: promotes only the owner-approved boundary to Level 1; P1C remains Level 7 evidence.
- Planning impact: planning may be refined without implementation.
- Implementation impact: blocks every R0-7E implementation package until adopted.
- Blocking status: IMPLEMENTATION_BLOCKING.
- Required owner response: select one option and record the exact adopted scope and limitations.
- Current state: UNRESOLVED_NOT_ADOPTED.

## OD-R07E-2 - Approve the six-lane model

- Exact question: Should the owner approve, revise, defer, or reject the six explicitly defined CI lanes and their exclusion semantics?
- Available options: APPROVE_ALL_SIX; REVISE_IDENTIFIED_LANES; DEFER; REJECT.
- Recommendation: APPROVE_ALL_SIX after independent validation of every field.
- Recommendation limitations: approval defines reporting boundaries only and authorizes no workflow edit or passing status.
- Technical effect: establishes lane identifiers, input boundaries, and blocked-state behavior.
- Governance effect: prevents hidden exclusions and false repository-green claims.
- Planning impact: lane-dependent packages can be scoped after approval.
- Implementation impact: R0-7E-Q2 and R0-7E-C1 remain blocked until approval.
- Blocking status: IMPLEMENTATION_BLOCKING_FOR_Q2_AND_C1.
- Required owner response: approve all six or list exact field-level revisions.
- Current state: UNRESOLVED_NOT_ADOPTED.

## OD-R07E-3 - Decide database disposition

- Exact question: Should database authority be recovered separately or remain an explicit blocked implementation-compliance lane?
- Available options: SEPARATE_TRACKED_DATABASE_RECOVERY; EXPLICIT_BLOCKED_LANE; DEFER_WITH_BLOCK.
- Recommendation: select recovery only when approved source authority exists; otherwise select explicit blocked status.
- Recommendation limitations: no local-only promotion, synthesis, silent exclusion, or database implementation claim.
- Technical effect: determines whether database-dependent controls can become executable.
- Governance effect: preserves tenant/audit authority and honest compliance reporting.
- Planning impact: planning can continue with both options documented.
- Implementation impact: database-dependent work remains blocked until decision and any recovery complete.
- Blocking status: DATABASE_DEPENDENT_IMPLEMENTATION_BLOCKING.
- Required owner response: select one option and identify authority, owner, and exit criteria.
- Current state: UNRESOLVED_NOT_ADOPTED.

## OD-R07E-4 - Approve forward-only R0-7D closure

- Exact question: Should a fresh forward-only R0-7D closure be authorized from an approved integration tip, revised, deferred, or rejected?
- Available options: AUTHORIZE_BOUNDED_CLOSURE; REVISE_SCOPE; DEFER; REJECT.
- Recommendation: AUTHORIZE_BOUNDED_CLOSURE with exact paths in a separate task.
- Recommendation limitations: no wholesale promotion of rejected branches and no implicit R0-7E implementation.
- Technical effect: can establish frontend lock, build, preview, and accessibility authority.
- Governance effect: supplies independently reviewed prerequisite evidence without rewriting history.
- Planning impact: P1C review and owner decisions may continue.
- Implementation impact: all R0-7E implementation remains blocked until closure merges.
- Blocking status: ALL_R0_7E_IMPLEMENTATION_BLOCKING.
- Required owner response: approve exact base, paths, tests, and authorization boundary or defer.
- Current state: UNRESOLVED_NOT_ADOPTED.

## OD-R07E-5 - Approve compliance lane names and claims

- Exact question: Should the owner adopt, revise, defer, or reject governance-policy-validation and implementation-compliance-validation names and state semantics?
- Available options: ADOPT_PROPOSED_NAMES; REVISE_NAMES_OR_STATES; DEFER; REJECT.
- Recommendation: ADOPT_PROPOSED_NAMES and four explicit implementation states.
- Recommendation limitations: no ISO/accreditation claim and no policy-to-implementation status promotion.
- Technical effect: establishes validator outputs and negative claim tests.
- Governance effect: prevents auditors and users from reading document checks as product conformity.
- Planning impact: C1 can be precisely scoped after adoption.
- Implementation impact: C1 remains blocked until adopted.
- Blocking status: C1_IMPLEMENTATION_BLOCKING.
- Required owner response: approve exact names/states or supply exact replacements.
- Current state: UNRESOLVED_NOT_ADOPTED.

## OD-R07E-6 - Keep F4 as a separate prerequisite

- Exact question: Should F4 validator restoration remain separate, be revised, be deferred, or be rejected?
- Available options: SEPARATE_PREREQUISITE; REVISE_BOUNDARY; DEFER_WITH_BLOCK; REJECT_RESTORATION.
- Recommendation: SEPARATE_PREREQUISITE.
- Recommendation limitations: no F4 source is authorized until a later exact path allowlist and authority source are approved.
- Technical effect: prevents F4 repair from expanding Q1/Q2/C1.
- Governance effect: preserves focused review and traceable authorization.
- Planning impact: prerequisite specifications may be refined.
- Implementation impact: F4 remains unavailable until separately authorized and merged.
- Blocking status: F4_LANE_IMPLEMENTATION_BLOCKING.
- Required owner response: select an option and, if authorized, define base, paths, tests, and evidence.
- Current state: UNRESOLVED_NOT_ADOPTED.

## OD-R07E-7 - Restore TECH_DEBT.md separately

- Exact question: Should the canonical TECH_DEBT.md authority be restored separately, remain explicitly blocked, be revised, or be rejected?
- Available options: AUTHORIZE_SEPARATE_RESTORATION; EXPLICIT_BLOCKED_REFERENCE; REVISE; REJECT.
- Recommendation: AUTHORIZE_SEPARATE_RESTORATION only after approved source reconciliation.
- Recommendation limitations: no inferred local source, no TD-006 closure, and no validator dependency before merge.
- Technical effect: can provide a deterministic validator input and canonical debt path.
- Governance effect: reconciles the Level 2 reference without fabricating debt history.
- Planning impact: gap remains visible while restoration is designed.
- Implementation impact: validators requiring the file remain blocked until restoration merges.
- Blocking status: TECH_DEBT_DEPENDENT_VALIDATOR_BLOCKING.
- Required owner response: select restoration or explicit block and name authority/owner.
- Current state: UNRESOLVED_NOT_ADOPTED.

## OD-R07E-8 - Adopt immutable pinning requirements

- Exact question: Should immutable SHA/digest/checksum and lockfile requirements be mandatory, revised, advisory, or rejected for future workflow changes?
- Available options: MANDATORY_WITH_EXCEPTION_PROCESS; REVISE_CONTROLS; ADVISORY; REJECT.
- Recommendation: MANDATORY_WITH_EXCEPTION_PROCESS.
- Recommendation limitations: applies when an artifact class is touched; exceptions are time-bounded, owner-approved, evidenced, and independently reviewed.
- Technical effect: constrains actions, images, downloads, dependencies, and lock generation.
- Governance effect: creates auditable supply-chain change control and rollback expectations.
- Planning impact: future package tests and evidence can be specified.
- Implementation impact: workflow/artifact changes remain blocked until requirements and any exception process are adopted.
- Blocking status: WORKFLOW_AND_ARTIFACT_CHANGE_BLOCKING.
- Required owner response: approve the six classes and exception policy or list revisions.
- Current state: UNRESOLVED_NOT_ADOPTED.

owner_decision_count = 8
underdefined_owner_decision_count = 0
adopted_owner_decision_count = 0
