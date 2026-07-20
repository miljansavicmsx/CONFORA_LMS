# CONFORA-REPO-HEALTH-8 — Report

| Field | Value |
|-------|-------|
| Evidence | `docs/evidence/repo-health/2026-07-20T21-08-08-confora-repo-health-8-w2-shared-packages-review/` |
| Based on | `4494af5` |
| Status entries | **1626** |
| Packages candidates | **158** |
| Secret hits | **0** |
| W2A paths | **26** |
| Verdict | `CONFORA_REPO_HEALTH_8_AUDIT_ONLY_READY_FOR_REVIEW` |

## Classification snapshot

| Class | Packages |
|-------|----------|
| W2A safe now (manifests/tsconfigs) | shared-types, shared-kernel, config (partial), ui (configs), audit-client, sdk, notification-templates |
| W2B review | shared-types + shared-kernel **source** |
| W2C if safe | config tooling, audit-client/sdk/ui source |
| Defer | auth/audit/types/ai-* stubs & AI sources |
| Do not import yet | `database/**` |

## W2 split

W2A → W2B → W2C → defer AI/auth stubs → database later

## Final verdict

`CONFORA_REPO_HEALTH_8_AUDIT_ONLY_READY_FOR_REVIEW`
