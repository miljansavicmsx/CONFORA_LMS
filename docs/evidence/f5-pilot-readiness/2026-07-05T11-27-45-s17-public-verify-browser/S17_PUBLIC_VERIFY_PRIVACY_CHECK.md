# S17 Public Verification Privacy Check

## Forbidden field exposure (browser + API)

| Field | Exposed | Evidence |
|-------|---------|----------|
| JMBG | false | API key scan + Playwright panel text scan |
| Date of birth | false | Not in public verify response |
| Email | false | Not in public verify response |
| Phone | false | Not in public verify response |
| Address | false | Not in public verify response |
| Identity evidence | false | No identity document fields |
| Private learner dashboard data | false | Public route only; admin denied in Playwright |
| Application internal notes | false | Not in response |
| Reviewer notes | false | Not in response |
| Committee votes | false | Not in response |
| Audit payloads | false | Not in response |
| Raw storage paths | false | `pdfStorageKey` absent from public verify |

## Valid API response (allowed public fields only)

Keys observed: `valid`, `verified`, `validityState`, `lifecycleStatus`, `certificateNumber`, `certId`, `schemeTitle`, `candidateDisplayName`, `fullName`, `courseTitle`, `issuedAt`, `validFrom`, `validUntil`, `issuingCertificationBody`, `verificationHash`, `verificationReference`, `verificationTimestamp`, `documentAvailable`, `certificateKind`, `credentialTypeLabel`, `schemeVersion`, `effectiveStatus`, `certificateStatus`, `currentlyValid`, `verificationResult`, `candidateReference`, `expiryDate`.

`fullName` / `candidateDisplayName` = public holder label only (pilot consent display name); no national ID, email, or dossier.

## Invalid lookup safety

- Browser: `verify-not-found-state` visible; no stack trace or internal enum strings
- API: safe NOT_FOUND shape; no private keys

## Public verification audit

Nest verify module uses salted/redacted audit for public lookups (`VERIFY_AUDIT_IP_SALT`). No raw token/JWT/password/client secret logged during this sign-off. Audit is sampled — full audit table review not in S17 scope.

## Read-only confirmation

Playwright S17 spec monitored network: no POST/PATCH/DELETE to non-public endpoints during valid verify page load. No certificate issuance or lifecycle mutation triggered.
