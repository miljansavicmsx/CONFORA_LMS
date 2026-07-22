# CONFORA-REPO-HEALTH-21 — Do Not Import

## Blocking (this wave)

| Path / pattern | Reason |
|----------------|--------|
| `packages/ui/src/ai-disclosure.tsx` | Hardcoded English; incomplete human-oversight wording contract |
| `packages/ui/src/index.ts` | Barrel exports unreworked `AiDisclosure` |
| Full `@confora/ui` barrel entry pointing at current `index.ts` | Unintentional public API for REWORK_REQUIRED component |

## Deferred / out of scope (unchanged)

| Path / pattern | Reason |
|----------------|--------|
| `packages/notification-templates/**` | Explicitly deferred |
| `apps/**` | Out of wave |
| `frontend-app/**` | Out of wave |
| `scripts/**` | Out of wave |
| `terraform/**` | Out of wave |
| `packages/database/**` | Out of wave |
| `packages/auth/**` | Out of wave |
| `packages/ai-*/**` | Out of wave |
| `package.json` / lockfile / `.gitignore` | Must not change in this task |
| Broad `git add .` / `git add packages/` / `git add packages/ui/` | Forbidden |

## Staging / commit

- Source files staged: **false**
- Source files imported: **false**
- This task commits: **none** (audit evidence may be committed later only if user requests)

## Approvals not claimed

- External pilot: **false**
- Security delegate: **false**
- DPO / legal: **false**
