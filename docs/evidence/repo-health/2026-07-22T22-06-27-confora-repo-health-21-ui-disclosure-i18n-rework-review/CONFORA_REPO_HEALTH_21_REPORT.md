# CONFORA-REPO-HEALTH-21 — Report

## Task

`CONFORA_REPO_HEALTH_21_UI_DISCLOSURE_I18N_REWORK_REVIEW`  
**Mode:** audit / report only  
**Evidence:** `docs/evidence/repo-health/2026-07-22T22-06-27-confora-repo-health-21-ui-disclosure-i18n-rework-review/`

## Baseline

| Item | Value |
|------|-------|
| Branch | `fix/ca-h01-frontend-f4-cutover` |
| HEAD | `278d4af5` (`docs(repo): add w2d1 ui import verification evidence`) |
| Remote contains HEAD | yes |
| Tracked working tree clean | yes |
| Staged | 0 |
| `ai-disclosure.tsx` untracked | yes |
| `index.ts` untracked | yes |
| Notification templates deferred | yes (9 untracked) |

## Disclosure source findings

Presentational React disclosure (`role="note"`, `data-ai-disclosure`). Type-only React dependency. No network, secrets, auth, or DOM APIs.

**Hardcoded English (blocking i18n):**

1. Pill: `AI-assisted`
2. Banner: `This feature uses artificial intelligence. Outputs are suggestions — verify before relying on them.`
3. Decorative mark: `AI` (`aria-hidden`)

## Hardcoded English / i18n findings

- Product English defaults violate CONFORA “no hardcoded UI text”.
- No `message` / `children` / translation-key props.
- Rework: require locale-owned visible text; safe defaults only if non-product/demo.

## AI governance findings

- Does not claim auto-certification or replacement of human review (**positive**).
- Gaps: no mandatory human-oversight / “AI does not decide certification” contract in copy/API.
- Component is not an audit ledger; must remain assistive disclosure UI only.

## Barrel index risk

**Blocking.** `index.ts` exports `AiDisclosure` alongside already-safe `Button` / `SkipToMainLink`. Importing the barrel would expose REWORK_REQUIRED. Prefer keep excluded (Option A) or split primitives-only exports (Option B) without unreworked disclosure.

## Secret / URL / network

**0** hits — PASS.

## Browser / runtime

**0** blocking findings — PASS (static). Residual: `{...rest}` attribute spread (standard).

## Required rework

**Disclosure**

- Remove mandatory English product strings.
- Pass all visible text via props (or consumer i18n).
- Preserve / strengthen human-oversight and non-decision meaning in product copy.
- No tenant/auth/business logic.

**Index**

- Keep excluded until disclosure GO, **or**
- Split safe primitive exports from disclosure export.
- Do not approve barrel that exports unreworked disclosure.

## Future import candidate

**None** this wave. Future GO recommendation: **`NO-GO`**.

## Constraints compliance

| Constraint | Observed |
|------------|----------|
| No source modification | yes |
| No source staging / import | yes |
| No `git add .` / broad packages adds | yes |
| No package.json / lockfile / gitignore | yes |
| No install/build/browser run | yes |
| No external approval claims | yes |

## Final verdict

`CONFORA_REPO_HEALTH_21_AUDIT_ONLY_READY_FOR_REVIEW`
