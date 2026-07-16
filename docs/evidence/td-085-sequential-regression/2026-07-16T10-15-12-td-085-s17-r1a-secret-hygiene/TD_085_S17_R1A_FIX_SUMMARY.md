# TD-085-S17-R1A Fix Summary

## Change

**File:** `scripts/ops/run-f5-3-data-readiness-check.mjs`

### Added

```javascript
function requireEnv(name) {
  const value = process.env[name];
  if (!value || String(value).trim() === '') {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}
```

### Replaced

| Before | After |
|--------|-------|
| `process.env.PILOT_USER_PASSWORD ?? 'PilotTest!2026'` | `requireEnv('PILOT_USER_PASSWORD')` |
| `process.env.KEYCLOAK_ADMIN_PASSWORD ?? 'admin_dev_change_me'` | `requireEnv('KEYCLOAK_ADMIN_PASSWORD')` |

## Behavior

- `PILOT_USER_PASSWORD` and `KEYCLOAK_ADMIN_PASSWORD` are sourced only from the environment.
- Missing or blank values exit with code 1 and message: `Missing required environment variable: <NAME>` (variable name only; never the value).
- Existing token handling unchanged: tokens held in memory; stripped from evidence JSON via `{ token: _t, ...safe }` destructuring.

## Controls preserved

No changes to MFA-aware login, RBAC checks, tenant isolation, privacy classification, audit writes, or governance boundaries.
