# CONFORA-REPO-HEALTH-19 — Minimal first import candidate

**Not imported in this task.** Candidate only for a future approved import wave after findings review.

## Minimal set (4 paths)

Excludes `ai-disclosure.tsx` and barrel `index.ts` until i18n rework / export split.

```
packages/ui/tokens.ts
packages/ui/src/button.tsx
packages/ui/src/skip-to-main-link.tsx
packages/ui/src/styles.css
```

## Why this set

| Include | Why |
|---------|-----|
| `tokens.ts` | No copy; design data only |
| `button.tsx` | Presentational; no hardcoded product strings |
| `skip-to-main-link.tsx` | A11y primitive; label overridable |
| `styles.css` | Required Tailwind entry for package CSS pipeline |

| Exclude | Why |
|---------|-----|
| `ai-disclosure.tsx` | REWORK_REQUIRED — hardcoded English |
| `index.ts` | Re-exports disclosure; incomplete without rework |

## Rules for any future import task

1. Explicit path `git add` only — never `git add packages/ui/`
2. Do not modify package.json / lockfile in the same wave unless separately approved
3. Prefer fixing disclosure i18n before importing full barrel
4. Separate approval still required (import remains NO-GO until then)
