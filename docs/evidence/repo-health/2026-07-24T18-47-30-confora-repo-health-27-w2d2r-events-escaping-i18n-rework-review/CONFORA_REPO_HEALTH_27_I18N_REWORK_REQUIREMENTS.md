# CONFORA-REPO-HEALTH-27 — i18n Rework Requirements

## Current defects

- Comment: “HR uses same string until copy is localized.”
- `loadBundledEmailTemplate` always sets `subjectTemplate` from `SUBJECT_EN`.
- Silent locale coerce to `en` without structured fallback metadata.
- Event-key catalog is correctly separate (already imported); subjects must not live as fake bilingual content.

## Mandatory

1. **No EN subject reused for all locales** unless explicitly marked as fallback (e.g. `fallbackFrom: 'en'`, `subjectLocalized: false` in returned metadata).
2. **HR/BHS content must not be a silent English clone** presented as localized.
3. **Locale fallback must be explicit and auditable** — return which locale was requested vs resolved; loggable fields for notification service audit.
4. **Subject/body localization separate from event-key catalog** — keep `event-keys.ts` free of copy; subjects in locale maps or caller-supplied overrides.
5. Prefer **caller-owned / product i18n** subjects for production; package defaults only if clearly demo/fallback-flagged.

## MJML (deferred)

- Replace or mark identical HR shells; do not claim bilingual until authentic.
- Remains deferred after events rework until template verification wave.
