# CONFORA-REPO-HEALTH-29 — Secret / URL / Network Review

**Scope:** six first-slice files

| Category | Blocking hits |
|----------|---------------|
| Secrets / JWT / credentials | **0** |
| http(s) / localhost / fetch / axios / WS / GraphQL / process.env **usage** | **0** |

## Manual false-positive classification

| Match | Classification |
|-------|----------------|
| Comment in `escape.ts`: “no … process.env …” | Documentation only — **allowed** |
| Test string `evil@example.com` in CR/LF subject test | Synthetic fixture — **not real PII / not a secret** |
| Subject line `user.password_reset_required` event wording | Event subject catalog text — **not a password value** |
| Subject `complaint.subject_notified` | Event subject catalog — **not email Subject header template engine** |

**`manual_scan_false_positives`:** process.env comment; synthetic evil@example.com; password_reset_required subject key wording; complaint.subject_notified subject wording
