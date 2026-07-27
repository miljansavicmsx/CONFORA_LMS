# Validation

| Check | Result |
|-------|--------|
| Only operational file changed | `.github/workflows/accessibility.yml` |
| `contents: write` absent | pass |
| `contents: read` present | pass |
| `git push` / `git commit` / `git add` absent | pass |
| Publish-on-main step absent | pass |
| All `uses:` SHA-40 pinned | pass |
| Artifact upload retained | pass |
| Lockfile / manifests untouched | pass |
| Other workflows untouched | pass |
| deploy-backend untouched | pass |
| R0-3 containment preserved | pass |
| Production deploy runs | 0 expected |

## Non-claims

- Does not make accessibility tests pass
- Does not fix lockfile / install
- Does not recover database service
- Does not track a11y scripts or frontend-app-only target (R0-7D)
- Does not enable required checks
