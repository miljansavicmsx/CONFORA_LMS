# CONFORA-REPO-HEALTH-36 — i18n Inventory

Closed inventory of tracked `packages/i18n/**` at HEAD `f1cbfa97`. **50 tracked files** (matches RH35).

## package/config (4)

| Path | Bytes | SHA-256 |
|------|------:|---------|
| `package.json` | 1304 | `4b5a8acd4c1b169cbf17d2f348790b5d64d4354695cd58b53dc61be0eff1362c` |
| `jest.config.cjs` | 252 | `f6ee2014c1bcca9eb0309140df2a486b6ab766e5524510f6180ddda3e8f7e7ff` |
| `tsconfig.json` | 285 | `11b8b94e6734be2b545c65ae86ade7532bbe04521abab7b33a85a999c631c58f` |
| `tsconfig.build.json` | 271 | `f9cd78929a8e9716bdd86982672dcdeb8d671f61629ce7749f522919cb9a1103` |

## src (5)

| Path | Bytes | SHA-256 | Role |
|------|------:|---------|------|
| `src/create-i18n.ts` | 1482 | `62c0f004d03d0f1fb035bb48a6256014681fa05ea54a975f5f9dee978995895d` | i18next instance factory |
| `src/index.ts` | 494 | `6cafe806061f20818172a905f99fbbeebb4cd851b9e12c6abd2dbdc2a9560c96` | barrel |
| `src/keys.ts` | 1893 | `4dba7086ac5bc8a941ae362958df2785cbff955e80c95af312dcfa69929176ab` | NS + locale + a11y key constants |
| `src/react.tsx` | 1620 | `41c9783e8cfc75b18b26bf8080c580272c9da34ff0dd53b20fcaa63cf3d47ee0` | provider + skip-link wrapper |
| `src/resources.ts` | 6513 | `4faa79073d65c8e8f144103afde96fb7d501dceb17b6129b5ac7bfe866c9e2dc` | static JSON aggregation |

## tests (1)

| Path | Bytes | SHA-256 |
|------|------:|---------|
| `test/locales-complete.test.ts` | 2246 | `e8f961497a409f04f2694795c82f72172fd54fe2299eeba2315682390d5f8268` |

## locale resources (40) — 5 locales × 8 namespaces

| Namespace | en | bs | hr | sl | sr |
|-----------|----|----|----|----|----|
| a11y | 853 | 901 | 925 | 874 | 887 |
| auth | 1202 | 1180 | 1181 | 1178 | 1177 |
| candidatePortal | 3610 | 3611 | 3685 | 3598 | 3603 |
| certificationStaff | 2809 | 2857 | 2858 | 2842 | 2833 |
| common | 174 | 174\* | 185 | 174\* | 174\* |
| dashboard | 6076 | 6076\* | 6096 | 6084 | 6076\* |
| navigation | 6047 | 6104 | 6057 | 6333 | 6106 |
| shell | 771 | 769† | 781 | 795 | 769† |

`*` = byte- and SHA-identical to EN (see authenticity review). `†` = bs and sr identical to each other.

Full per-file SHA-256 values captured in audit run (Get-FileHash SHA256).

## generated/compiled/vendor

**None tracked.** `dist/`, `node_modules/`, `.turbo/`, `*.d.ts`, `*.js`, `*.js.map`, `tsbuildinfo` exist on disk but are **untracked** (not in `git ls-files`).

`i18n_inventory_completed: true` · `tracked_i18n_file_count: 50`
