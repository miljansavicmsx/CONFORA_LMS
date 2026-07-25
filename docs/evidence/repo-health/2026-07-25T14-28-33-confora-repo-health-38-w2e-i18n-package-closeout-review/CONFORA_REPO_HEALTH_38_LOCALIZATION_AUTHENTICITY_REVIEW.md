# CONFORA-REPO-HEALTH-38 — Localization Authenticity Review

## F2–F5 closed (post-`dbb50fe9`)

| Check | Result |
|-------|--------|
| `common.{bs,sl,sr}` EN clone | **false** |
| `dashboard.{bs,sr}` EN clone | **false** |
| `common.hr` `pagePreparing` | `"Stranica se priprema."` |
| `candidatePortal` `confirmationSection` bs/sl | localized (not English) |
| dashboard `isoRoleLabel` / CAPA idle titles | localized |

## F6 / F7 (acceptable-with-note)

| Item | Status |
|------|--------|
| F6 shell badge `"ISO 17024 Certified Platform"` | still present (brand string) — **non-blocking** |
| F7 `shell.bs` ≡ `shell.sr` | still true — **non-blocking** |

`localization_authenticity_pass: true` · `rh36_f6_f7_acceptable_with_note: true`
