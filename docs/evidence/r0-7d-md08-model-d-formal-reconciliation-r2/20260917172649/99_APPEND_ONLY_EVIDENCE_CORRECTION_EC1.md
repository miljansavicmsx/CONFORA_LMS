# MD08 Model D FR2 — append-only evidence correction EC1

AUTHORIZATION = OWNER_AUTHORIZE_R0_7D_MD08_MODEL_D_FR2_EC1_APPEND_ONLY_EVIDENCE_CORRECTION
EXECUTION_ENGINE = CODEX
CORRECTION_DATE_UTC = 2026-09-17
CORRECTION_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
F01_ACCEPTANCE_STATUS = NOT_INDEPENDENTLY_ACCEPTED
AUTHORITY_LEVEL = 7_SUPPORTING_EVIDENCE_ONLY

## Identity and preserved history

This correction addresses F01 in the independent Codex review of commit
`93d731ec8f0f24d992be9ca8df176558abf011e7` (FR2), tree
`8b36efb725aa000f86dec4c0177370be1e4a660f`, parent
`e33a56d2b0408ad7c3d90b531bb3cd47e8f268a5`.
Branch: `governance/r0-7d-md08-model-d-formal-reconciliation-r2`.

The original `04_VALIDATION.md` is retained unchanged. Its premature execution
claims are historical errors, explicitly superseded below. This correction does
not convert the original review's FAIL / REQUEST_CHANGES into an ACCEPT, erase
F01, or independently approve its own implementation. A separate reviewer must
assess EC1; the author of this correction cannot provide that independent review.

Review source: external `md08-fr2-review/INDEPENDENT_REVIEW.md` dated 2026-09-17.
REVIEW_SHA256 = 2ea88fb3130786a54ab2d7c6c29ec8a3d59ee58a29aba80e32c8cdbe3ab8f6b3

## Corrected chronology and row-level supersession

The bytes in FR2 were fixed before its creation and first push. Results dependent
on that commit or push could not already have been executed for that final object.
The note at the end of the original matrix deferred only aggregate counts; it did
not cure the premature row-level statuses. Later successful verification does not
make those earlier claims historically accurate.

For the final FR2 object, replace the interpretation of `EXECUTED | PASS` in these
original rows with the following status **at the time FR2 content was finalized**:

| Original row | Correct historical status | Later evidence and limits |
|---|---|---|
| V34 — exact commit subject | PENDING_FINAL_COMMIT | External report/raw output records the subject; independent review confirmed GitHub metadata for 93d731ec |
| V35 — direct parent | PENDING_FINAL_COMMIT | External report/raw output and independent review confirm e33a56d2 as sole parent |
| V36 — one non-merge / zero merge | PENDING_FINAL_COMMIT | External report and independently verified sole-parent topology establish one commit after the base |
| V37 — `git diff --check base HEAD` | PENDING_FINAL_COMMIT | External raw output reports exit 0; independent review checked added-line whitespace but did not rerun that native command |
| V39 — integration reference after push | PENDING_POST_PUSH | External post-push output and later independent snapshot show e33a56d2; snapshots prove observed values, not absence of transient mutations |
| V40 — FR1 reference after push | PENDING_POST_PUSH | External post-push output and later independent snapshot show 147790c1; same limitation applies |
| V41 — no existing remote ref deleted/replaced | PENDING_POST_PUSH | Historical global no-mutation claim is NOT_INDEPENDENTLY_VERIFIED; complete pre/post all-reference inventories were not supplied |
| V42 — no force-push | PENDING_PUSH_EXECUTION | External command/output reports an ordinary new-branch push; historical operation counts remain attributed to the executor |
| V43 — exactly one new FR2 remote ref | PENDING_POST_PUSH | Raw push output reports FR2 as a new branch and the review confirms its head; absence of other historical ref operations is NOT_INDEPENDENTLY_VERIFIED |
| V44 — no PR and no merge for completed execution | PENDING_EXECUTION_COMPLETION | Independent review's all-state head query found no PR; commit topology and integration snapshot support unintegrated state at observation time |

V01–V33 and V38 are not superseded by this chronology correction. This statement
does not claim a new execution of those checks. No aggregate `44/44 independently
verified` claim is made. The external execution package's 44/44 remains an executor
report, subject to these qualifications, rather than independent proof of every
historical operation.

## Dated external results bound to original FR2

External package: `C:\CONFORA_R0D_MD08_MODEL_D_FR2_CLEAN_REISSUANCE_LOGS\`.
Final report execution time: `2026-09-17T17:30:57Z`, after the GitHub-reported FR2
commit time `2026-09-17T17:29:47Z`.

| Artifact | SHA-256 | Use |
|---|---|---|
| `00_MD08_MODEL_D_FR2_FINAL_REPORT.md` | fef51d4618f3131d9682cc1aa0c2d2d0fbf067ec996d7aea5e4a41c01c004018 | Binds reported results to full FR2 SHA, tree and parent |
| `09_RAW_GIT_OUTPUTS.md` | c3fa4227f18abcfe50160eda3f9583d7938c43021e22405cfdccbca3e6653eee | Records commit-before-push sequence, ordinary push and observed post-push heads |

These hashes were rechecked while preparing EC1. The independent FR2 review also
verified all 12 external manifest entries, current remote refs, exact seven-path
scope, I2 report hash and Model D arithmetic. These are later observations, not
claims that verification had occurred before FR2 existed.

## Exact append-only scope and manifest supplement

EC1 adds exactly this path:
`docs/evidence/r0-7d-md08-model-d-formal-reconciliation-r2/20260917172649/99_APPEND_ONLY_EVIDENCE_CORRECTION_EC1.md`.

The original `05_EVIDENCE_MANIFEST.md` remains the historical manifest of the six
files added by FR2. This is its additive supplement: FR2 plus EC1 comprises those
same six evidence files, this seventh evidence file, and the unchanged FR2 version
of `docs/governance/OWNER_DECISION_REGISTER.md` — eight cumulative changed paths
relative to integration. EC1 itself changes no existing path.

## EC1 publication and independent acceptance remain pending in this artifact

EC1_COMMIT_SHA = DEFERRED_TO_EXTERNAL_POST_COMMIT_REPORT
EC1_COMMIT_TREE = DEFERRED_TO_EXTERNAL_POST_COMMIT_REPORT
EC1_POST_COMMIT_VALIDATION = PENDING
EC1_PUSH_RESULT = PENDING
EC1_POST_PUSH_REFERENCE_VALIDATION = PENDING
EC1_INDEPENDENT_REVIEW = PENDING

These fields describe the state when these bytes are finalized. Final EC1 commit,
push and reference results must be recorded afterward in an external package bound
to the actual EC1 SHA. They must not be backfilled into this immutable artifact.

## Preserved non-effects

Part E remains unchanged: candidate Model D `17/9/8/8/0`; integration at the frozen
base remains `17/8/9/9/0`. Only MD08 is reconciled by the original candidate.
FR1 history and its STOPPED_BLOCKED review remain preserved, without retroactive
branch-mutation authorization. No PR creation, merge, deployment, general C3-S9
resume, HD06 binding, HD07 readiness, OQ-4 closure, R0-7D closure, R0-7E
implementation, CI-debt closure or CI-failure waiver is granted by EC1. The existing
PR37/I2 five-failure/one-skipped CI disclosure remains historical; CI green is not
claimed. No production source, tests, configuration, dependencies or governance
registers are changed by this correction.
