# Workflow YAML / GitHub Actions validation — R0-7C2

Applies to:

- `.github/workflows/ci.yml` (`database` / `postgres`)
- `.github/workflows/accessibility.yml` (`compliance-iso` / `postgres`)

| Check | Result |
|-------|--------|
| YAML accepted by GitHub Actions | Yes |
| Service container created | Yes |
| Container started | Yes |
| Health status | `healthy` |
| Exit 125 | Absent (0 hits in PR run logs) |
| Quoting survived YAML + GHA serialization | Yes |
| Health retries | `10` |
| Interval / timeout | `10s` / `5s` |
| Triggers / permissions / dependencies changed | No |
| Install / Prisma / test / artifact steps changed | No |

## Run identifiers (no secrets)

| Workflow | Run ID | Head SHA | Service outcome |
|----------|--------|----------|-----------------|
| CI (`database`) | `30661517419` | `282aa2bd372dc1248e32c756c0a4a44e7c41a047` | postgres `healthy` |
| Accessibility CI (`compliance-iso`) | `30661517198` | `282aa2bd372dc1248e32c756c0a4a44e7c41a047` | postgres `healthy` |
