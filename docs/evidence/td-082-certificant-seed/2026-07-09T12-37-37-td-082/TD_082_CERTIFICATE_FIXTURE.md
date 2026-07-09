# TD-082 Certificate Fixture

## Synthetic person certificate

| Field | Value |
|-------|-------|
| `type` | `CERTIFICATION` → wallet `PERSON_CERTIFICATION` |
| `status` | `ACTIVE` |
| `uid` / `certificateNumber` / `publicNumber` | `CON-PILOT-000082` |
| `schemeTitle` (via scheme) | Sample certification scheme |
| `issueDate` / `issuedAt` | ~400 days ago (rolling on seed run) |
| `validUntil` / `expiryDate` | ~60 days ahead (CPD/recert T-90 window) |
| `scopeText` | Synthetic pilot fixture label |
| `cpdEligible` / `recertificationEligible` | `true` (TD-081 derivation) |

## Recertification case

- Status `OPEN`
- Linked to certificate internal ID
- `inputs: { cpd_hours_recorded: 0 }` for CPD hours patch flow

## Implementation

`packages/database/prisma/seeds/td-082-pilot-certificant-wallet.ts`

CLI wrapper: `scripts/ops/seed-pilot-certificant-wallet.ts`

## Note on governance chain

Full B11 issuance chain is **not** replayed. Fixture is explicitly synthetic local/dev data for wallet + CPD UI testing only.
