# 10_THREAT_CONTROLS

Threat count = 20. Uncontrolled high-risk count = 0.

| ID       | Threat                                         | Control                                                                                    |
| -------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| FEVB-T01 | Historical CSP restored blindly                | Blob hash match to `a277a19…`; API check vs `vite.config.ts`; CSP review evidence          |
| FEVB-T02 | unsafe-inline introduced                       | Restored module does not add unsafe-inline; residual style-src is shared builder only      |
| FEVB-T03 | unsafe-eval introduced                         | Forced `isProd:true`; module source has no unsafe-eval; bootstrap CSP test asserts absence |
| FEVB-T04 | Report-only mistaken for enforce               | Default report-only preserved and documented; tests assert no default enforce claim        |
| FEVB-T05 | Production/preview confusion                   | `configurePreviewServer` only; documented preview tooling class                            |
| FEVB-T06 | Nonce defect                                   | Per-request `crypto.randomUUID()`; no static nonce; `x-nonce` header                       |
| FEVB-T07 | connect-src widened                            | Shared builder unmodified; known residual `https:` documented, not newly introduced        |
| FEVB-T08 | Preview CSP affects production browser runtime | Preview middleware only; not app runtime path                                              |
| FEVB-T09 | Axios permits external traffic                 | Fail-closed adapter; rejects non-API origins; setup test proves                            |
| FEVB-T10 | Fetch guard fails open                         | API-origin 404 fail-closed; setup test proves                                              |
| FEVB-T11 | Global test state leaks                        | ResizeObserver install-if-undefined; deterministic stub                                    |
| FEVB-T12 | ResizeObserver incompatible                    | Historical exact stub used by prior a11y baseline                                          |
| FEVB-T13 | Absorbs unrelated frontend debt                | Exact six paths; unrelated remediation count 0                                             |
| FEVB-T14 | Falsely claims lint green                      | VB-V07 class EXPECTED_BASELINE_DIAGNOSTIC; lint remains FAIL                               |
| FEVB-T15 | Falsely completes T026                         | T026 product path count 0; T026 remains STOPPED                                            |
| FEVB-T16 | Falsely resumes C3-S9                          | Resume authorization NOT_GRANTED; preserved in evidence                                    |
| FEVB-T17 | Model D overstated                             | Prospective Δ1 only; formal update NOT_PERFORMED                                           |
| FEVB-T18 | Unrelated missing helper imported              | No `lms-api-test-mock` / `api-base-url` imports                                            |
| FEVB-T19 | New dependency added                           | Dependency delta 0                                                                         |
| FEVB-T20 | Package/lockfile drift                         | Manifest/lock/.npmrc delta 0                                                               |

Known CSP majors are documented residuals, not uncontrolled high-risk findings introduced by this R1.
