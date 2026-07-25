# CONFORA-REPO-HEALTH-36 — Localization Authenticity Review

Evidence combines SHA-256 identity (EN clone detection) and content inspection.

## Genuinely localized (good)

- `certificationStaff.{bs,hr,sr,sl}` — fully translated (HR verified: "Dodjela recenzenta", "segregacije dužnosti ili sukoba interesa").
- `candidatePortal.hr` — fully translated incl. governance notices.
- `auth`, `a11y` — all locales distinct hashes; translated.
- `navigation.{bs,hr,sr,sl}` — translated (žalbe/prigovori distinct); but bs/sr/sl have an extra key (see parity review).

## Findings (7)

| # | File(s) | Finding | Class |
|---|---------|---------|-------|
| 1 | `common.{bs,sl,sr}` | Byte-identical to `en` — **full EN clone** (retry/refresh/loading English) | REWORK_REQUIRED |
| 2 | `common.hr` | Translated actions but `placeholder.pagePreparing` left as English "Page is being prepared." | REWORK_REQUIRED |
| 3 | `dashboard.{bs,sr}` | Byte-identical to `en` — **full EN clone** | REWORK_REQUIRED |
| 4 | `dashboard.*` (all incl hr/sl) | English residuals: `isoRoleLabel` "Role (ISO/IEC 17024):", `qualityManagerTitle` "No open CAPA/risks for your tenant." | REWORK_REQUIRED |
| 5 | `candidatePortal.{bs,sl,sr}` | Governance notice `notices.confirmationSection` left in English ("This confirmation is not an ISO/IEC 17024 person certificate.") while HR is translated | REWORK_REQUIRED |
| 6 | `shell.{en,bs,hr,sr}` | `badge` "ISO 17024 Certified Platform" untranslated (sl translated) | ACCEPTABLE_WITH_NOTE (brand string) |
| 7 | `shell.bs` ≡ `shell.sr` | bs and sr shell byte-identical to each other | ACCEPTABLE_WITH_NOTE (bs/sr near-identical languages) |

`localization_authenticity_findings_count: 7`

## Important note

The EN residuals in finding #5 are **semantically correct English** governance disclaimers — meaning is preserved, so they do **not** violate workflow boundaries. They are localization-quality gaps (bs/sl/sr users see English for that line), not governance falsification. No silent "EN-labelled-as-HR" (HR is genuinely translated for the critical certification namespaces).
