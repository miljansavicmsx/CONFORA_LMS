# RB-02 — Directory-name consent withdrawal

Interim administrative procedure for OD-DIR-33. A certificate holder can ask the organization to withdraw public-directory consent for their name before a self-service screen exists. This runbook is the controlled path. It is not a production deployment. Production use remains unauthorized until an independent security review records a GO for a specific commit.

The withdrawal hides the holder name from signed-in directory search and from public verification. It does not change the certificate, its signature, its lifecycle, or its validity. The registry row and the original consent time stay. Nothing in this procedure is a direct database edit.

Issuance already rejects a person acting on their own prior act (`FOUR_EYES` in personnel issuance and in certification flow). This procedure follows that rule. The person who verifies identity and the person who executes the withdrawal are different people. No new role is added.

## Request

A system administrator (`STAFF_SYSADM`) records the request: the holder, the channel, and the time the organization received it. The body does not name a verifier. Channels are `EMAIL`, `POST`, `IN_PERSON`, and `TELEPHONE`. `receivedAt` cannot be in the future.

`POST /v1/staff/certificates/{credentialId}/directory-consent-requests`

## Identity check

A different staff member signs in with their own session and records the verification. The server sets the verifier to that authenticated user. It does not accept a verifier id typed by the executor.

At that moment the server requires all of the following:

- The caller is the authenticated user, and that user is active in the certificate's organization.
- The caller holds one of the existing staff roles: `STAFF_DIR`, `STAFF_SYSADM`, `STAFF_TRAINADM`, `STAFF_AUD`, or `STAFF_ROLEADM`. A candidate, a certified person, a committee role, or any other non-staff role is rejected.
- The caller is not the holder.
- A request for this certificate already exists.

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

Each refusal appends audit event `DIRECTORY_CONSENT_WITHDRAWAL_REQUESTED`, `DIRECTORY_CONSENT_VERIFIED`, or `DIRECTORY_CONSENT_WITHDRAWN` with outcome `DENIED`, after the business transaction has rolled back. A success appends the same event inside the transaction that records the step. The audit cites this runbook (`procedure` `RB-02`, `procedureRef`, and `procedureSection`), the method code, the verifier, the role held at verification, and `evidenceRef`. It does not store a document image, a document number, or a name.

After execution, signed-in name search and public verification omit the holder name. Public status stays `VALID` while the certificate is active.

## Local Preview on Windows 11

Start the stack with [RB-01](./RB-01-local-keycloak-start.md). Use the Windows 11 PowerShell section there. Do not run a second copy of PostgreSQL, Keycloak, the API, or Vite. Synthetic accounts only. Do not print `.secrets/local.env`, passwords, one-time codes, the session cookie, or the CSRF token, and do not put them in a screenshot or in this repository.

These commands use Windows PowerShell 5.1 syntax. They do not use `&&`. The JSON body is written to a file and sent with `curl.exe --data-binary "@body.json"`. The same file can be sent with `Invoke-RestMethod -ContentType`. This was checked as 5.1-compatible syntax. On a machine that only has PowerShell 7, the same statements still run. A real Windows PowerShell 5.1 host was not available in the authoring environment; see the pull request note for what was executed.

Local identities, already published as synthetic data:

- Holder: `exam-candidate`, user id `1c1c1c1c-1c1c-4c1c-8c1c-1c1c1c1c1c1c`
- Verifier: `exam-director` (`STAFF_DIR`), user id `18181818-1818-4181-8181-181818181818`
- Executor: `exam-admin` (`STAFF_SYSADM`), user id `16161616-1616-4161-8161-161616161616`

Sign in as `exam-candidate` at `http://localhost:3001/login`. Open the certificates page. In the browser developer tools, open `GET http://localhost:4000/v1/me/certificates` and copy `certificateId`. Copy the public verification link from the same page when you want to open the public check afterward. Sign out.

Sign in as `exam-admin`. In developer tools, Application, Cookies, `http://localhost:4000`, copy `confora_sid` for this shell only. The cookie is `HttpOnly`. From the repository root:

