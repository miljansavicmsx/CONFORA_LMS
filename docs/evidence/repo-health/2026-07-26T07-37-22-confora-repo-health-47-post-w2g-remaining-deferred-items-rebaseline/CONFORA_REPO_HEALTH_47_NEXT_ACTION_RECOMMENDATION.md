# CONFORA REPO HEALTH 47 — Next Action Recommendation

## Recommended next action

**`RH48_NOTIFICATION_TEMPLATES_HR_MJML_LOCALIZATION_AUDIT_THEN_REWORK_OR_GENERATED_ARTIFACT_GITIGNORE_HYGIENE`**

Two small, bounded candidates — pick in this order:

### Option A (preferred): HR MJML localization audit
- Scope: 3 `hr.mjml` files in `packages/notification-templates`.
- Audit-only first (parity vs EN MJML, terminology, no PII, workflow-boundary), mirroring the RH37/RH39 pattern.
- Small, self-contained, closes the last residual in an already-closed package.

### Option B: Generated-artifact gitignore hygiene
- Scope: `packages/ai-client/src/index.{js,d.ts,js.map}` and a repo-wide ignore-coverage check for emitted `src` output.
- Removes the standing accidental-staging/shadowing risk flagged in RH45/RH46.
- Requires deleting untracked files or editing `.gitignore` — must be its own task (not audit-only).

## Deliberately deferred to dedicated waves

| Item | Why not now |
|------|-------------|
| `packages/database` | DB schema/migrations/Prisma + vendored `node_modules`; needs full architecture + DB-rules review |
| `backend/**`, `frontend-app/**`, `frontend-public/**` | very large; canonical-vs-legacy status must be reconciled first (RH43A lesson) |
| `apps/**` broader tree + RH43 apps/api AI rework | canonical apps/api AI source still absent; **RH43 remains blocked** |
| `infra/**`, `infrastructure/**`, `terraform/**`, `scripts/**` | IaC/ops; secret/state risk; separate security-aware review |
| README stub roots (`ai-governance`, `audit`, `auth`, `types`) | no importable source yet |

## Hard limits

Whatever runs next must be audit-only unless it is an explicit, scoped rework/hygiene task, must stage by explicit file list, must not touch `package.json`/`pnpm-lock.yaml`/`pnpm-workspace.yaml`, must not import HR MJML or ai-client generated artifacts casually, and must claim no production/pilot/DPO/legal/security/accreditation/AI-governance approval.
