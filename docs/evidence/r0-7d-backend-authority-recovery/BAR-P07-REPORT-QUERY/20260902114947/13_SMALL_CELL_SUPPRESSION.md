# Small-Cell Suppression

P07_SMALL_CELL_THRESHOLD=5
count==0 (status): suppressed=false count=0
count 1..4: suppressed=true; count property ABSENT
count>=5: suppressed=false count=exact
Proven in report-query.service.spec.ts P07_TEST_063..070
