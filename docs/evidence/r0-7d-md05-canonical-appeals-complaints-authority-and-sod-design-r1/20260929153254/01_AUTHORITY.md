# Authority

DESIGN_UTC = 2026-09-29T15:32:54Z

OWNER_AUTHORIZE_R0_7D_MD05_CANONICAL_APPEALS_COMPLAINTS_AUTHORITY_AND_SOD_DESIGN_R1
= CONSUMED

The token authorizes this design record only. It does not authorize
source restoration, a Part E amendment, or implementation.

GOVERNANCE_HIERARCHY_LEVEL = 7
Evidence does not override Level 1 or Level 2. This design does not enter
the Owner Decision Register and does not change
`R0_7D_MODEL_D_UNRESOLVED_ITEM_DEFINITION_FREEZE_R1.md`.

## Constraints this design must keep

| Constraint | Source | Design effect |
| --- | --- | --- |
| MD05 primary path stays `frontend-app/src/lib/api-grievances.ts` | Level 1 freeze | Unchanged |
| ADDITIONAL_PATH_COUNT = 0 | Level 1 freeze | Unchanged by this package |
| a277a19 is not implementation authority | Prior scope review, rechecked: not an ancestor of 9623a2f | Not a body to copy |
| OQ-5 SoD is DIRECTIONAL | Architecture open questions | This design must not claim complete RBAC or SoD |
| OQ-4 remains OPEN | Baseline and gap note | Untouched |
| HD06 binding remains unapproved | HD06 decision | Untouched. MD05 is not HD06 |
| Education cluster remains deferred | Freeze | Untouched |
| ISO/IEC 17024 appeal and complaint separation | Standards policy: clause identifiers only | Design uses clause identifiers 9.8 and 9.9 as control targets. No standard text is reproduced. A mapping is not conformity. |

## Predecessor

The MD05 dependency and SoD scope review R1 returned NOT_READY with 15
blockers. This design answers the authority and SoD portion of that
stop. It does not remove the missing backend modules, the missing
appeals client files, or the freeze's zero additional-path count.
