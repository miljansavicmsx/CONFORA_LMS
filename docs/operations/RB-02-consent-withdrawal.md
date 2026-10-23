# RB-02 — Directory-name consent withdrawal

Interim administrative procedure for OD-DIR-33 and OD-DIR-34. A certificate holder can ask the organization to withdraw public-directory consent for their name before a self-service screen exists. This runbook is the controlled path. It is not a production deployment. Production use remains unauthorized until an independent security review records a GO for a specific commit.

The withdrawal hides the holder name from signed-in directory search and from public verification. It does not change the certificate, its signature, its lifecycle, or its validity. The registry row and the original consent time stay. Nothing in this procedure is a direct database edit.

Issuance already rejects a person acting on their own prior act (`FOUR_EYES` in personnel issuance and in certification flow). This procedure follows that rule. The person who verifies identity and the person who executes the withdrawal are different people. No new role is added.

## Request

A system administrator (`STAFF_SYSADM`) records the request: the holder, the channel, and the time the organization received it. The body does not name a verifier. Channels are `EMAIL`, `POST`, `IN_PERSON`, and `TELEPHONE`. `receivedAt` cannot be in the future.

`POST /v1/staff/certificates/{credentialId}/directory-consent-requests`

## Identity check

A different staff member signs in with their own session and records the verification. The server sets the verifier to that authenticated user. It does not accept a verifier id typed by the executor.

At that moment the server requires all of the following:

- The caller is the authenticated user. Before the server reads the certificate or the request, it checks the staff role on that session. A caller who does not hold one of the staff roles below receives one 403, whether or not that certificate exists. The refusal audit for that 403 records the caller, the action `DIRECTORY_CONSENT_VERIFY`, the result, and the time. Repeating that denial on this server process does not append another row for the same caller and certificate.
- The caller holds one of the OD-DIR-34 verifier roles: `STAFF_DIR`, `STAFF_SYSADM`, or `STAFF_ROLEADM`. `STAFF_TRAINADM`, `STAFF_AUD`, a candidate, a certified person, the holder, and every other role are rejected with that same 403. Only `STAFF_SYSADM` may execute, and that person must not be the verifier. Two different `STAFF_SYSADM` users may verify and execute.
- Repeated unauthorized verification attempts from the same caller are rate-limited on this server process. The limit does not read the certificate, and the limited response is the same whether or not the certificate exists.
- When the caller does hold a staff role, the server then requires that the user is active in the certificate's organization, is not the holder, and that a request for this certificate already exists.

`STAFF_DIR` may verify and still must not execute. The role stored on the verification is the staff role the verifier holds on this session.

The body carries the method and an evidence reference. The reference is an internal file id, such as `RB02-SIGHTING-001`. It is not a document number, a name, an image, a password, or a one-time code. Do not copy or photograph an identity document.

Methods:

- `IN_PERSON_DOCUMENT_SIGHT` — the holder presented a government identity document in person. Look at it. Do not copy it.
- `VIDEO_DOCUMENT_SIGHT` — the same sighting on a live call. Do not store a recording or a still image.
- `KNOWN_ACCOUNT_CONFIRMATION` — the requester proved control of the holder account this organization already holds. Do not store a password, a one-time code, or a session token.

`POST /v1/staff/certificates/{credentialId}/directory-consent-verifications`

## Execution

A system administrator who is not the verifier executes the withdrawal. Without a recorded verification the server refuses. If the executor is the verifier, the server refuses with the existing four-eyes rule. The first success sets `registryConsentRevokedAt`. A repeat keeps that timestamp. Nothing is deleted.

`POST /v1/staff/certificates/{credentialId}/directory-consent-withdrawal`

The caller must be `STAFF_SYSADM` in the certificate's organization, with MFA. A missing organization is rejected. A certificate in another organization is not found, including when another organization's staff member tries to verify or execute. The caller cannot send an organization id.

A browser session cookie requires that session's `X-CSRF-Token` and an `Origin` in `OIDC_WEB_ORIGINS`.

Each refusal appends audit event `DIRECTORY_CONSENT_WITHDRAWAL_REQUESTED`, `DIRECTORY_CONSENT_VERIFIED`, or `DIRECTORY_CONSENT_WITHDRAWN` with outcome `DENIED`, after the business transaction has rolled back. All refusals omit the user-supplied evidence reference. That includes a staff caller who holds an allowed role, a missing request, the holder, and an executor who is the verifier. The refusal audit records the caller, the action, the result or reason code, the time, and the RB-02 references (`procedure`, `procedureRef`, and `procedureSection`). If that append fails, the server still returns the original refusal and logs the audit failure without personal data. A success appends the same event inside the transaction that records the step. A recorded verification cites the method code, the verifier, the role held at verification, and `evidenceRef`. The audit does not store a document image, a document number, or a name.

After execution, signed-in name search and public verification omit the holder name. Public status stays `VALID` while the certificate is active.

## Accepted development risks

These risks are accepted for this development preview only. This procedure does not implement a fix for either of them.

- The per-process rate limit and the per-process refusal deduplication need a shared control before production. Another process does not see those hits.
- A Keycloak role change stays valid until the access token expires. Token lifetime and revocation need an assessment before production.

## Local Preview on Windows 11

Start the stack with [RB-01](./RB-01-local-keycloak-start.md). Use the Windows 11 PowerShell section there. Do not run a second copy of PostgreSQL, Keycloak, the API, or Vite. Synthetic accounts only. Do not print `.secrets/local.env`, passwords, one-time codes, the session cookie, or the CSRF token, and do not put them in a screenshot or in this repository.

The local preview is [rb02-test.ps1](./rb02-test.ps1). Run it from the repository root in Windows PowerShell 5.1:

```powershell
powershell.exe -NoProfile -File .\docs\operations\rb02-test.ps1
```

The script is the whole procedure. Do not paste an older snippet that writes `body.json` into the repository or that puts `confora_sid` on a `curl.exe` command line.

It refuses any target other than `http://localhost:4000`. It reads `GET /v1/health` and aborts unless the status is ok. It then reads the published demo seed course `DIGCOMP-EDU` and `infra/keycloak/synthetic-users.json`. It aborts unless that catalog tenant is the demo organization and the seed course is readable. Each session must be the catalog user for that step, with an `@demo.confora.test` address.

JSON bodies are written under a unique directory in `$env:TEMP`, outside this repository, and removed in `finally`, including when a step fails. The session cookie is read with `Read-Host -AsSecureString`. The script converts it with `SecureStringToBSTR` only for the request and clears that buffer with `ZeroFreeBSTR`. It does not echo the cookie or the CSRF token, does not start a transcript, and does not print headers.

Sign in as `exam-candidate` at `http://localhost:3001/login` and copy `certificateId` from `GET http://localhost:4000/v1/me/certificates`. Copy the public verification token from the holder's verification link. Sign out. The script prompts for those two values, then for the `confora_sid` of `exam-admin`, then `exam-director`, then `exam-admin` again. It prints only `result`, `status`, and `verifierRole`.

The request result is `REQUESTED`. The verification result is `VERIFIED` with `verifierRole` `STAFF_DIR`. The first withdrawal result is `WITHDRAWN` and `status` `VALID`. The repeat result is `ALREADY_WITHDRAWN`. Signed-in search must not contain the holder name. Public verification, with no cookie, keeps `status` `VALID` and `holderName` null.

A Windows PowerShell 5.1 host was not available in the authoring environment. The script was checked as 5.1 syntax only. See the pull request note for what was executed.

Stop the preview with `scripts/local/stop.ps1` when you no longer need it.
