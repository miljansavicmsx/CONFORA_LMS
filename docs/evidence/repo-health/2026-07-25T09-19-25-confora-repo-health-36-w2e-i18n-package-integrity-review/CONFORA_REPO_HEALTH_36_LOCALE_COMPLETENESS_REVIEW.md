# CONFORA-REPO-HEALTH-36 — Locale Completeness Review

All 40 locale JSON files parse as valid JSON (loaded via `resources.ts` static imports and by the jest suite).

## Key parity (jest `namespace locale parity (en canonical)`)

| Namespace | bs | sr | hr | sl |
|-----------|----|----|----|----|
| auth | ✔ | ✔ | ✔ | ✔ |
| shell | ✔ | ✔ | ✔ | ✔ |
| candidatePortal | ✔ | ✔ | ✔ | ✔ |
| certificationStaff | ✔ | ✔ | ✔ | ✔ |
| navigation | ✖ | ✖ | ✔ | ✖ |
| dashboard | ✔ | ✔ | ✔ | ✔ |
| common | ✔ | ✔ | ✔ | ✔ |
| a11y | ✔ (canonical-key + no-extra checks pass for all) |

## Failing parity (BLOCKING for package test)

`navigation.{bs,sr,sl}` carry an **extra** key `items.appealsComplaints` that is **not** present in `en/navigation.json` (nor `hr`). Jest diff:

```text
+   "items.appealsComplaints",
```

- `navigation.bs matches en key set` → **FAIL**
- `navigation.sr matches en key set` → **FAIL**
- `navigation.sl matches en key set` → **FAIL**

Result: **3 failed / 125 passed / 128 total**.

## Interpretation

- No **missing** keys detected by the parity test in other namespaces.
- The drift is **extra keys** in three navigation locales — internal inconsistency the package's own guard catches.
- This is a genuine data finding, not a tooling failure.

`locale_completeness_pass: false` (navigation parity drift).
