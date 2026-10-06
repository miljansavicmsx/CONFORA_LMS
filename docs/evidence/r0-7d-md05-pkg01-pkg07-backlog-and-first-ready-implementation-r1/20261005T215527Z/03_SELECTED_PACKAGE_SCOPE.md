# 03 — Selected package scope

```text
SELECTED_PACKAGE_ID = PKG-01
TITLE = Executable role-administration application boundary
STATUS = READY
DEPENDENCIES = none in this backlog; PKG-00 contract is on integration HEAD
PRODUCTION_PATH_COUNT = 6
TEST_PATH_COUNT = 1
SCHEMA_PATH_COUNT = 0
MIGRATION_PATH_COUNT = 0
RISK = MEDIUM_POLICY_GATE_WITHOUT_PERSISTENCE
```

The production count includes the directory boundary `apps/api/src/role-administration/` plus five files: `app.module.ts`, the module, the service, the types file, and the legacy-alias file.

The test path is `apps/api/src/role-administration/role-administration-boundary.service.spec.ts`.

Before-state SHA-256 of `apps/api/src/app.module.ts`:

`7fad17c187d384ae0d459a5fd7a5754d8c7bdfc65aa828f1c265717bc12f7150`

The other production files did not exist.

O03 is in scope only as the requirement that this boundary read `actor.roles`. The observation remains open on the audit path.
