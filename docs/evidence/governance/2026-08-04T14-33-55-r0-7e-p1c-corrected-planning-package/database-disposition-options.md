# Database Disposition Options

Current authority: packages/database/** has zero tracked files.

## Option 1 - Separate tracked recovery

An owner-approved package may reconstruct canonical tracked database authority
only from approved sources. Required proof includes schema, migrations,
tenant-isolation controls, audit implications, deterministic generation/tests,
clean-clone evidence, independent review, and separate merge authorization.

## Option 2 - Explicit blocked implementation-compliance lane

Governance-policy validation may run, but database-dependent implementation
controls remain BLOCKED_MISSING_TRACKED_AUTHORITY with a visible reason.

## Prohibited disposition

Do not copy, infer, synthesize, or promote local-only database content. Do not
delete the failing check, silently filter the package, or relabel policy success
as database implementation compliance.

Recommendation: SEPARATE_TRACKED_DATABASE_RECOVERY_OR_EXPLICIT_BLOCKED_LANE

No option is adopted. OD-R07E-3 remains OWNER_DECISION_REQUIRED.
