# QA workflow security review (bounded)

| Topic | Finding |
|-------|---------|
| Permissions | No explicit `permissions:` block (defaults apply) — pre-existing |
| Secrets | None declared in workflow YAML |
| Fork behavior | `workflow_dispatch` only — not PR-triggered |
| `pull_request_target` | **Absent** |
| Shell interpolation | `zap_target` passed to action input expression; no custom shell with untrusted PR content |
| Mutable images | ZAP action may pull scanner images — pre-existing / outside R0-7B2 remediation |
| External downloads | ZAP baseline optional job |
| CRITICAL/HIGH new write risk from this change | **None identified** from version/SHA pin change |

R0-7B2 does not authorize broad QA security remediation. Downstream filters still reference untracked packages — known deferred defect.
