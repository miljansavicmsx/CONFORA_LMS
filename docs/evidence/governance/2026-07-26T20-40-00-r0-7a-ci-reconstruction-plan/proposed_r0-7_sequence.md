# Proposed R0-7 sequence

## R0-7B — Deterministic package installation

Scope: pnpm 9.14.2 alignment; tracked manifest inventory; lockfile reconstruction
from clean tracked tree; prove frozen install; no app features.

Exit: clean-clone `pnpm install --frozen-lockfile` succeeds.

## R0-7C — Database service recovery

Scope: quote/fix pgvector service; healthcheck; pin image digest; Prisma
connectivity **only if** database package tracking decision allows — otherwise
split “service smoke” from “migrate deploy”.

Exit: service healthy; explicit owner decision on tracking `packages/database`.

## R0-7D — Accessibility check recovery

Scope: track a11y scripts; target frontend-app; deterministic browsers; remove
FastAPI/untracked Next requirements from default path; reduce permissions.

Exit: accessibility job meaningful on clean clone without legacy backend.

## R0-7E — Quality and compliance recovery

Scope: lint/typecheck/unit for tracked packages; architecture/governance
validations; compliance doc/policy checks separated from ISO implementation
gates; lane split canonical/transitional/legacy.

Exit: quality job green for declared lanes; compliance does not overclaim.

## R0-7F — Enforcement

Only after intended checks pass on clean clone: required status checks, branch
protection, independent review requirement, admin-bypass decision, concurrency.

**Do not** enforce currently broken checks.
