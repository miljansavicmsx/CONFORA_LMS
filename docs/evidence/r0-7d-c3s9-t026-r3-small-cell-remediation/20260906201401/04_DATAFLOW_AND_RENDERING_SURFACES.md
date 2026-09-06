# 04_DATAFLOW_AND_RENDERING_SURFACES

## Dataflow

HTTP JSON → `reports-client` (passthrough) → `loadAdminCertificationApplicationsReport` → react-query → `formatAggregateCountLabel` → `AdminReportsPage` AggregateTable `<td>` text → accessibility tree.

## Surfaces

| Gate                                    | Result                                              |
| --------------------------------------- | --------------------------------------------------- |
| PAGE_BYPASSES_PRIVACY_HELPER            | false                                               |
| CLIENT_VISIBLE_SMALL_CELL_SURFACE_COUNT | 1 (`data-testid=admin-reports-count-*` td text)     |
| VISIBLE_DOM_SMALL_CELL_LEAK_COUNT       | 0                                                   |
| ACCESSIBILITY_SMALL_CELL_LEAK_COUNT     | 0 (ARIA inherits cell text; no aria-label override) |
| HIDDEN_DOM_SMALL_CELL_LEAK_COUNT        | 0 (no data-count/data-value/title)                  |
| CHART_TOOLTIP_SMALL_CELL_LEAK_COUNT     | 0 (no chart surface on T026 page)                   |
| Total rematerialization                 | forbidden; `admin-reports-total-omitted` preserved  |

Page renders counts only via `formatAggregateCountLabel`.
