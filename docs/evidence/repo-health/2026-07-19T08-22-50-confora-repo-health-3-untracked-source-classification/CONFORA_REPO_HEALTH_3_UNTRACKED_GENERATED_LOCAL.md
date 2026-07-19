# Untracked generated / local candidates

HEALTH-2 hardened `.gitignore` already excludes most heavy generated trees (`node_modules`, `.tools`, `.local-backups`, dist, turbo, env locals, QR screenshots, keycloak temp dump).

## Still visible as untracked matching generated heuristics

| Count | Notes |
|------:|-------|
| 1 | `packages/shared-types/tsconfig.build.tsbuildinfo` |

## Local / regenerable (already ignored — not in status if ignore works)

- `node_modules/`, `frontend-app/node_modules/`
- `frontend-app/dist/`, `apps/**/dist/`, `.turbo/`
- `.tools/`, `.local-backups/`
- `tmp-keycloak-setup-output.txt`, root `Screenshot*qr*.png`

## Local artifacts still appearing untracked (do not track)

| Path | Class |
|------|-------|
| `apps/api/build-log.txt` | build log / local |
| `scripts/ops/_tmp-repo-health-3-classify.mjs` | temp audit helper |

**Cleanup not executed.** Regenerable deletes still require human approval (see safe cleanup plan).
