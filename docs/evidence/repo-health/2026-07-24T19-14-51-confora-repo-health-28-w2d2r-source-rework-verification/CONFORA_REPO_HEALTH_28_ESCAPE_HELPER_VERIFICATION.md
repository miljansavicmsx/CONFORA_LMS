# CONFORA-REPO-HEALTH-28 — Escape Helper Verification

| Check | Result |
|-------|--------|
| Pure helper | **yes** |
| Escapes `& < > " '` | **yes** |
| DOM / browser globals | **none** |
| External packages | **none** |
| Network / `process.env` | **none** |
| Side effects | **none** |
| Subject sanitizer separate | **yes** (`sanitizePlainTextSubject`) |

**`escape_helper_pure`: true**
