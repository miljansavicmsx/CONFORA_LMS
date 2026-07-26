# Frontend Canonicalization Gap Note

**Document ID:** CON-GOV-FCG-001  
**Status:** CANONICAL (synced F6-LOCAL-2)  
**Owner:** Architecture + Frontend  
**Source:** `docs/evidence/f6-local-stabilization/2026-06-18T15-16-10/FRONTEND_CANONICALIZATION_GAP_NOTE.md`

**Non-claim:** Baseline §4.1 **full frontend alignment is not proven** while `frontend-app` remains the primary pilot UI.

---

## Current `frontend-app` status

| Attribute | Value |
|-----------|-------|
| Stack | Vite + React |
| Role | **Active pilot learner UI** (CLRC-2026-06) |
| API target | Nest `http://127.0.0.1:4000` (RB-01) |
| F5 proof | S-01–S-20 E2E via this UI |
| Baseline alignment | **Drift** — Baseline §4.1 specifies Next.js 14+ `apps/web` |

`frontend-app` is **operational truth** for the locked local release candidate. It is technical debt (TD-F6-01, TD-F6-14), not deprecated for pilot.

---

## `apps/web` and `apps/admin` target state

| App | Baseline intent | Current status |
|-----|-----------------|----------------|
| `apps/web` | Canonical learner Next.js 14+ | Exists; **not** sole pilot UI |
| `apps/admin` | Canonical staff/admin portal | Exists; staff flows via **Nest API smokes**, not full admin Next E2E |

**Target:** Both become canonical UIs before production UI consolidation claim.

---

## What F4 / F5 frontend gates proved

| Gate | Proved |
|------|--------|
| F4-9 module smokes | API contracts, RBAC, tenant, audit for pilot modules |
| F5 E2E S-01–S-20 | End-to-end flows via `frontend-app` + Nest |
| F5-3 security | Tenant isolation, auth modes |
| F5-5 GDPR/audit | Local pilot posture (hCaptcha caveat SEC-12) |
| F5 C-01–C-11 | Mandatory checklist 11/11 PASS |
| Public verify | `frontend-public` + Nest verification API |

---

## What F4 / F5 did not prove

| Gap | Impact |
|-----|--------|
| Next.js `apps/web` parity with `frontend-app` | Cannot claim baseline §4.1 full alignment |
| `apps/admin` full UI E2E | Admin UX consolidation unproven |
| WCAG 2.2 AA | BL-14-02 NOT_PROVEN (TD-F6-19) |
| i18n bs-BA / en-US full coverage | BL-14-01 NOT_PROVEN (TD-F6-18) |
| Production CDN / SSR deployment | Cloud deferral (CD-14) |
| Single UI codebase for learner + admin | Architecture drift |

---

## Migration criteria before claiming canonical frontend alignment

1. **Parity matrix** — every `frontend-app` pilot route → `apps/web` or `apps/admin`
2. **E2E re-run** — F5 S-01–S-20 (or successor) against Next.js apps only
3. **F4-9** — no regression; update smoke env if UI-origin checks exist
4. **ADR-001** — amendment documenting canonical apps
5. **Deprecation plan** — `frontend-app` sunset in `TECH_DEBT.md`
6. **Accessibility** — CAP-12 sample audit PASS (TD-F6-19)
7. **i18n** — CAP-13 sign-off (TD-F6-18)

**Target phase:** Pre-production UI consolidation.  
**CLRC lock:** Migration **not started**; gap **governed**.

**Related:** `LOCAL_RELEASE_CANDIDATE_LOCK.md`, `TECH_DEBT.md` (TD-F6-01, TD-F6-14)
