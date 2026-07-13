# TD-070-F2-R1 Diagnosis

**Task:** Restore admin_gov and learner acceptance after TD-070-F2 i18n/sidebar regression  
**Evidence folder:** `docs/evidence/td-070-i18n-followup/2026-07-11T22-16-00-td-070-f2-r1/`  
**Date:** 2026-07-11

## Symptom

After TD-070-F2 (`530f15c`), sequential regression failed with `TD_085_NO_GO_FUNCTIONAL_REGRESSION`:

| Suite | Result |
|-------|--------|
| f4_audit | PASS |
| f5_3 | PASS |
| s17 | PASS |
| **admin_gov** | **FAIL** |
| **learner** | **FAIL** |
| f4_9 | PASS |

### Failing selectors (admin)

- `getByRole("navigation", { name: "Glavna navigacija" })` — not found
- Dashboard heading — not found
- Stable test ids: `admin-reports-heading`, `admin-education-heading`, `identity-review-heading`, etc.

### Failing selectors (learner)

- `getByRole("heading", { name: /Dobro došli/i })` — not found
- `learner-education-heading`, `learner-exam-registration-page`, `learner-cert-applications-page`, `learner-certificates-page`, `learner-support-page` — not found

Playwright failure screenshots showed a **blank white page** after `page.goto("/dashboard")` (full reload), while client-side navigation after login sometimes appeared to work briefly.

## Runtime error (exact)

Browser console on full page reload:

```
Cannot read properties of undefined (reading 'toLowerCase')
```

Stack trace (abbreviated):

```
buildCommandSearchIndex
  → certificationProvider
    → section.title.toLowerCase()
command-search-engine
  → entity.title.toLowerCase()
```

## Root cause classification

**Primary:** Shell crash (React runtime error) — **not** aria-label mismatch.

**Secondary mechanism:** TD-070-F2 changed sidebar definitions from `{ label, title }` to `{ labelKey, titleKey }`. Command-center nav providers were **not** updated and still read `item.label` and `section.title` from raw `collectTaggedSidebarSections()` output.

| Consumer | Expected (pre-F2) | After F2 | Result |
|----------|-------------------|----------|--------|
| `Sidebar.tsx` | — | Uses `localizeSidebarSections()` | OK |
| `certification-provider.ts` | `section.title` | `section.titleKey` only | **Crash** on `.toLowerCase()` |
| `learning/governance/system-provider.ts` | `item.label`, `section.title` | `labelKey`/`titleKey` only | `undefined` titles |
| `command-search-engine.ts` | `entity.title` string | `undefined` from providers | **Crash** on `.toLowerCase()` |

`GlobalCommandCenter` mounts inside `Header.tsx` on every authenticated dashboard page. Its `useMemo` hooks run **even when the command palette is closed**, building the search index on every render. When `certificationProvider` hit `section.title.toLowerCase()` with `section.title === undefined`, React crashed and the entire dashboard shell (sidebar, outlet, page headings) failed to render.

## Why both admin_gov and learner failed

Both suites depend on the shared `DashboardLayout` shell:

1. Login succeeds (auth layer independent of command center).
2. Full reload to `/dashboard` mounts `Header` → `GlobalCommandCenter` → `buildCommandSearchIndex` → crash.
3. Blank page → navigation `aria-label="Glavna navigacija"` not in DOM → all shell-dependent selectors fail.

This is a **shared shell regression**, not isolated page or RBAC failures.

## aria-label note

`hr/a11y.json` correctly defines `"main_navigation": "Glavna navigacija"`. Sidebar uses `t('main_navigation', { ns: A11Y_NS })`. When the shell renders, the accessible name is correct. The failure was absence of the nav element due to crash, not a translation key mismatch.

## Prior evidence consulted

- `docs/evidence/td-085-sequential-regression/2026-07-11T21-20-23-td-085/`
- `docs/evidence/admin-governance-final-acceptance/2026-07-11T21-24-02-admin-gov-final-acceptance-1/`
- `docs/evidence/learner-final-acceptance/2026-07-11T21-32-11-learner-final-acceptance-1r/`
- `frontend-app/test-results/*error-context.md` (blank shell screenshots)
