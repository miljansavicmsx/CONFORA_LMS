# Status pins and Model D

```text
REVIEW_UTC = 2026-10-02T07:33:19Z
```

Owner-supplied status pins verified live on subject `ad505f5…`:

```text
MD05_DECISION_FREEZE_R2_STATUS =
R2_INTEGRATED_I2_CLOSED_ACCEPTED
PREMERGE_INDEPENDENT_REVIEW_RESULT = PASS_ACCEPT
POSTMERGE_I2_REVIEW_RESULT = PASS_ACCEPT
POSTMERGE_I2_VALIDATION = 31_PASS_0_FAIL_1_NOT_VERIFIED
POSTMERGE_I2_QUESTIONS = 21_PASS_0_FAIL_1_NOT_VERIFIED
MD05_ARCHITECTURE_DECISION = ALTERNATIVE_A_CLOSED_ACCEPTED
```

These pins appear consistently in:

- `docs/governance/R0_7D_MD05_..._STATUS_ALIGNMENT_R3.md`
- `docs/governance/OWNER_DECISION_REGISTER.md` Part E MD05 section
- `docs/governance/OWNER_DECISION_PACKAGE.md` MD05 row
- candidate Level 7 evidence under `.../status-alignment-r3/20261001121517/`

Authoritative I2 NOT_VERIFIED retained (must not become PASS):

```text
NOT_VERIFIED_ID = V32 / Q22
NOT_VERIFIED_CHECK = Original design zip binary rehash
EXPECTED = fcc012bf7ff6b2c86fe0b3fd6d41ec6cf3ff733de227c18a26c350fa4f9afad2
OBSERVED = binary absent on integration
BLOCKER = false
I2_NOT_VERIFIED_CONVERTED_TO_PASS = false
```

Model D and MD05 residual state on subject:

```text
MODEL_D = 17/9/8/8/0
MODEL_D_MUTATION_COUNT = 0
NEWLY_RESOLVED_ITEM_COUNT = 0
UNRESOLVED_ITEM_SET =
MD02, MD03, MD05, MD06, MD07, MD09, MD10, MD12
MD05_STATUS = UNRESOLVED_ARCHITECTURE_SELECTED_PENDING_SCOPE_FREEZE
MD05_FORMALLY_RESOLVED = false
MD05_IMPLEMENTATION_AUTHORIZATION = false
MD05_ADDITIONAL_PATH_EXPANSION_ADOPTED = false
MD05_REMAINS_SINGLE_MODEL_D_ITEM = true
```

Live integration HEAD `3805dba…` still carries R2 pins
(`POSTMERGE_I2_REVIEW_RESULT = NOT_PERFORMED`) until a later
owner-authorized merge of this accepted R3 candidate. This review package
does not rewrite integration Part E.
