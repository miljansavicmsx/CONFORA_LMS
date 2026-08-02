# Implementation options

## Plan A — Minimal static recovery

Recover install + static/contrast only. Short runtime. Weak evidence for browser a11y.

## Plan B — Browser-first recovery

Track lockfile; build/preview frontend-app; minimal axe; strip FastAPI/web/admin.
Medium runtime. Stronger automated evidence.

## Plan C — Staged recovery (RECOMMENDED)

1. Deterministic standalone install
2. Static checks (contrast Option B/D)
3. Browser axe on vite preview (frontend-app only)
4. Report artifacts
5. Optional PR comment

Highest evidence quality with explicit non-claims per stage. Owner selects.
