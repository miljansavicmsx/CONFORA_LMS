# CONFORA-REPO-HEALTH-6 — Summary

| Item | Value |
|------|-------|
| Task | `CONFORA_REPO_HEALTH_6_SOURCE_IMPORT_WAVE_PLANNING` |
| Based on | `6fc1152` |
| Branch | `fix/ca-h01-frontend-f4-cutover` |
| Tracked working tree clean | **true** |
| Status entries | **1646** (untracked only) |
| Source committed | **false** |
| Final verdict | `CONFORA_REPO_HEALTH_6_AUDIT_ONLY_READY_FOR_REVIEW` |

## Headline

1. Remaining work is **curated source import**, not more ignore rules.
2. ~**2.0k** code-path untracked files are import candidates; **~102k** files under `docs/evidence` are mostly smoke dumps — **do not bulk-import**.
3. Propose **7 waves**; first wave is small config/manifests only.
4. Auth/MFA/Keycloak/JWT paths need **manual review** before their wave.
5. Next action: `REVIEW_SOURCE_IMPORT_WAVES_BEFORE_TRACKING_SOURCE`.
