# Owner decisions required

| ID | Decision | Options (indicative) | Blocks |
|----|----------|----------------------|--------|
| OD-R07-1 | Lockfile recovery method | Regenerated from tracked-only tree vs surgical edit | R0-7B |
| OD-R07-2 | Track `packages/database` Prisma tree? | Promote tracked / keep local / alternative path | R0-7C migrate steps |
| OD-R07-3 | A11y CI target surface | frontend-app only / include Next after OQ-4 | R0-7D |
| OD-R07-4 | Retain FastAPI in any CI job? | Exclude (recommended) / OD to track (forbidden without separate OD) | a11y compose, backend workflows |
| OD-R07-5 | Disable backend-nightly schedule until track OD? | Disable / keep failing | noise reduction |
| OD-R07-6 | When to enable branch protection required checks | After R0-7E green | R0-7F |
| OD-R07-7 | Admin bypass policy for CI | Deny (recommended) / time-boxed exception | R0-7F |
| OD-R07-8 | Pin Actions to commit SHAs? | Yes / majors only | supply chain |
