# Copyright and licensing findings — R0-1A

## Scope

Assessed candidates for promotion into git with respect to copyright risk. No licence legal opinion is claimed.

## Findings

### 1. Full standard PDFs

| Finding | Result |
|---------|--------|
| ISO/IEC/BAS full standard PDFs in repo root or docs/ | **Not found** as named ISO PDF dumps in this pass |
| Policy | **Do not commit** full copyrighted standards PDFs without verified distribution licence |

### 2. Root binary governance/product files

| File | Size | Recommendation |
|------|-----:|----------------|
| `Confora Ai Development Governance Framework V1.pdf` | ~70KB | **DO_NOT_TRACK** as SoR until ownership/licence confirmed; extract requirements to markdown if needed |
| `CONFORA_Design_System_Promptovi_v1.0.docx` | ~44KB | **DO_NOT_TRACK** |
| `CONFORA_LMS_Plan_Implementacije_v1.0_1.docx` | ~69KB | **DO_NOT_TRACK** |
| `CONFORA_Tehnicka_Specifikacija.docx` | ~53KB | **DO_NOT_TRACK** |
| `CONFORA_WCAG22_Zahtjevi.docx` | ~53KB | **DO_NOT_TRACK** (WCAG is W3C; still avoid binary SoR — prefer markdown requirements) |

### 3. Markdown governance/architecture corpus

Internal CONFORA markdown under `docs/governance`, `docs/architecture`, and named standards appear to be project-authored. **No material third-party copyright block identified** from filenames/titles alone. R0-1B must still spot-check ISO mapping files for pasted standard body text before commit.

### 4. Sensitive data

This evidence package must not include tokens, secrets, environment secret values, or unnecessary personal emails. Inventory JSON uses role titles and public repo facts only.

## Owner action

Confirm handling of root PDF/docx set (leave local-only vs convert). Default for R0-1B: **leave untracked**.
