# CONFORA REPO HEALTH 46 — Commit Scope Review

## Source import commit

| Field | Value |
|-------|-------|
| SHA | `f2270fdf8fe4ec0bfb7ab2af528d3b8e57e0db4c` |
| Short | `f2270fdf` |
| Message | `chore(repo): add safe ai client source subset` |
| Parent | `1b9179ae` (RH45 evidence commit) |
| File count | **5** |

## Files in commit (exact)

```text
A  packages/ai-client/package.json
A  packages/ai-client/src/index.ts
A  packages/ai-client/src/metadata.test.ts
A  packages/ai-client/tsconfig.build.json
A  packages/ai-client/tsconfig.json
```

Expected RH45 minimal import candidate match: **exact (5/5)**.

## Out-of-scope exclusion check

| Excluded path / area | Present in `f2270fdf`? |
|----------------------|:----------------------:|
| `packages/ai-client/src/index.js` | **no** |
| `packages/ai-client/src/index.d.ts` | **no** |
| `packages/ai-client/src/index.js.map` | **no** |
| `packages/ai-client/tsconfig.build.tsbuildinfo` | **no** |
| `packages/ai-client/dist/**` | **no** |
| `packages/ai-client/node_modules/**` | **no** |
| `packages/ai-client/.turbo/**` | **no** |
| `apps/**` | **no** |
| `frontend-app/**` | **no** |
| `packages/ai-prompts/**` | **no** |
| `packages/i18n/**` / `packages/ui/**` | **no** |
| `packages/notification-templates/**` | **no** |
| `packages/database/**` / `auth/**` / `audit/**` / `sdk/**` / `config/**` | **no** |
| root `package.json` | **no** |
| `pnpm-lock.yaml` / `pnpm-workspace.yaml` | **no** |
| `terraform/**` / `scripts/**` | **no** |
| `docs/evidence/**` | **no** |

Automated filter: all commit paths match `^packages/ai-client/(package\.json|tsconfig\.json|tsconfig\.build\.json|src/index\.ts|src/metadata\.test\.ts)$` → `NO_UNEXPECTED`.

## RH45 evidence commit scope

`1b9179ae docs(repo): add ai-client audit review` contains only RH45 evidence files under:

`docs/evidence/repo-health/2026-07-26T06-39-46-confora-repo-health-45-w2g-ai-client-audit-review/`

No source/package files in that commit. **rh45_evidence_commit_scope_clean: true**.

## Conclusion

`commit_scope_verified: true` · `imported_files_exact_match: true` · `unexpected_files_in_import_commit: []`
