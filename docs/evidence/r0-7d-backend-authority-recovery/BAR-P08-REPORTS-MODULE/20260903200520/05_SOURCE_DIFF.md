# Source Diff

COMMAND=git show --stat a899e4d55d2fc6764c9a80acd254e0178d1fd1e7
RESULT=

```
a899e4d feat(reports): expose BAR-P08 HTTP authority over P07 aggregates
 15 files changed, 1591 insertions(+), 6 deletions(-)
```

PARENT=099ed2e118c038fe7cea540610083ebddbf4acb5
MESSAGE=feat(reports): expose BAR-P08 HTTP authority over P07 aggregates

Production delta summary:

- New ReportsModule / ReportsController / ReportsRolesGuard / ReportAggregateQueryDto / ReportQueryContractFilter
- AppModule imports ReportsModule
- P07 boundary + e2e inventory adapted for +2 routes without semantic weakening
- AUTH_30 exact inventory adapted to 5 routes (OD3 path 15)
