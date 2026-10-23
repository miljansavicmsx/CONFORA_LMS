# RB-02 — Directory-name consent withdrawal

Interim administrative procedure for OD-DIR-33. A certificate holder can ask the organization to withdraw public-directory consent for their name before a self-service screen exists. This runbook is the controlled path. It is not a production deployment. Production use remains unauthorized until an independent security review records a GO for a specific commit.

The withdrawal hides the holder name from signed-in directory search and from public verification. It does not change the certificate, its signature, its lifecycle, or its validity. The registry row and the original consent time stay. Nothing in this procedure is a direct database edit.

## Who does what

1. The holder submits a request. Record the holder, the channel, and the time the organization received it.
2. A person in the same organization verifies the requester's identity and records who did it and which method was used.
3. A system administrator (`STAFF_SYSADM`) executes the withdrawal. That is an existing role. This procedure does not add a role. `STAFF_DIR` monitors and does not execute this step. `COM_CERT` does not execute it, because this is not a certification decision. `STAFF_SYSADM` still has no item-bank access and cannot change a certification outcome (OD-PP-18, Baseline §7.5).

The verifier and the executor may be the same administrator for this interim procedure. Both identities are stored.

## Identity check

Do the check before execution. Record only the method:

- `IN_PERSON_DOCUMENT_SIGHT` — the holder presented a government identity document in person. Look at it. Do not copy it, photograph it, or write down the document number.
- `VIDEO_DOCUMENT_SIGHT` — the same sighting on a live call. Do not store a recording or a still image.
- `KNOWN_ACCOUNT_CONFIRMATION` — the requester proved control of the holder account this organization already holds, for example by a signed-in session of that account. Do not store a password, a one-time code, or a session token.

Channels are `EMAIL`, `POST`, `IN_PERSON`, and `TELEPHONE`. Do not put a document number, an image, a password, or a one-time code in the request. The API rejects any other field.

`receivedAt` is when the organization received the request. It cannot be in the future.

## What the server enforces

`POST /v1/staff/certificates/{credentialId}/directory-consent-withdrawal`

- The caller must be `STAFF_SYSADM` in the certificate's organization, with MFA. Any other role is rejected. A missing organization claim is rejected before the handler. A certificate in another organization is not found. The caller cannot send an organization id.
- A browser session cookie requires that session's `X-CSRF-Token` and an `Origin` in `OIDC_WEB_ORIGINS`. A bearer call with no session cookie does not use that cookie control.
- The first successful call sets `registryConsentRevokedAt` and appends audit event `DIRECTORY_CONSENT_WITHDRAWN`. A repeat call keeps the first timestamp, appends another audit row with result `ALREADY_WITHDRAWN`, and does not delete the certificate, the registry row, or the first audit row.
- The audit row records the holder, channel, received time, verifier, verification method, executor, execution time, and result. It is append-only.

Afterward, signed-in name search and public verification omit the holder name. Public status stays `VALID` while the certificate is active.

## Local Preview on Windows 11

Start the stack with [RB-01](./RB-01-local-keycloak-start.md). Use the Windows 11 PowerShell section there. Do not run a second copy of PostgreSQL, Keycloak, the API, or Vite. Synthetic accounts only. Do not print `.secrets/local.env`, passwords, one-time codes, the session cookie, or the CSRF token, and do not put them in a screenshot or in this repository.

Local identities, already published as synthetic data:

- Holder: `exam-candidate`, user id `1c1c1c1c-1c1c-4c1c-8c1c-1c1c1c1c1c1c`
- Administrator and, for this preview, the verifier: `exam-admin` (`STAFF_SYSADM`), user id `16161616-1616-4161-8161-161616161616`

Sign in as `exam-candidate` at `http://localhost:3001/login`. Open the certificates page. In the browser developer tools, open `GET http://localhost:4000/v1/me/certificates` and copy `certificateId`. Copy the public verification link from the same page when you want to open the public check afterward. Sign out.

Sign in as `exam-admin`. In developer tools, Application → Cookies → `http://localhost:4000`, copy `confora_sid` for this shell only. The cookie is `HttpOnly`. From the repository root:

```powershell
$credentialId = Read-Host 'certificateId from the holder wallet'
$sid = Read-Host 'confora_sid for exam-admin'
$receivedAt = (Get-Date).ToUniversalTime().AddMinutes(-10).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
$body = @{
  holderUserId = '1c1c1c1c-1c1c-4c1c-8c1c-1c1c1c1c1c1c'
  channel = 'EMAIL'
  receivedAt = $receivedAt
  verifierUserId = '16161616-1616-4161-8161-161616161616'
  verificationMethod = 'IN_PERSON_DOCUMENT_SIGHT'
} | ConvertTo-Json -Compress
$csrf = curl.exe -s 'http://localhost:4000/v1/auth/session' -H "Cookie: confora_sid=$sid" | ConvertFrom-Json
curl.exe -s -D - -o - -X POST "http://localhost:4000/v1/staff/certificates/$credentialId/directory-consent-withdrawal" `
  -H 'Origin: http://localhost:3001' `
  -H "Cookie: confora_sid=$sid" `
  -H "X-CSRF-Token: $($csrf.csrfToken)" `
  -H 'Content-Type: application/json' `
  --data $body
```

`curl.exe` is the Windows 11 client. It sends the cookie header you provide. A first response has `"result":"WITHDRAWN"` and `"status":"VALID"`. Run the same `POST` again. The second response has `"result":"ALREADY_WITHDRAWN"` and the same `registryConsentRevokedAt`. The certificate row is still there.

Confirm the name is hidden. Signed-in search, still as `exam-admin`:

```powershell
curl.exe -s 'http://localhost:4000/v1/public/certificates?name=Demo' -H "Cookie: confora_sid=$sid"
```

The holder name is absent. Public verification, with no cookie, uses the random token from the holder's verification link, not the sequential certificate number:

```powershell
$verifyToken = Read-Host 'token from the holder verification link'
curl.exe -s "http://localhost:4000/v1/public/certificates/$verifyToken"
```

`holderName` is null. `status` remains `VALID` while the certificate is active.

Clear the shell variables when you finish:

```powershell
Remove-Variable sid, csrf, body, credentialId, verifyToken -ErrorAction SilentlyContinue
```

Stop the preview with `scripts/local/stop.ps1` when you no longer need it.