```powershell
$credentialId = Read-Host 'certificateId from the holder wallet'
$adminSid = Read-Host 'confora_sid for exam-admin'
$receivedAt = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fff') + 'Z'
$request = @{
  holderUserId = '1c1c1c1c-1c1c-4c1c-8c1c-1c1c1c1c1c1c'
  channel = 'EMAIL'
  receivedAt = $receivedAt
} | ConvertTo-Json -Compress
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText((Join-Path (Get-Location) 'body.json'), $request, $utf8)
$adminSession = curl.exe -s 'http://localhost:4000/v1/auth/session' -H "Cookie: confora_sid=$adminSid" | ConvertFrom-Json
curl.exe -s -D - -o - -X POST "http://localhost:4000/v1/staff/certificates/$credentialId/directory-consent-requests" -H 'Origin: http://localhost:3001' -H "Cookie: confora_sid=$adminSid" -H "X-CSRF-Token: $($adminSession.csrfToken)" -H 'Content-Type: application/json' --data-binary "@body.json"
```

The response has `"result":"REQUESTED"`. Sign out. Sign in as `exam-director` and copy that session's `confora_sid`.

```powershell
$utf8 = New-Object System.Text.UTF8Encoding $false
$directorSid = Read-Host 'confora_sid for exam-director'
$verification = @{
  verificationMethod = 'IN_PERSON_DOCUMENT_SIGHT'
  evidenceRef = 'RB02-SIGHTING-001'
} | ConvertTo-Json -Compress
[System.IO.File]::WriteAllText((Join-Path (Get-Location) 'body.json'), $verification, $utf8)
$directorSession = curl.exe -s 'http://localhost:4000/v1/auth/session' -H "Cookie: confora_sid=$directorSid" | ConvertFrom-Json
curl.exe -s -D - -o - -X POST "http://localhost:4000/v1/staff/certificates/$credentialId/directory-consent-verifications" -H 'Origin: http://localhost:3001' -H "Cookie: confora_sid=$directorSid" -H "X-CSRF-Token: $($directorSession.csrfToken)" -H 'Content-Type: application/json' --data-binary "@body.json"
```

The response has `"result":"VERIFIED"`, `"verifierRole":"STAFF_DIR"`, and the director's user id. Do not type that user id into the request. Sign in again as `exam-admin`.

```powershell
$utf8 = New-Object System.Text.UTF8Encoding $false
$adminSid = Read-Host 'confora_sid for exam-admin'
$adminSession = curl.exe -s 'http://localhost:4000/v1/auth/session' -H "Cookie: confora_sid=$adminSid" | ConvertFrom-Json
[System.IO.File]::WriteAllText((Join-Path (Get-Location) 'body.json'), '{}', $utf8)
curl.exe -s -D - -o - -X POST "http://localhost:4000/v1/staff/certificates/$credentialId/directory-consent-withdrawal" -H 'Origin: http://localhost:3001' -H "Cookie: confora_sid=$adminSid" -H "X-CSRF-Token: $($adminSession.csrfToken)" -H 'Content-Type: application/json' --data-binary "@body.json"
```

The first response has `"result":"WITHDRAWN"` and `"status":"VALID"`. Run the same `POST` again. The second response has `"result":"ALREADY_WITHDRAWN"` and the same `registryConsentRevokedAt`. The certificate row is still there.

The same file can be posted with `Invoke-RestMethod` if `curl.exe` is blocked. This form works on Windows PowerShell 5.1:

```powershell
$payload = [System.IO.File]::ReadAllText((Join-Path (Get-Location) 'body.json'))
$headers = @{
  Origin = 'http://localhost:3001'
  Cookie = "confora_sid=$adminSid"
  'X-CSRF-Token' = $adminSession.csrfToken
}
Invoke-RestMethod -Method Post -Uri "http://localhost:4000/v1/staff/certificates/$credentialId/directory-consent-withdrawal" -Headers $headers -ContentType 'application/json' -Body $payload
```

Confirm the name is hidden. Signed-in search, still as `exam-admin`:

```powershell
curl.exe -s 'http://localhost:4000/v1/public/certificates?name=Demo' -H "Cookie: confora_sid=$adminSid"
```

The holder name is absent. Public verification, with no cookie, uses the random token from the holder's verification link, not the sequential certificate number:

```powershell
$verifyToken = Read-Host 'token from the holder verification link'
curl.exe -s "http://localhost:4000/v1/public/certificates/$verifyToken"
```

`holderName` is null. `status` remains `VALID` while the certificate is active.

Clear the shell variables and the body file when you finish:

```powershell
Remove-Item -Force (Join-Path (Get-Location) 'body.json') -ErrorAction SilentlyContinue
Remove-Variable adminSid, directorSid, adminSession, directorSession, request, verification, payload, headers, credentialId, verifyToken, utf8, receivedAt -ErrorAction SilentlyContinue
```

Stop the preview with `scripts/local/stop.ps1` when you no longer need it.
