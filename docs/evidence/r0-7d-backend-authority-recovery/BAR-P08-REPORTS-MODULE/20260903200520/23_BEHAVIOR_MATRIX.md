# Behavior Matrix (72/72)

OD3 corrections applied to P08_TEST_067 and P08_TEST_072.

| ID           | Control                                                                          | Result | Proof                       |
| ------------ | -------------------------------------------------------------------------------- | ------ | --------------------------- |
| P08_TEST_001 | ReportsModule imports ReportQueryModule                                          | PASS   | CMD10 boundary              |
| P08_TEST_002 | ReportsModule registers exactly 1 controller                                     | PASS   | CMD10                       |
| P08_TEST_003 | AppModule imports ReportsModule                                                  | PASS   | CMD10                       |
| P08_TEST_004 | ReportQueryModule remains controller-free                                        | PASS   | CMD10                       |
| P08_TEST_005 | Exact route count=5                                                              | PASS   | CMD11                       |
| P08_TEST_006 | Exact routes include prior 3 + 2 report GETs                                     | PASS   | CMD11                       |
| P08_TEST_007 | Methods are GET only on report routes                                            | PASS   | CMD10/11                    |
| P08_TEST_008 | No POST/PUT/PATCH/DELETE report routes                                           | PASS   | CMD10                       |
| P08_TEST_009 | Unauthenticated -> 401                                                           | PASS   | CMD11                       |
| P08_TEST_010 | STAFF_DIR allowed                                                                | PASS   | CMD10/11                    |
| P08_TEST_011 | STAFF_SYSADM allowed                                                             | PASS   | CMD10/11                    |
| P08_TEST_012 | STAFF_AUD allowed                                                                | PASS   | CMD10/11                    |
| P08_TEST_013 | QUALITY_MANAGER allowed                                                          | PASS   | CMD10/11                    |
| P08_TEST_014 | USR_CAND denied 403                                                              | PASS   | CMD10/11                    |
| P08_TEST_015 | USR_CERT denied 403                                                              | PASS   | CMD10/11                    |
| P08_TEST_016 | COM_CERT denied 403                                                              | PASS   | CMD10/11                    |
| P08_TEST_017 | ISSUANCE_OFFICER denied 403                                                      | PASS   | CMD10/11                    |
| P08_TEST_018 | LIFECYCLE_OFFICER denied 403                                                     | PASS   | CMD10/11                    |
| P08_TEST_019 | Role check before service invocation                                             | PASS   | CMD10                       |
| P08_TEST_020 | No client tenant selector accepted                                               | PASS   | CMD11                       |
| P08_TEST_021 | Cross-tenant actor/context mismatch -> 403                                       | PASS   | CMD11                       |
| P08_TEST_022 | by-status calls aggregateByStatus only                                           | PASS   | CMD10                       |
| P08_TEST_023 | by-scheme-ref calls aggregateBySchemeRef only                                    | PASS   | CMD10                       |
| P08_TEST_024 | status filter passthrough                                                        | PASS   | CMD10                       |
| P08_TEST_025 | schemeRef filter passthrough                                                     | PASS   | CMD10                       |
| P08_TEST_026 | createdFrom/createdTo passthrough                                                | PASS   | CMD10                       |
| P08_TEST_027 | submittedFrom/submittedTo passthrough                                            | PASS   | CMD10                       |
| P08_TEST_028 | At least one complete date range required                                        | PASS   | CMD11                       |
| P08_TEST_029 | Incomplete date pair -> 400                                                      | PASS   | CMD11                       |
| P08_TEST_030 | Inverted range -> 400                                                            | PASS   | CMD11                       |
| P08_TEST_031 | >365d+1ms -> 400                                                                 | PASS   | CMD11                       |
| P08_TEST_032 | Exact 365d allowed                                                               | PASS   | CMD11                       |
| P08_TEST_033 | Malformed date -> 400                                                            | PASS   | CMD10/11                    |
| P08_TEST_034 | Unknown status -> 400                                                            | PASS   | CMD11                       |
| P08_TEST_035 | Empty schemeRef -> 400                                                           | PASS   | CMD11                       |
| P08_TEST_036 | schemeRef >128 -> 400                                                            | PASS   | CMD11                       |
| P08_TEST_037 | Unknown query key -> 400                                                         | PASS   | CMD11                       |
| P08_TEST_038 | Repeated/multi-value query rejected                                              | PASS   | CMD11                       |
| P08_TEST_039 | Suppression shape preserved                                                      | PASS   | CMD11                       |
| P08_TEST_040 | Counts 1..4 suppressed without count                                             | PASS   | CMD11                       |
| P08_TEST_041 | Zero remains exact 0                                                             | PASS   | CMD11                       |
| P08_TEST_042 | Count >=5 exact                                                                  | PASS   | CMD11                       |
| P08_TEST_043 | total omitted when any suppressed                                                | PASS   | CMD11                       |
| P08_TEST_044 | total present when none suppressed                                               | PASS   | CMD11                       |
| P08_TEST_045 | No tenantId/userId/applicationId fields                                          | PASS   | CMD11                       |
| P08_TEST_046 | No row-level records                                                             | PASS   | CMD11                       |
| P08_TEST_047 | Status group order deterministic                                                 | PASS   | CMD11                       |
| P08_TEST_048 | SchemeRef group order deterministic                                              | PASS   | CMD11                       |
| P08_TEST_049 | INVALID\_\* mapped 400 with P07 codes                                            | PASS   | CMD10/11                    |
| P08_TEST_050 | AccessDenied remains 403                                                         | PASS   | CMD11                       |
| P08_TEST_051 | TenantAccessDenied remains 403                                                   | PASS   | CMD11                       |
| P08_TEST_052 | MFA failure remains 403 MFA_REQUIRED                                             | PASS   | CMD11                       |
| P08_TEST_053 | Controller does not import TenantPrismaService                                   | PASS   | CMD10                       |
| P08_TEST_054 | Controller does not import PrismaService                                         | PASS   | CMD10                       |
| P08_TEST_055 | No raw SQL/queryRaw in reports                                                   | PASS   | CMD10                       |
| P08_TEST_056 | No write methods; Cache-Control private,no-store                                 | PASS   | CMD10/11                    |
| P08_TEST_057 | No export endpoints                                                              | PASS   | CMD10                       |
| P08_TEST_058 | No audit-event query endpoints                                                   | PASS   | CMD10                       |
| P08_TEST_059 | No dimension selector query param                                                | PASS   | CMD10/11                    |
| P08_TEST_060 | No percentages/derived metrics                                                   | PASS   | CMD11                       |
| P08_TEST_061 | Throttling 20/60000; denied roles do not consume; independent routes             | PASS   | CMD11                       |
| P08_TEST_062 | Schema delta 0                                                                   | PASS   | CMD23/24                    |
| P08_TEST_063 | Migration delta 0                                                                | PASS   | CMD23/24                    |
| P08_TEST_064 | Manifest/lock delta 0                                                            | PASS   | source envelope             |
| P08_TEST_065 | Frontend delta 0                                                                 | PASS   | source envelope             |
| P08_TEST_066 | P03 regression PASS                                                              | PASS   | CMD13                       |
| P08_TEST_067 | AUTH_30 PASS after path15; exact five-route inventory; unexpected sixth rejected | PASS   | CMD13                       |
| P08_TEST_068 | P04 regression PASS (accepted baseline 47)                                       | PASS   | CMD14-16                    |
| P08_TEST_069 | P05 regression PASS                                                              | PASS   | CMD17-18                    |
| P08_TEST_070 | P06 regression PASS (76)                                                         | PASS   | CMD19-20 + CMD23 P06 subset |
| P08_TEST_071 | P07 service/unit/e2e PASS (96/36/32)                                             | PASS   | CMD21-24                    |
| P08_TEST_072 | P07_TEST_009/088/094 forward-compat only; zero weakening                         | PASS   | CMD21-22                    |

P08_BEHAVIOR_PASS_COUNT=72
P08_BEHAVIOR_FAIL_COUNT=0
