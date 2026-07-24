# CONFORA-REPO-HEALTH-31 — Secret / URL / Network Review

**Scope:** all tracked `packages/notification-templates/src/**` (+ manifests not scanned for runtime)

| Category | Hits |
|----------|------|
| Secrets / JWT / credentials | **0** |
| http(s) / localhost / fetch / axios / WS / GraphQL / process.env **usage** | **0** |

False positives (non-blocking): `process.env` in escape comment; banned API names in index.test asserts; synthetic test email/markup.

**`secret_pattern_hits`: 0** · **`url_or_network_hits`: 0**
