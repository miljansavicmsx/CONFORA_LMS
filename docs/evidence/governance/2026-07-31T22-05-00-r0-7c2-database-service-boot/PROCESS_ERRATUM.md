# Process erratum — R0-7C2

Classification: `PROCESS_AND_DOCUMENTATION_DEVIATIONS`

## Recorded deviations

1. Draft PR #6 was opened before independent review.
2. The planned two R0-7C2 commits were combined into one commit:
   `282aa2bd372dc1248e32c756c0a4a44e7c41a047`.
3. The implementation report prematurely stated:
   `READY FOR OWNER MERGE DECISION`.

## Effect assessment

- These deviations did **not** change operational scope.
- They did **not** invalidate the quote-only correction.
- PR #6 remained Draft.
- No merge occurred.
- No history rewriting is required.
- The combined commit must remain preserved for auditability (`PRESERVE_NO_REWRITE`).
- Merge readiness is established only after independent review and this evidence closure.

## CLI incident (PR create)

- An inline PR body containing unquoted `-U` was parsed by the CLI as an option.
- The retry used a body file and succeeded.
- This was a command-line invocation issue, not a repository defect.
