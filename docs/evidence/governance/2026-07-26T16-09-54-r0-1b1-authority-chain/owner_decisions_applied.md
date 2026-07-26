# Owner decisions applied — R0-1B1

How each binding owner decision was implemented in this task.

| ID | Decision | Applied in R0-1B1 |
|----|----------|-------------------|
| OD-R01-1 | Reject 26-item Wave A; split into B1/B2/B3 | This task promotes **only** the 8-file authority chain; architecture/compliance deferred |
| OD-R01-2 | Track 3 evidence packages as evidence only | Three packages staged in Commit 2 with non-normative status notices added to their READMEs |
| OD-R01-3 | Defer ADR/architecture renames + AI companion merge to R0-1B2 | No ADR, `docs/architecture/**`, or AI companion file touched |
| OD-R01-4 | Defer compliance/security merges to R0-1B3 | No ISO mapping / compliance / security merge candidate touched |
| OD-R01-5 | Author minimum missing authority-chain docs | Authored Constitution, Change Control, Owner Decision Register + Package, Standards Reference Policy |
| OD-R01-6 | Exclude G3–G6 | No `docs/architecture/G*` promoted |
| OD-R01-7 | Root `CONFORA_*.md` untracked | Left untracked (see `git_status_after.txt`) |
| OD-R01-8 | Root PDF/DOCX DO_NOT_TRACK | No binary staged; Standards Reference Policy §7 restates this |
| OD-R01-9 | Non-claims explicit | Baseline §0 + `non_claims_validation.md`; Owner Decision Package §3 |
| OD-R01-10 | Document change-control roles | `CHANGE_CONTROL.md` §1–§4 + role-combination rule |

## Decisions recorded (not newly approved)

The Owner Decision Register also records OQ-1…OQ-7 and OD-R03-1…OD-R03-5. These reflect previously approved/recorded decisions; R0-1B1 records them for a self-contained authority chain and does not create new approvals beyond OD-R01-1…OD-R01-10 as authorized by this task.
