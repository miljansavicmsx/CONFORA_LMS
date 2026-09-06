# 03_CORRECTED_EVIDENCE_QUALITY_RECONCILIATION

## Historical R3 package truth (immutable)

The committed historical package
`docs/evidence/r0-7d-c3s9-t026-r3-small-cell-remediation/20260906201401/`
is the package Codex R4 reviewed.

| Historical metric                                   | Value |
| --------------------------------------------------- | ----- |
| HISTORICAL_R3_EVIDENCE_PLACEHOLDER_COUNT            | 6     |
| HISTORICAL_R3_EVIDENCE_FALSE_PASS_COUNT             | 1     |
| HISTORICAL_R3_EVIDENCE_OVERCLAIM_COUNT              | 1     |
| HISTORICAL_R3_EVIDENCE_INTERNAL_CONTRADICTION_COUNT | 3     |

### Why historical quality gate text was incorrect

Historical file `09_EVIDENCE_CORRECTION_AND_GOVERNANCE_NON_CLAIMS.md` stated:

`R3_EVIDENCE_PLACEHOLDER_COUNT = 0`

That statement was incorrect at commit time because the same package still
contained six unresolved fields in authority and topology files. R5 does not
edit that historical file. R5 records the contradiction here instead.

## Six historical unresolved fields (reproduced)

| #   | File                                 | Unresolved text                             |
| --- | ------------------------------------ | ------------------------------------------- |
| 1   | 01_AUTHORITY_AND_REJECTED_HISTORY.md | `shell-variable-branch-token`               |
| 2   | 01_AUTHORITY_AND_REJECTED_HISTORY.md | `shell-variable-base-token`                 |
| 3   | 10_MUTATION_TOPOLOGY.md              | `angle-bracket-R3-evidence-SHA-token`       |
| 4   | 10_MUTATION_TOPOLOGY.md              | `unresolved-evidence-commit-count-marker`   |
| 5   | 10_MUTATION_TOPOLOGY.md              | unresolved-total-commit-count-marker        |
| 6   | 10_MUTATION_TOPOLOGY.md              | `unresolved-cumulative-commit-count-marker` |

## This R5 package measured quality (after scan)

| Metric                                   | Value |
| ---------------------------------------- | ----- |
| R5_NEW_EVIDENCE_FILE_COUNT               | 7     |
| R5_EVIDENCE_PLACEHOLDER_COUNT            | 0     |
| R5_EVIDENCE_FALSE_PASS_COUNT             | 0     |
| R5_EVIDENCE_OVERCLAIM_COUNT              | 0     |
| R5_EVIDENCE_INTERNAL_CONTRADICTION_COUNT | 0     |
| R5_CORRUPTED_AUTHORITY_LABEL_COUNT       | 0     |
| R5_INVALID_SHA_REFERENCE_COUNT           | 0     |
| R5_INVALID_BRANCH_REFERENCE_COUNT        | 0     |

## Scan method

Scanned all seven R5 files for unresolved template tokens, shell-variable
authority tokens, angle-bracket fill tokens, unsupported global CI-success
claims, branch/SHA integrity, and cross-file contradictions.
Metric names that document historical counts are resolved numeric facts, not
unresolved fields.

## Supersession note

R5 supersedes only inaccurate authority/topology/evidence-quality assertions
from the historical R3 package for future acceptance review. It does not erase
the historical package, the R4 FAIL result, or the six historical unresolved
fields as historical facts.
