# Docker compose review

## Canonical vs legacy

| Path | Role |
|------|------|
| `infra/docker/docker-compose.yml` | **Canonical** local pilot stack (referenced by `package.json` `docker:up` / `docker:down`) — exists: true |
| Root `docker-compose.yml` | **LEGACY** DynamoDB/LocalStack/FastAPI/Vite path (header says not F5/F6 canonical) |
| `docker-compose.a11y-ci.yml` | Legacy a11y CI subset |

## Root compose snapshot

### `docker-compose.yml`
- Services (9): dynamodb-local, dynamodb-admin, localstack, fastapi-backend, nextjs-public, react-app, localstack-data, nextjs-public-node-modules, react-app-node-modules
- Images sample: amazon/dynamodb-local:latest, aaronshaf/dynamodb-admin:latest, localstack/localstack:3.8.1, python:3.12-slim, node:22-alpine
- Ports sample: (env-substituted / none parsed)
- Dev placeholders detected: false
- Production-ready claim detected: false

### `docker-compose.a11y-ci.yml`
- Services (4): services, dynamodb-local, localstack, fastapi-backend
- Images sample: amazon/dynamodb-local:latest, localstack/localstack:3.8.1, python:3.12-slim
- Ports sample: 8001->8000, 4566->4566, 8000->8000, 1->8000
- Dev placeholders detected: false
- Production-ready claim detected: false


## Classification

| Path | Class | Note |
|------|-------|------|
| `docker-compose.yml` | review before tracking | Document as legacy; avoid implying production readiness |
| `docker-compose.a11y-ci.yml` | review before tracking | Confirm still used by a11y workflows |
| `infra/docker/*` | out of RH4 focus (separate infra wave) | Canonical |

Local ports/credentials in legacy stack are for **local only**; do not treat as staging/production config.
