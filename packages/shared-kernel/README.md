# packages/shared-kernel

Domain primitives shared across bounded contexts.

## Contains

- Value objects (TenantId, UserId, CertificateNumber)
- Domain events (base types)
- Result/error contracts
- Cross-cutting enums (non-UI)

## Must not

- Import from apps
- Contain HTTP, ORM, or UI logic
