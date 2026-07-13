# SECURITY-DELEGATE-SIGNOFF-1 — MFA Decision Brief

**Purpose:** Inform security delegate decision on staff MFA technical readiness for pilot gating.  
**This document does not approve external pilot.**

---

## 1. Backend MFA guard — in place

- Global `MfaGuard` enforces `MFA_MANDATORY_ROLES` on protected API routes.
- Canonical signal: `deriveMfaVerified()` — `mfa_verified: true` **or** `amr` includes `otp`/`totp`/`mfa`.
- Evidence: STAFF-MFA-3 closure + unit tests (`mfa.guard.spec.ts`, `auth.mfa.spec.ts`).

**Verdict basis:** `STAFF_MFA_3_GO_PENDING_SECURITY_DELEGATE_SIGNOFF`

---

## 2. Staff without MFA — denied

| Probe | Result |
|-------|--------|
| External user `pilot.staff.mfa.external@confora.test` (no smoke bypass, no OTP) | Login succeeds; **all staff routes 403** |
| Reports overview, export, identity queue, cert applications | **403** |

Evidence: `2026-07-13T14-24-16-staff-mfa-3-enforcement-closure/mfa-proof/route-probes.json`

---

## 3. Learner — cannot access staff routes

| Probe | Result |
|-------|--------|
| `pilot.learner@confora.test` → `/v1/staff/reports/overview` | **403** — insufficient role |

Learner login and learner acceptance flows unaffected.

---

## 4. Smoke bypass — explicit, local/synthetic only

| Mechanism | Scope |
|-----------|--------|
| Keycloak attribute `pilot_smoke_mfa_verified=true` | Designated CLRC smoke users only (`pilot.staff`, `pilot.manager`, `pilot.director`) |
| Maps to JWT `mfa_verified: true` | **LOCAL pilot smoke / acceptance only** |
| External candidate user | Attribute **absent** — cannot bypass MFA guard |

Separation verified: `smoke_bypass_separation_status: DOCUMENTED_AND_VERIFIED`

---

## 5. Real OTP / direct-grant `amr` — partial (Keycloak 26)

| Item | Status |
|------|--------|
| Admin partialImport OTP credential | Created |
| Password-only grant on enrolled user | **Blocked** |
| Direct grant + TOTP → `amr: otp` | **Not automated** (Keycloak 26 limitation) |
| Nest `/auth/mfa/verify` route proof | **Partial** — `mfa_route_proof_user: null` |

This is a **test-evidence gap**, not an auth bypass. Interactive CONFIGURE_TOTP required for full `amr` proof.

---

## 6. Manual TOTP enrollment — required

Before external-facing staff operate without smoke bypass:

1. Remove `pilot_smoke_mfa_verified` if present.
2. Complete CONFIGURE_TOTP in Keycloak Account Console.
3. Verify OTP prompt on login.
4. Confirm staff routes return **200** with MFA-complete token.

Checklist: STAFF-MFA-3 `STAFF_MFA_3_USER_ENROLLMENT_PROCEDURE.md`

**Current count:** 0 external-pilot MFA-ready users with real OTP (STAFF-MFA-3 user matrix).

---

## 7. Security delegate decision question

> Is the current MFA evidence sufficient to clear the **technical MFA gate** for:
>
> - **(A)** Local / internal pilot continuation with documented smoke bypass?  
> - **(B)** External pilot readiness — **only after** manual TOTP enrollment + DPO/legal?

Recommended technical posture (from STAFF-MFA-3):

- **(A)** Evidence supports conditional clearance with smoke bypass documented.  
- **(B)** **Not cleared** until manual enrollment + separate DPO/legal gate.

---

## 8. Explicit non-approvals

| Claim | Status |
|-------|--------|
| External pilot approved | **NO** |
| Production ready | **NO** |
| Staging validated | **NO** (not evidenced here) |
| DPO/legal approved | **NO** |
| Security delegate signed | **NO** — template only |

---

## Related commits (branch context)

- `478c399` — fix(staff-mfa-3): separate mfa invariants from browser regression guard  
- `e88998f` — test(staff-mfa-3): confirm local baseline after mfa gate remediation  
