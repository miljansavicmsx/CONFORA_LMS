# CONFORA-REPO-HEALTH-25 — PII / Tenant Review

## Findings count

**`pii_tenant_findings_count`: 2** (residual / design residuals — not hardcoded PII literals)

| ID | Finding | Severity |
|----|---------|----------|
| PII-01 | MJML uses opaque `{{heading}}` / `{{bodyText}}` / `{{footer}}` — can carry personal data if caller injects it | Residual — caller/workflow controlled |
| PII-02 | No template-level tenant isolation primitives (no `tenantId` field); isolation must be enforced by notification service | Residual — expected for shells |

## Checks

| Check | Result |
|-------|--------|
| Hardcoded recipient names / emails | **none** |
| Hardcoded tenant names / IDs | **none** |
| Hardcoded certificate / application / exam session IDs | **none** |
| Explicit PII placeholder names (`email`, `fullName`, etc.) | **none** (generic bags only) |
| Cross-tenant leakage in template assets | **not present** in static content |
| Tenant-specific data clearly from controlled workflow | **required residual** — templates do not supply it |

## Verdict

Templates do not embed PII. Risk is **misuse of freeform vars** by callers. Not a blocker for `event-keys` import; blocks treating MJML+loader as production-safe without service-side escaping and tenant-scoped delivery.
