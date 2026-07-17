# Encoding / labels

| Check | Result |
|-------|--------|
| Source mojibake scan (labels + page + dialogs) | **PASS** |
| encoding_issues_found | **false** |
| encoding_issues_fixed | **true** (subject-label hygiene restored) |
| Browser UI diacritics (žalba / Žalbe / prigovor) | **PASS** (Playwright assertNoMojibake) |
| Raw enums in learner-visible card titles | **fixed** |

## Issue found during 1R browser run

Learner complaint cards briefly showed raw `PROCESS_COMPLAINT` as the **card title** (`subject`), while category badges correctly showed "Prigovor na proces".

Root cause: `mapSummaryToListItem` in `frontend-app/src/lib/api/complaints-client.ts` could surface enum-like `requestedAction` / miss human `complaintSummary` ordering.

## Fix

- Prefer first line of `complaintSummary` for subject.
- Reject enum-like values (`PROCESS_COMPLAINT`, `*_COMPLAINT`) as subject candidates.
- Fall back to `Prigovor {publicReference}` only.
- Unit coverage added in `complaints-client.test.ts`.

Evidence and UI copy use UTF-8 diacritics (žalba, Žalbe, prigovor) — not Latin-1 mojibake (Å¾alba).
