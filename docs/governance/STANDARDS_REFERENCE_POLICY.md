# CONFORA Standards Reference Policy

**Document ID:** CON-GOV-STANDARDS-POLICY-001
**Status:** Normative (authored in R0-1B1)
**Owner:** Architecture Lead + Compliance
**Authority level:** Governance Hierarchy Level 3

Defines how CONFORA governance, architecture, and compliance documents may reference external standards (ISO, IEC, BAS, W3C/WCAG, GDPR) without infringing copyright or creating false compliance claims.

---

## 1. Copyright constraint

- Full copyrighted ISO and BAS standards **must not be committed** to the repository unless repository distribution rights are **independently verified**.
- **Substantial reproduction** of standards text is **prohibited**.

## 2. Permitted content

Governance and compliance documents **may** contain:

- standard **designations** (e.g. ISO/IEC 17024, ISO 21001, ISO/IEC 27001, ISO/IEC 19788, WCAG 2.2);
- **edition/publication years** where necessary;
- **clause and control identifiers** and short titles;
- **control mappings** (CONFORA control → standard clause identifier);
- **copyright-safe implementation summaries** authored by CONFORA;
- minimal, attributed excerpts only where strictly justified.

## 3. Mapping is not conformity

- A standards **mapping does not itself prove implementation or conformity**.
- **Implementation claims require repository evidence.**
- Evidence must distinguish, for each control:
  1. **Requirement** (what the standard/clause asks);
  2. **Implementation** (tracked code/config that addresses it);
  3. **Verification** (test/review that confirms it);
  4. **Residual gap** (what remains unproven).

## 4. Prohibited claims

Documents must not imply accreditation, certification, or legal compliance solely because a mapping exists, and must not present untracked runtime behaviour as proof of conformity.

## 5. Preferred artefacts

| Artefact | Role |
|----------|------|
| `docs/compliance/STANDARDS_TRACEABILITY_MATRIX.md` | Cross-standard clause → CONFORA control (R0-1B3) |
| `docs/compliance/ISO_*_CONTROL_MAPPING.md` | Per-standard mappings (R0-1B3) |
| Baseline / ADRs | Binding requirements referencing designations |

## 6. Verification before promotion

Before any compliance mapping enters the authoritative corpus, it is scanned for long verbatim passages that may be copied from paid standards. If found, the passage is reduced to clause identifiers plus original CONFORA wording.

## 7. Binaries

Full standard PDFs and binary specification documents are **DO_NOT_TRACK** by default (OD-R01-8). Required content is extracted into markdown under this policy rather than committing the binary.
