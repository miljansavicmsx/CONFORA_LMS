# APPEALS-COMPLAINTS-FINAL — Boundary Matrix

All four GO slices report the same boundary flags. Rollup consolidates them.

| Boundary | Required | Result | Evidence |
|----------|----------|--------|----------|
| žalba ≠ prigovor | Separate types, tabs, queues, copy | **PRESERVED** | 1, 1R, 2, 2R |
| appeal ≠ complaint | Separate APIs and UI | **PRESERVED** | 1–2R |
| contact request ≠ appeal/complaint | Support routes remain separate | **PRESERVED** | 1, 1R, 2, 2R |
| appeal resolution ≠ certification decision | Staff UX does not decide certification | **PRESERVED** | 2, 2R |
| complaint resolution ≠ certification decision | Same | **PRESERVED** | 2, 2R |
| exam result / pass ≠ certified status | No exam mutation in module | **PRESERVED** (`exam_result_changed: false`) | 1–2R |
| exam ≠ certification decision | Not conflated in UX | **PRESERVED** | 1–2R |
| certification decision ≠ certificate issuance | Not in this module | **PRESERVED** | 1–2R |
| certificate lifecycle unchanged | No issue/activate/suspend/withdraw/renew/revoke | **PRESERVED** | 1–2R |
| public verification unchanged | No portal changes | **PRESERVED** | 1–2R |
| reports / export unchanged | No reports/export changes | **PRESERVED** | 1–2R |

## Mutation flags (all false across GO summaries)

- `certification_status_changed`: false  
- `exam_result_changed`: false  
- `certificate_issued`: false  
- `certificate_lifecycle_changed`: false  
- `public_verification_changed`: false  
- `reports_export_changed`: false  

## Allowed case mutations (governance cases only)

Staff **acknowledge** / **void** update appeal or complaint case status and write audit. These do **not** change certification status, exam results, or certificate lifecycle.
