# ADR-001 frontend supersession plan

**Do not supersede ADR-001 in R0-1B2A.** This is a plan for R0-1B2 execution after owner decision.

## ADR-001 original decision (untracked candidate)

- Status: **Accepted** (2026-05-20)
- Framework: Next.js App Router; React; Tailwind; shadcn/ui; packages/ui; packages/i18n
- Primary location: pps/web/
- Legacy rontend-app/ and rontend-public/ described as **frozen** pending migration

## Repository facts contradicting ADR-001

| Fact | Class |
|------|-------|
| rontend-app is current operational canonical frontend (OQ-4, Baseline §0.2, Gap Note) | AD / VF |
| rontend-app uses Vite (package.json scripts) and has 108 tracked files | VF |
| pps/web and pps/admin exist locally with **0** tracked files | VF |
| Gap Note: Next parity **not** proven; migration not started under CLRC lock | VF (tracked doc) |
| ADR-001 claim that frontend-app is frozen is false for pilot reality | UC (C-05 / OQ-4) |

## Recommended instrument

**New superseding ADR** (e.g. ADR-008 or revised ADR-001 status → Superseded) rather than silent amendment-only, because the operational canonical surface changed.

Recommended decision wording (draft for owner approval):

> Next.js pps/web and pps/admin remain the **intended canonical** frontend targets. Until documented parity exit criteria are met, rontend-app (Vite + React) is the **operational canonical** frontend for the locked local release candidate. rontend-app may receive pilot maintenance only; new feature work that expands the Vite surface requires Architecture Board exception. ADR-001 (2026-05-20) is **superseded** with respect to "frontend-app is frozen" and "apps/web is current primary app". Target stack values (Next.js/Tailwind/shadcn) are **retained as intended direction**.

## Migration / exit criteria (from Gap Note — preserve)

1. Parity matrix of pilot routes → apps/web|admin  
2. E2E re-run against Next-only  
3. No F4-9 regression  
4. ADR supersession recorded  
5. Deprecation plan in TECH_DEBT  
6. Accessibility sample audit  
7. i18n sign-off  

## Consequences for future frontend development

- Do not claim apps/web|admin operational parity.  
- Do not grow Vite as strategic UI.  
- Do not delete frontend-app before exit criteria evidence.  

## Owner decision required

**OD-R01B2-2** — Approve supersession vs amend-only; approve draft wording.
