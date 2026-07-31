# Package-manager provenance

## Declared

Root `packageManager`: `pnpm@9.14.2`

## Implementation / independent reproduction

Effective invocation:

`npx --yes pnpm@9.14.2`

Reported version: `9.14.2`

## Classification

`ACCEPTABLE_WITH_PROVENANCE_LIMITATION`

- Explicit version pin (not bare `npx pnpm`) — acceptable.
- Limitation: registry-resolved CLI via npx without Corepack store attestation
  recorded in repository evidence.

## Guidance

Future CI and reproduction guidance should prefer Corepack activation of the
root `packageManager` declaration (`pnpm@9.14.2`).
