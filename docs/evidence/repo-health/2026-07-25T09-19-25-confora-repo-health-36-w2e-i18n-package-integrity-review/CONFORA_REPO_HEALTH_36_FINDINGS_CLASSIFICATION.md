# CONFORA-REPO-HEALTH-36 — Findings Classification

| # | Finding | Class |
|---|---------|-------|
| F1 | `navigation.{bs,sr,sl}` extra key `items.appealsComplaints` not in EN → 3 jest parity failures | **REWORK_REQUIRED** |
| F2 | `common.{bs,sl,sr}` full EN clone | **REWORK_REQUIRED** |
| F3 | `common.hr` `pagePreparing` EN residual | **REWORK_REQUIRED** |
| F4 | `dashboard.{bs,sr}` full EN clone + all-locale English residuals (`isoRoleLabel`, `qualityManagerTitle`) | **REWORK_REQUIRED** |
| F5 | `candidatePortal.{bs,sl,sr}` `confirmationSection` governance notice in English | **REWORK_REQUIRED** (semantically correct; localization gap) |
| F6 | `shell.{en,bs,hr,sr}` `badge` untranslated brand string | **ACCEPTABLE_WITH_NOTE** |
| F7 | `shell.bs` ≡ `shell.sr` identical | **ACCEPTABLE_WITH_NOTE** |
| S1 | Source files (create-i18n, index, keys, react, resources) | **PASS** |
| S2 | Secrets / URLs / network | **PASS** (0) |
| S3 | PII / tenant | **PASS** (0) |
| S4 | Workflow boundaries | **PASS** (0 blocking) |
| S5 | Typecheck | **PASS** |
| S6 | Large/compiled/generated tracked | **PASS** (none) |

## Roll-up

- **BLOCKING (security/governance):** 0
- **REWORK_REQUIRED:** 5 (F1–F5; F1 breaks package test)
- **DEFER:** 0
- **ACCEPTABLE_WITH_NOTE:** 2 (F6, F7)
- **PASS:** source, secrets, PII, workflow, typecheck, artifacts

## Overall posture

`packages/i18n` is **security- and governance-safe** and source-clean, but **not internally consistent** (own parity test fails) and localization is **incomplete** for several namespaces. Integrity = **CONDITIONAL** — safe to leave tracked, but should not be considered "localization-complete/closed" until F1–F5 rework.
