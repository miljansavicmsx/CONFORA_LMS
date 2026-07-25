# CONFORA-REPO-HEALTH-37 — Localization Authenticity Review

## EN-clone check (SHA-256 identity vs EN)

| File | EN clone? |
|------|-----------|
| `bs/common.json` | **no** |
| `sr/common.json` | **no** |
| `sl/common.json` | **no** |
| `bs/dashboard.json` | **no** |
| `sr/dashboard.json` | **no** |

## Sample authenticity (RH36 F2–F5 targets)

| Locale / file | Sample |
|---------------|--------|
| bs/sr/hr `common.pagePreparing` | `"Stranica se priprema."` |
| sl `common` | `"Poskusi znova"` / `"Stran se pripravlja."` |
| bs/sr/hr `dashboard.isoRoleLabel` | `"Uloga (ISO/IEC 17024):"` |
| sl `dashboard.isoRoleLabel` | `"Vloga (ISO/IEC 17024):"` |
| bs/sr/hr `confirmationSection` | `"Ova potvrda nije ISO/IEC 17024 certifikat osobe."` |
| sl `confirmationSection` | `"To potrdilo ni ISO/IEC 17024 certifikat osebe."` |

## Language posture

| Locale | Assessment |
|--------|------------|
| en | English |
| bs | Bosnian Latin, ijekavian (`osvježi`, `dodijeljenih`) |
| hr | Croatian Latin (`sustav`, `trenutačno`, `financije`) |
| sr | Serbian Latin, ijekavian-aligned with package convention |
| sl | Slovenian (`Vloga`, `Osveži`, `potrdilo`) |

Product names / technical terms retained where appropriate: CONFORA (N/A in these strings), ISO/IEC 17024, CAPA, CPD, Nest API, Keycloak, AI Tutor, Standards Intelligence.

`localization_authenticity_rework_pass: true`
