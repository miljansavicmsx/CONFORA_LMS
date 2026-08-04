# Source authority

## Integration tip is authoritative for what is already tracked

Seeds such as `FormalComplaintDialog.tsx` and `complaints-client.ts` at `4090be85…` define the intended operational imports. They are incomplete, not wrong.

## Rejected tips are not canonical

Both:

- `13cdd752…` (`ci/r0-7d2-accessibility-baseline`)
- `fda8d363…` (`ci/r0-7d2s2-manifest-locked-public-slice`)

remain `REJECTED_EXPERIMENTAL_NOT_PR_ELIGIBLE`.

Presence of a file there does **not** make it approved. It only means a candidate blob exists for owner-authorized path-checkout review.

## Tip preference for inspection

| Module class | Prefer |
|--------------|--------|
| Complaint types / category util / canonical flag / `api-grievances` / `dialog.tsx` | **D2** (`13cdd752…`) — absent on S2 |
| Shared UI button/label/badge, `api-error`, `api-provider`, `utils` | D2 or S2 (often identical blobs) |
| `http-client.ts` | Blobs **differ** S2 vs D2 (1-line delta observed) — compare before promote; default to D2 unless review prefers S2 |

## Provenance rule for next implementation

For each authorized path:

1. Confirm missing at integration.
2. Confirm candidate tip blob hash.
3. Justify importer chain from complaint seeds (no appeal filing).
4. Classify: shared infrastructure vs complaint domain vs overreach.
5. Security review (no secrets, no demo credentials).
6. Path-checkout that blob only — no directory add.
