# Accepted limitation

LIMITATION_ID = R3_MISSING_CONTEMPORANEOUS_EXTERNAL_PACKAGE
LIMITATION_STATUS = ACCEPTED

At R3 commit time 2026-09-19T06:30:17Z, alignment R3 was recorded as an in-tree
Git commit and later published as an exact named ref. No contemporaneous
external immutable ZIP/log package bound to commit 60c551f was produced in the
same instant/package class used for FR2 execution logs, I1 restoration logs, or
the I2 review logs.

Later artifacts are not that contemporaneous package:

1. Canonical-ref publication R1 published the existing exact R3 object. It
   created no new commit and is not a contemporaneous R3 execution ZIP.
2. Current-state evidence capture R1 (`80f39409`, 2026-09-19T18:39:56Z) is a
   later observation of live refs. It does not backfill a package into 06:30:17Z.

Owner acceptance means this gap is an accepted evidence limitation for the R3
alignment candidate. It is not a current blocker invented by this package, and
it is not an independent R3 review result.

ACCEPTED_FACT = contemporaneous external R3 package was not produced
NOT_ACCEPTED_AS = reconstructed contemporaneous package exists
NOT_ACCEPTED_AS = general precedent for other packages
NOT_ACCEPTED_AS = independent R3 review PASS
NOT_ACCEPTED_AS = erasure of I1 FAIL or I2 FR2+EC1 PASS/ACCEPT
