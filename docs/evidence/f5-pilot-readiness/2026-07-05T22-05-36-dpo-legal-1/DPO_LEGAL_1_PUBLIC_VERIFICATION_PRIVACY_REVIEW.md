# DPO-LEGAL-1 Public Verification Privacy Review

**Source evidence:** `docs/evidence/f5-pilot-readiness/2026-07-05T11-27-45-s17-public-verify-browser/` — verdict `S17_PUBLIC_VERIFY_BROWSER_GO_CONFIRMED`

## Intended behavior

| Check | Status |
|-------|--------|
| No-auth public verification intended | **Yes** |
| Read-only (no mutations) | **Confirmed** (Playwright network monitor) |
| Valid lookup | **PASS** |
| Invalid lookup safe NOT_FOUND | **PASS** |

## Forbidden fields — not exposed

| Field | Exposed |
|-------|---------|
| JMBG / national ID | **No** |
| Date of birth | **No** |
| Email | **No** |
| Phone / address | **No** |
| Identity evidence | **No** |
| Learner dashboard data | **No** |
| Reviewer notes | **No** |
| Committee votes | **No** |
| Audit payloads | **No** |
| Raw storage paths | **No** |

## Public fields — classification

| Field | Classification | Notes |
|-------|----------------|-------|
| `valid`, `verified`, `verificationResult`, `validityState` | APPROPRIATE_FOR_PUBLIC_VERIFY | Status indicators |
| `certificateNumber`, `certId`, `verificationHash`, `verificationReference` | APPROPRIATE_FOR_PUBLIC_VERIFY | Verification identifiers |
| `schemeTitle`, `schemeVersion`, `courseTitle`, `credentialTypeLabel` | APPROPRIATE_FOR_PUBLIC_VERIFY | Scheme context |
| `lifecycleStatus`, `certificateStatus`, `effectiveStatus`, `currentlyValid` | APPROPRIATE_FOR_PUBLIC_VERIFY | Validity |
| `issuedAt`, `validFrom`, `validUntil`, `expiryDate`, `verificationTimestamp` | APPROPRIATE_FOR_PUBLIC_VERIFY | Dates |
| `issuingCertificationBody`, `documentAvailable`, `certificateKind` | APPROPRIATE_FOR_PUBLIC_VERIFY | Issuer metadata |
| `fullName` / `candidateDisplayName` | **NEEDS_DPO_REVIEW** | Consent-gated (`publicCertDisplayNameConsent`); withheld as `candidateReference: WITHHELD` when false |
| `candidateReference` | APPROPRIATE_FOR_PUBLIC_VERIFY | Opaque or WITHHELD |

## DPO/legal questions

1. Approve consent model for public display name on verification portal.
2. Confirm revoked/suspended certificate public messaging.
3. Confirm verification audit retention (salted IP) and lawful basis.

**No legal approval claimed in this package.**
