# A-01 — Manual TOTP Enrollment Procedure

**Task:** A01_MANUAL_TOTP_ENROLLMENT_CLOSURE  
**Audience:** Security + IT/IdP operators  
**Scope:** External-facing or external-candidate privileged staff — **not** secret commit

**Do not** commit TOTP secrets, QR codes, otpauth URLs, recovery codes, passwords, tokens, cookies, or screenshots containing secret material.

---

## Current environment (this host)

| Item | Value |
|------|-------|
| Keycloak base (live) | `http://localhost:8081` |
| Realm | `confora` |
| Account console | `http://localhost:8081/realms/confora/account` |
| Admin console | `http://localhost:8081/admin` |
| API (when up) | `http://localhost:4000` |
| Align scripts | Set `KEYCLOAK_BASE_URL=http://localhost:8081` before ops scripts |

---

## Path A — Recreate dedicated MFA users (recommended first)

Used when `pilot.mfa.staff@` / `pilot.staff.mfa.external@` are **MISSING** (current state).

### A1. Ensure MFA dedicated users exist (ops)

```text
# From repo root — use live Keycloak URL
set KEYCLOAK_BASE_URL=http://localhost:8081
node scripts/ops/keycloak-mfa-readiness.mjs --evidence-dir docs/evidence/external-pilot-technical-readiness/<timestamp>-a01-mfa-seed/
```

This restores realm OTP policy baseline and the dedicated MFA test user. Confirm afterward via Admin API or console that users exist and have **no** `pilot_smoke_mfa_verified`.

Optional: restore external denial user if not created by readiness script (create manually in Admin Console with COM_CERT, no smoke attribute).

### A2. Assign OTP required action (admin)

1. Open Admin Console → Realm `confora` → Users.  
2. Select target user (e.g. `pilot.mfa.staff@confora.test`).  
3. **Details → Required user actions** → add **Configure OTP**.  
4. Save.  
5. Confirm user has **no** attribute `pilot_smoke_mfa_verified`.

### A3. Staff enrolls TOTP (authenticator app)

1. User opens Account Console: `http://localhost:8081/realms/confora/account` **or** signs in via app login until CONFIGURE_TOTP is presented.  
2. Scan QR / enter secret into authenticator app (**do not screenshot into evidence**).  
3. Enter one-time code to confirm.  
4. Log out completely.

### A4. Verify OTP credential exists (safe evidence)

Using Admin API (credential IDs redacted) or Admin Console → Credentials:

- Credential **type** = `otp` (or `otp`/`totp` provider) — **required**.  
- Record: email, `has_otp=true`, createdDate (UTC), userLabel if any.  
- **Do not** export secret/value fields.

### A5. Verify login challenge

1. Log in again with password.  
2. OTP challenge must appear (browser conditional OTP when OTP configured).  
3. Evidence: note “OTP challenge presented: YES/NO” — no codes.

### A6. Remove / avoid smoke bypass on external-facing accounts

| Account type | Rule |
|--------------|------|
| External-facing / external candidate | **Must NOT** have `pilot_smoke_mfa_verified=true` |
| Local CLRC smoke staff | May keep smoke bypass; mark LOCAL_SMOKE_ONLY; not external ready |

Admin Console → User → Attributes → delete `pilot_smoke_mfa_verified` for external-facing users.

---

## Path B — Convert local smoke staff to external-facing MFA

Applies to `pilot.manager@`, `pilot.staff@`, `pilot.director@` **only if** governance designates them for external pilot (otherwise leave LOCAL_SMOKE_ONLY).

1. Document designation decision in evidence note.  
2. Remove `pilot_smoke_mfa_verified`.  
3. Assign **Configure OTP** required action.  
4. Complete Path A steps A3–A5.  
5. Confirm API staff routes require MFA-complete token (Path C).

---

## Path C — API / route proof (when Nest API is up)

1. Start API with pilot env (`npm run dev:api:pilot` or project standard).  
2. Re-run:

```text
set KEYCLOAK_BASE_URL=http://localhost:8081
npm run ops:staff-mfa-3-enforcement-closure
```

3. Expected:

| Probe | Expected |
|-------|----------|
| Staff **without** OTP / without MFA claim on staff route | **403** |
| Staff with smoke bypass (local only) | May pass MFA claim via attribute — **local only** |
| Staff with real OTP + MFA-complete token | Staff route **200** (if role permits) |

4. If Keycloak 26 direct-grant cannot emit `amr=otp` automatically: document limitation; rely on OTP credential presence + browser enrollment + security delegate review. **Do not fake `amr`.**

---

## Path D — Capture evidence without secrets

Safe to commit:

- User register with OTP yes/no  
- Redacted credential metadata JSON  
- HTTP status codes from probes  
- Boolean claim summaries (`mfa_verified`, `amr_includes_otp`) — **not** raw JWTs  

Never commit:

- TOTP secrets, QR images, otpauth URIs  
- Recovery codes  
- Passwords, admin passwords  
- Access/refresh tokens, cookies  

---

## Path E — Rerun after enrollment

1. Re-run A-01 live inspection (credential presence inventory).  
2. Re-run `ops:staff-mfa-3-enforcement-closure`.  
3. If STAFF-MFA-3 behavior/scripts changed: run `npm run ops:local-pilot-sequential-regression` (TD-085).  
4. Update A-01 `summary.json` counts and verdict.  
5. Hand package to security delegate (**A-02**).

---

## Success criteria for A-01 GO

- Every **external-facing** named account either:
  - has real OTP credential **and** no smoke bypass, **or**
  - is explicitly documented as local-only and **removed** from external-facing cohort by governance  
- Dedicated external denial user exists without MFA if still used for 403 proof  
- Secrets never committed  
- Security delegate review still required (A-02) — A-01 GO does **not** approve external pilot
