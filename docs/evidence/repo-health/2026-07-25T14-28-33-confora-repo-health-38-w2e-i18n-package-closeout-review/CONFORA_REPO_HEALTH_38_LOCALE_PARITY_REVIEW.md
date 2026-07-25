# CONFORA-REPO-HEALTH-38 — Locale Parity Review

## RH36 F1 closed

`navigation.items.appealsComplaints` present in **en, hr, bs, sr, sl**.

| Locale | Value |
|--------|-------|
| en | Appeals and complaints |
| hr / bs / sr | Žalbe i prigovori |
| sl | Žalbe in prigovori |

Canonical decision (RH37): key used by `frontend-app/.../sidebar-sections.tsx` → add to missing locales (not remove).

## Package tests

```text
Tests: 128 passed, 128 total
```

All namespace parity suites vs EN (including navigation) **PASS**.

`locale_completeness_pass: true` · `rh36_f1_f5_closed: true` (F1 portion)
