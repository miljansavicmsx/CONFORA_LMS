# S17 Public Verification Browser Results

| Check | Status | Detail |
|-------|--------|--------|
| Frontend :3001 | PASS | reachable=true |
| Public /verify no auth | PASS | HTTP 200 without session |
| API health | PASS | http://127.0.0.1:4000/health |
| Valid lookup (API) | PASS | hash=`cedf36de04cb8d9866451349199e9861a4641c31bb48ea78c65cdf1eae6a7945` |
| Invalid lookup (API) | PASS | safe NOT_FOUND expected |
| Playwright public-ux-1 | PASS | exit=0 |
| S17 screenshots | PASS | 3 files |
| ops:public-ux-1r3 | FAIL | exit=1 |
| ops:cert-ops-1r | FAIL | exit=1 |

## Valid API body keys

`valid, verificationResult, certificateKind, fullName, courseTitle, expiryDate, certId, effectiveStatus, credentialTypeLabel, schemeVersion, verified, certificateNumber, certificateStatus, lifecycleStatus, currentlyValid, validityState, schemeTitle, schemeReference, issuedAt, validFrom, validUntil, issuingCertificationBody, verificationReference, documentAvailable, verificationTimestamp, candidateReference, verificationHash, candidateDisplayName, verificationUrl`

## Invalid API body

```json
{
  "valid": false,
  "verified": false,
  "validityState": "NOT_FOUND",
  "lifecycleStatus": "NOT_FOUND",
  "currentlyValid": false,
  "verificationTimestamp": "2026-07-15T12:27:16.923Z"
}
```
