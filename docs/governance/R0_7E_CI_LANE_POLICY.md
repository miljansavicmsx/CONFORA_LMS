# CONFORA R0-7E CI Lane Policy

**Document ID:** CON-GOV-R07E-CI-001
**Status:** PROPOSED NORMATIVE REPOSITORY PROMOTION — EFFECTIVE ONLY AFTER REVIEWED MERGE
**Owner:** CONFORA Architecture & Governance
**Authority level:** Governance Hierarchy Level 3
**Owner decisions:** OD-R07E-1, OD-R07E-2, OD-R07E-4, OD-R07E-6, OD-R07E-7, OD-R07E-8

## Purpose and authority

This policy defines honest CI reporting boundaries for R0-7E. It is subordinate
to approved owner decisions and the Canonical Development Baseline. It does not
authorize workflow, source, manifest, lockfile, repository-setting, or
deployment changes.

Until this document is integrated by a separately reviewed and authorized
merge into the authoritative integration branch, it has no normative effect.

## Mandatory lanes

| Lane | Identifier | Authority boundary | Current policy state |
|------|------------|--------------------|----------------------|
| 1 | `canonical-tracked-workspace` | Root workspace authority and only tracked packages with complete executable inputs | `PARTIAL_BASELINE_FAILURE` |
| 2 | `transitional-frontend-app` | Tracked `frontend-app/**` plus explicitly approved tracked dependencies | `BLOCKED_R0_7D_OPEN` |
| 3 | `legacy-tracked` | Only legacy paths that are tracked and separately approved | `UNAVAILABLE_NO_TRACKED_LEGACY_SOURCE` |
| 4 | `missing-authority` | Required but absent or incomplete tracked authority | `BLOCKED_MISSING_TRACKED_AUTHORITY` |
| 5 | `governance-policy-validation` | Approved tracked governance and architecture policy only | `PLANNED_NOT_IMPLEMENTED` |
| 6 | `implementation-compliance-validation` | Complete tracked implementation, dependencies, tests, and approved control mapping | `BLOCKED_MISSING_TRACKED_AUTHORITY` |

The current states above are governance classifications, not newly executed CI
results. Implemented lane status must always identify the tested commit,
inputs, command, exclusions, and evidence.

`frontend-app` remains transitional and is not declared production-ready. The
missing-authority lane includes absent or incomplete database, accessibility,
F4, backend, frontend-authentication, and technical-debt authority when those
inputs are required by an approved lane.

## Result semantics

1. Missing required tracked authority must remain visible as
   `BLOCKED_MISSING_TRACKED_AUTHORITY`; it must not be silently excluded or
   represented as pass.
2. `BLOCKED`, `UNAVAILABLE`, and `NOT_APPLICABLE_WITH_APPROVED_SCOPE` are not
   equivalent to `PASS`.
3. A lane must fail when its declared executable command fails.
4. An N/A result requires a recorded owner-approved scope and must remain
   qualified as N/A.
5. A policy-validation pass cannot alter an implementation-compliance result.
6. Local untracked files are never CI authority.
7. Every executable lane requires deterministic clean-tree evidence at an exact
   commit and an explicit list of included and excluded paths.

## Dependency and separation controls

- R0-7D closure remains a prerequisite for frontend install, build, preview,
  and accessibility-dependent R0-7E work.
- Database-dependent lanes remain blocked because OD-R07E-3 is deferred.
- F4 validator restoration remains a separate prerequisite package.
- Canonical technical-debt authority restoration remains a separate package;
  `docs/governance/TECH_DEBT.md` must not be synthesized, and TD-006 remains
  open unless separately resolved.
- Legacy-path reporting must not reconstruct, promote, or rely on local-only
  `backend/**` content.
- No lane may conceal an unavailable target through filtering, conditional
  success, or a skipped-success result.

## Required evidence

Each future lane implementation must record the exact base and head, clean-tree
proof, tracked input manifest, immutable tool identities, commands, exit codes,
logs, negative tests, exclusions, residual limitations, and independent review.

## Non-claims

This policy does not claim healthy repository-wide CI, a successful clean-clone
build, implementation compliance, ISO conformity, accreditation, production
readiness, deployment authorization, or completion of R0-7D or R0-7E.
