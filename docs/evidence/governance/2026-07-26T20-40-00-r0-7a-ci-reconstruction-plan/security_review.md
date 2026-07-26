# Security review (CI)

| ID | Severity | Finding | Recommendation |
|----|----------|---------|----------------|
| SEC-R07-1 | HIGH | `accessibility.yml` `permissions: contents: write` + git commit/push of reports on main | Reduce to `contents: read`; publish via artifacts only |
| SEC-R07-2 | HIGH | `deploy-backend.yml` can mutate Lambda + smoke production URL when unlocked | Keep R0-3 containment; no R0-7 change |
| SEC-R07-3 | MEDIUM | Long-lived AWS access keys pattern in deploy workflow | Prefer OIDC later (out of R0-7A scope) |
| SEC-R07-4 | MEDIUM | Mutable image tags (`pgvector:pg16`, `amazon/dynamodb-local:latest`, `ubuntu-latest`) | Pin digests in reconstruction tasks |
| SEC-R07-5 | MEDIUM | Hardcoded demo passwords in a11y workflow env | Move to secrets / ephemeral test users |
| SEC-R07-6 | MEDIUM | `curl | tar` install of pdfcpu in quality job | Pin checksum / known artifact |
| SEC-R07-7 | LOW | `confora-qa` ZAP against arbitrary `zap_target` input | Restrict to allowlisted URLs |
| SEC-R07-8 | LOW | Actions pinned to major (`@v4`) not commit SHA | Prefer SHA pins for supply chain |
| SEC-R07-9 | OBS | Branch protection absent — no required checks | Address only in R0-7F after green clean-clone |
| SEC-R07-10 | OBS | No admin bypass used; R0-3 does not grant CI admin bypass | Preserve |

Fork PR behavior: default GITHUB_TOKEN write on a11y is especially risky if
forks ever enabled — keep contents write removed.
