# CONFORA-REPO-HEALTH-18 — Large file review

## W2D-likely candidates (`ui` + `notification-templates`)

| Path | Bytes | Binary? |
|------|------:|:-------:|
| Largest UI | `tokens.ts` 6078 | no |
| Largest template | MJML ≤739 | no |
| All 15 | text | no |

| Field | Value |
|-------|-------|
| `large_binary_candidates` | **[]** |

## Noted but out of W2D import

| Path | Bytes | Note |
|------|------:|------|
| `packages/database/prisma/schema.prisma` | ~203322 | Large text schema — do not import this wave |
| `packages/database/prisma/migrations/..._init/migration.sql` | ~34445 | Migration SQL — do not import this wave |
| `packages/ai-client/src/index.js(.map)` | ~4–5KB | Compiled artifacts — do not import |
