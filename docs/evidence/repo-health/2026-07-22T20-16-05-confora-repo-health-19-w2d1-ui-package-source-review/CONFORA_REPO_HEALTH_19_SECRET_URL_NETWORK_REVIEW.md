# CONFORA-REPO-HEALTH-19 — Secret / URL / network review

**No secret values are reproduced.**

## Scope

All 6 closed-manifest UI files.

## Patterns checked

`http(s)://`, `localhost`, IPs/ports, `fetch`, `axios`, GraphQL, WebSocket, `Authorization`/`Bearer`, token/JWT, password assignments, `client_secret`/`api_key`/`private_key`, `process.env`, `.env` fallbacks, S3/webhook/analytics IDs, hardcoded API routes, legacy endpoints.

| Result | Count |
|--------|------:|
| Hits | **0** |

| Field | Value |
|-------|-------|
| `secret_pattern_hits_count` | **0** |
| `url_or_network_hits_count` | **0** |
