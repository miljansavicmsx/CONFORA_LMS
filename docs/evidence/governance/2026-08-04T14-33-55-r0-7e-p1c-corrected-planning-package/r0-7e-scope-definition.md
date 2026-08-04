# R0-7E Scope Definition

## Included planning boundary

- Recover lint for explicitly declared tracked packages.
- Recover typecheck for explicitly declared tracked packages.
- Recover unit tests for explicitly declared tracked packages.
- Validate architecture and governance declarations against tracked authority.
- Establish honest canonical, transitional, legacy, missing-authority,
  governance-policy, and implementation-compliance lanes.
- Keep unavailable authority visible and fail closed.
- Separate policy validation from implementation-conformity evidence.
- Prepare verified checks for later, separately authorized R0-7F enforcement.

## Explicit exclusions

R0-7E is not product-feature development, database synthesis, backend
reconstruction, frontend-auth restoration, appeal implementation, R0-7D
closure, deployment enablement, production-readiness certification, an ISO
conformity claim, TD-006 closure, or R0-7F implementation.

## Entry and exit boundary

Planning may continue while R0-7D is open. R0-7E implementation may not start
until R0-7D closes through separately reviewed forward-only work and applicable
owner decisions are adopted. Each executable lane must use complete tracked
inputs on a clean clone. Missing authority remains blocked, never green.

R0_7E_IMPLEMENTATION = NOT_STARTED
IMPLEMENTATION_AUTHORIZATION = false
