# S17 Public Verification Privacy Check

| Field | Exposed |
|-------|---------|
| JMBG | false |
| Date of birth | false |
| Email | false |
| Phone | false |
| Address | false |
| Identity evidence | false |
| Reviewer notes | false |
| Committee votes | false |
| Audit payload | false |
| Raw storage paths | false |
| Private dashboard data | false |

## API private-field scan (valid)

- No forbidden keys detected

## API private-field scan (invalid)

- No forbidden keys detected

## Public verification audit

Public verification audit events are sampled/redacted per Nest verify module (`VERIFY_AUDIT_IP_SALT`). No raw token/JWT/password logged during this sign-off probe.

**Observed behavior:** read-only GET `/api/public/verify/:hash` — no mutation endpoints invoked from browser walkthrough.
