# TD-070-F1 Translation Coverage

## Namespaces

| Namespace | Locales | F1 status |
|-----------|---------|-----------|
| `a11y` | en, bs, sr, hr, sl | Complete (+ fixed key contract) |
| `auth` | en, bs, sr, hr, sl | **New** — login shell |
| `shell` | en, bs, sr, hr, sl | **New** — language switcher labels |
| `candidatePortal` | en, bs, sr, hr, sl | Extended `statusLabels` |
| `certificationStaff` | en, bs, sr, hr, sl | **sl added** (parity with en) |

## Parity validation

`packages/i18n/test/locales-complete.test.ts` — **66/66 PASS**

- `a11y` canonical keys per locale
- `auth`, `shell`, `candidatePortal`, `certificationStaff` key parity vs `en`

## Wired UI surfaces

| Surface | Coverage |
|---------|----------|
| Login title, labels, validation, errors | `auth` namespace |
| Language switcher options | `shell` namespace |
| Certificate selector summary status | `candidatePortal.statusLabels` |
| Recertification table status column | `candidatePortal.statusLabels` |
| CPD / recert page (existing) | `candidatePortal` (TD-081) |

## Terminology preserved

- Education ≠ certification (empty-state copy unchanged semantically)
- Recertification ≠ certificate issuance
- CPD hours ≠ exam pass
- No identity document / biometric claims added

## Deferred hardcoded (out of F1 scope)

- Admin/governance pages (`admin-gov-ux-labels.ts` Serbian maps)
- Sidebar navigation labels
- Register page
- Dashboard widgets
- Committee / exam player identity flows
- Dev-only login pilot hints (intentionally left as-is)
