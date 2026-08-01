# Docker argument validation — R0-7C2

## Broken form

Effective conceptual argv:

```text
docker create ... --health-cmd pg_isready -U confora -d confora ... IMAGE
```

| Finding | Result |
|---------|--------|
| `-U` interpretation | Docker CLI flag (not `pg_isready`) |
| Exit code | `125` |
| Error | `unknown shorthand flag: 'U'` |
| Container | Never created or started |

Independently reconfirmed during review (local broken-form create).

## Corrected form

Effective GitHub Actions command (from CI run `30661517419` / Accessibility run `30661517198`):

```text
/usr/bin/docker create --name <job_service_name>
  --network <github_network> --network-alias postgres
  -p 5432:5432
  --health-cmd "pg_isready -U confora -d confora"
  --health-interval 10s
  --health-timeout 5s
  --health-retries 10
  -e POSTGRES_USER=confora
  -e POSTGRES_PASSWORD=<ephemeral_ci_value>
  -e POSTGRES_DB=confora
  -e GITHUB_ACTIONS=true
  -e CI=true
  pgvector/pgvector:pg16
```

`-U` and `-d` are evaluated inside the health command by `pg_isready`, not by the Docker CLI.
