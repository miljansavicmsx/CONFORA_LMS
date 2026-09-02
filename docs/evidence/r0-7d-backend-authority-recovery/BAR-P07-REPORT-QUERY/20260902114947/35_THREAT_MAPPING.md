# Threat Register (12)

T01 cross-tenant aggregation leak | controls=SEC_01..03,30 | PASS
T02 user enumeration | controls=SEC_09,10,23 | PASS
T03 small-cell disclosure | controls=SEC_11,12,28 | PASS
T04 unauthorized staff access | controls=SEC_04,27 | PASS
T05 learner tenant-wide access | controls=SEC_05 | PASS
T06 arbitrary groupBy abuse | controls=SEC_06,29 | PASS
T07 unbounded date-range DoS | controls=SEC_08,24 | PASS
T08 raw SQL | controls=SEC_13,21 | PASS
T09 export exfiltration | controls=SEC_15 | PASS
T10 audit-log disclosure | controls=SEC_16,17 | PASS
T11 response overexposure | controls=SEC_10,23 | PASS
T12 repeated-query inference | controls=SEC_36 DOCUMENTED_RESIDUAL_WITHIN_OD1 | PASS

THREAT_COUNT=12
THREAT_WITHOUT_CONTROL_COUNT=0
NEW_UNACKNOWLEDGED_HIGH_RISK_THREAT_COUNT=0
