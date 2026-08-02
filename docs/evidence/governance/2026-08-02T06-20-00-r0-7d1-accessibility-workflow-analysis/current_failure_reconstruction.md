# Current failure reconstruction

## Evidence source

- GitHub Actions run: `30735089256`
- URL: https://github.com/miljansavicmsx/CONFORA_LMS/actions/runs/30735089256
- Head SHA: `2559096dd82d34b28ac3db55238acabec7a0822b`
- Workflow blob identical to integration tip `4090be85a0f8e423d199610f82e3949c899cc90b`
- Kind: GitHub Actions log fact

## accessibility job

1. Install workspace: PASS (`pnpm install --frozen-lockfile`)
2. First failing step: `Design token contrast (WCAG 1.4.3 / 1.4.11)`
3. Command: `pnpm a11y:contrast` → `tsx tools/a11y/contrast-check.ts`
4. Error: `ERR_MODULE_NOT_FOUND` — Cannot find module `tools/a11y/contrast-check.ts`
5. Exit code: 1
6. Path tracked?: NO — local untracked only (`git ls-files tools/a11y` empty;
   GitHub contents API 404)
7. Exists locally untracked?: YES
8. Previously generated?: local helper (imports packages/ui/tokens); not produced on runner
9. Assumed elsewhere?: root `package.json` script `a11y:contrast` references it
10. Before real a11y tests?: YES — before build, docker, playwright, axe

### Cascading if:always failures (same run)

- Compare axe vs baseline → missing `scripts/a11y/compare-baseline.mjs`
- Aggregate HTML report → missing `scripts/a11y/aggregate-report.mjs`
- PR comment summary → missing `scripts/a11y/pr-comment.mjs`
- Notify on failure → missing `scripts/a11y/notify-failure.mjs`
- Upload artifacts: SUCCESS
- Record a11y CI outcome: SUCCESS (skip without COMPLIANCE_DATABASE_URL)

## compliance-iso job

- Install PASS; postgres healthy PASS
- First failure: Prisma generate — `packages/database` missing
- Assigned: OD-R07-2 / R0-7E

## Integration tip

No separate Accessibility CI run observed yet on `4090be85a0f8e423d199610f82e3949c899cc90b` after merge; workflow
content matches PR #7 head, so the failure mode remains applicable.
