# Architecture decision (planning)

## Preferred recommendation

`JUSTIFIED_PER_FILE_PATH_CHECKOUT_FROM_REJECTED_D2_WITH_OWNER_CEILING`

- Base implementation on integration `4090be85…` only.
- Treat rejected D2 `13cdd752…` as **inspect / path-checkout candidate source**, not merge/cherry-pick base.
- Promote **per-file** from an owner-authorized manifest (start from `closure/files-to-promote-candidate.txt`).
- Do **not** `git add frontend-app/src`.
- Do **not** invent parallel HTTP/auth/UI stacks.

## Owner must choose a ceiling strategy

### Option A — Full honest D2 closure (~40 files)

Promote the full candidate list including RBAC/access fan-out.

- Pros: typecheck graph matches existing production coupling.
- Cons: large scope; many non-complaint modules; resembles prior over-promotion risk.

### Option B — Complaint core + HTTP stack; separate pilot decoupling decision (~20–25 files)

Promote:

- complaint domain (4);
- UI primitives (4);
- HTTP/auth stack (9) + `auth-storage` / `endpoint-registry` as required;
- `utils` (+ `badge` if page listing kept);

and **separately** authorize either:

- promoting the minimal nest-auth-pilot dependency set already implied by tracked `nest-auth-pilot.ts`, **or**
- a governed pilot import slim that does **not** alter staff sidebar semantics (unlike rejected S2 learner substitution).

### Option C — Rewire `FormalComplaintDialog` to `submitLearnerComplaint`

Avoid promoting `api-grievances` if the facade’s appeal surface is undesirable.

Still requires HTTP stack + UI + complaint types/utils/flag.

## Explicitly rejected approaches

| Approach | Why rejected |
|----------|----------------|
| Create new HTTP client / API provider | Duplicate infrastructure |
| Swap to `packages/ui` Button for the dialog | Different API; not the existing shadcn import graph |
| Merge / cherry-pick rejected branches | `REJECTED_EXPERIMENTAL_NOT_PR_ELIGIBLE` |
| Implement appeal filing / `decisionRef` | Out of scope; TD-006 |
| Broad directory promotion | Governance failure mode from R0-7D2R |

## Stopped branch disposition

Keep `feature/028d-2ar-candidate-complaint-filing` classified:

`STOPPED_PRE_FLIGHT_NO_IMPLEMENTATION_NOT_PR_ELIGIBLE`

Do not open a PR from it. Restart implementation only after owner authorizes a promote ceiling + source tip.
