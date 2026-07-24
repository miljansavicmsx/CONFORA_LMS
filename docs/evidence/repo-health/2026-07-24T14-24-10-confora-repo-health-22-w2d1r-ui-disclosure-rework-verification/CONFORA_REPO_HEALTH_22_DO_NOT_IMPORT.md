# CONFORA-REPO-HEALTH-22 — Do Not Import

## Still do not import in this / next uncontrolled wave

| Path / pattern | Reason |
|----------------|--------|
| `packages/notification-templates/**` | Deferred |
| `packages/database/**` | Out of wave |
| `packages/auth/**` | Out of wave |
| `packages/ai-*/**` | Out of wave |
| `apps/**` | Out of wave |
| `frontend-app/**` | Out of wave |
| `scripts/**` | Out of wave |
| `terraform/**` | Out of wave |
| `package.json` / lockfile / workspace config | Must not change with UI source import |
| Broad `git add packages` / `git add packages/ui` | Forbidden |

## This audit did not import

| Path | Status |
|------|--------|
| `packages/ui/src/ai-disclosure.tsx` | untracked candidate only |
| `packages/ui/src/index.ts` | untracked candidate only |

## Staging / commit

- Source staged: **false**
- Source committed/imported: **false**

## Approvals not claimed

- External pilot: false
- Security delegate: false
- DPO / legal: false
