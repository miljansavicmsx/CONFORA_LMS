# CONFORA-REPO-HEALTH-29 — Escape Helper Review

**File:** `packages/notification-templates/src/escape.ts` (885 B)

| Check | Result |
|-------|--------|
| Pure helper | **yes** |
| HTML text escaping (not URL/CSS/JS/header universal claim) | **yes** — `escapeHtmlText` for HTML/MJML text; separate `sanitizePlainTextSubject` for subjects |
| Escapes `& < > " '` | **yes** |
| DOM / browser globals | **none** |
| Node fs/path | **none** |
| `process.env` usage | **none** (comment only) |
| Network / provider / delivery | **none** |
| Recipient / tenant / workflow | **none** |
| Side effects | **none** |

**`escape_helper_pure`: true**
