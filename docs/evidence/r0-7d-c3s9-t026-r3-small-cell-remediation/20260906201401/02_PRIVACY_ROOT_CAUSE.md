# 02_PRIVACY_ROOT_CAUSE

## Defect locus

Helper: `formatAggregateCountLabel` in `frontend-app/src/lib/admin-reports-api.ts`

## Defective trust logic (rejected)

If `suppressed !== true`, render `String(cell.count)` verbatim.

Unsafe payload `{ suppressed:false, count:1|2|3|4 }` produced exact visible digits.

## Contributing gaps

- `T026_SMALL_CELL_THRESHOLD = 5` existed but was unused by the formatter
- Tests covered `suppressed:true`, `count:0`, `count>=5`, but not adversarial `false + 1..4`
- Evidence `08_PRIVACY_SUPPRESSION.md` claimed ONE_TO_FOUR=suppressed without adversarial proof

## Classification

| Finding                       | Status                         |
| ----------------------------- | ------------------------------ |
| FRONTEND_DEFENSE_IN_DEPTH_GAP | PROVEN                         |
| CURRENT_BACKEND_DEFECT        | NOT_PROVEN                     |
| PAGE_BYPASSES_PRIVACY_HELPER  | false (page sole-calls helper) |

Backend P08 suppression in `report-query.service.ts` was not shown defective in R3; frontend must still fail closed on untrusted JSON.
