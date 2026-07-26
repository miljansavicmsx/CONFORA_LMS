# Standards reference policy — R0-1A (proposed)

**Proposed tracked path after owner approval:** `docs/governance/STANDARDS_REFERENCE_POLICY.md`  
**Status in R0-1A:** Evidence-only draft — not yet promoted.

## Purpose

Define how CONFORA governance and architecture documents may reference external standards (ISO, IEC, BAS, WCAG, GDPR) without infringing copyright or creating false compliance claims.

## Allowed content in repository documents

Governance/compliance documents **may** contain:

- standard designations (e.g. ISO/IEC 17024, ISO 21001, ISO/IEC 27001, ISO/IEC 19788, ISO/IEC 8808, WCAG 2.2);
- edition years / publication years when known and necessary;
- clause or control identifiers and short titles;
- control mappings (CONFORA control → standard clause ID);
- implementation requirements derived by CONFORA;
- short copyright-safe excerpts **only** when justified, attributed, and limited to the minimum needed for understanding.

## Prohibited content

Documents **must not**:

- reproduce substantial copyrighted standard text;
- commit full copyrighted ISO/BAS/IEC PDF standards into the repository unless a **verified licence** explicitly permits repository distribution;
- imply accreditation, certification, or legal compliance solely by mapping presence;
- present untracked runtime behaviour as proof of standard conformity.

## Preferred artefacts

| Artefact | Role |
|----------|------|
| `STANDARDS_TRACEABILITY_MATRIX.md` | Cross-standard clause → CONFORA control |
| `ISO_*_CONTROL_MAPPING.md` | Per-standard mappings (clause IDs + CONFORA implementation notes) |
| Baseline / ADRs | Binding engineering requirements referencing designations |

## Verification before promote

R0-1B must scan promoted compliance files for long verbatim passages that appear to be copied from paid standards. If found: redact to clause IDs + original CONFORA wording before commit.

## Relationship to OQ decisions

- OQ-1 enables tracking of mappings, not the standards themselves.
- OQ-7 requires separate remediation evidence — mappings ≠ verification.
- Accreditation/DPO/legal approval remain out of scope for document promotion.
