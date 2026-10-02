# Authority and lineage

```text
RECORD_UTC = 2026-10-02T20:05:52Z
```

## Consumed authorization

```text
OWNER_AUTHORIZE_R0_7D_MD05_ALTERNATIVE_A_IMPLEMENTATION_BLUEPRINT_AND_EXACT_SCOPE_FREEZE_R1 = CONSUMED
```

This token authorizes recording the Alternative A implementation blueprint
and freezing the exact MD05 path boundary plus detailed RBAC/SoD matrix.
It does not authorize residual source restoration, backend module creation,
path expansion, complaint-handler naming, privacy-basis recording, general
C3-S9 resume, R0-7E, deployment, CI-green claim, or CI waiver.

## Predecessor chain (live)

| Predecessor | Status on base `1c2f649` |
| --- | --- |
| Eight-path definition freeze R1 | FROZEN_PROSPECTIVE; MD05 PRIMARY_PATH = `frontend-app/src/lib/api-grievances.ts`; ADDITIONAL_PATHS = none |
| Alternative A decision freeze R2 | Integrated via PR 45 / `426cc1e`; architecture CLOSED_ACCEPTED |
| Premerge independent review | PASS_ACCEPT |
| Authoritative I2 postmerge review | PASS_ACCEPT; reviewer `bc-10bbd613-2baa-4910-af68-d3ede652703a`; commit `8b97f8a`; 31/0/1 NOT_VERIFIED retained |
| Status alignment R2 | Integrated via PR 47 / `3805dba` |
| Status alignment R3 | Integrated via PR 49 / `1c2f649` |
| PR 41 SoD design evidence | Historical non-authoritative design note; not merged; not mutated |
| PR 42 historical decision-freeze R1 | Preserved unmerged non-authoritative attempt; not mutated |

## Design lineage (non-authoritative binary)

```text
DESIGN_PACKAGE_SHA256 =
fcc012bf7ff6b2c86fe0b3fd6d41ec6cf3ff733de227c18a26c350fa4f9afad2
DESIGN_PACKAGE_BINARY_PRESENT_ON_INTEGRATION = false
DESIGN_PACKAGE_BINARY_REHASH =
NOT_PERFORMED_RETAIN_I2_NOT_VERIFIED
PR41_DESIGN_EVIDENCE_COMMIT =
81ab345f198a410a3d19400a2f8d40f9f8c59c26
```

The I2 NOT_VERIFIED item (V32/Q22 design-zip binary rehash) remains
NOT_VERIFIED and is not converted to PASS by this package.

## Live verification at branch start

```text
api-grievances.ts = MISSING
apps/api/src/cert-appeals/ = MISSING
apps/api/src/cert-complaints/ = MISSING
frontend-app/src/lib/api/complaints-client.ts = PRESENT
frontend-app/src/lib/api/appeals-client.ts = MISSING
```
