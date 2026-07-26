# R0-1B Task Specification — Execute Approved Governance Promotion

**Depends on:** R0-1A evidence package `2026-07-26T14-09-58-r0-1-governance-corpus-inventory`  
**Depends on owner gates:** OD-R01-1, OD-R01-2, OD-R01-9 (minimum)  
**Must not start:** Until owner records approvals against `owner_decisions_required.md` / `promotion_manifest.md`

## Objective

Execute **only** the owner-approved subset of the promotion manifest: place approved documents under tracked `docs/governance/**`, `docs/architecture/**`, `docs/compliance/**` (and templates paths), apply required rebaseline annotations, track approved evidence packages, and produce a new evidence package proving scope integrity.

## In scope

1. Create working branch from `origin/fix/ca-h01-frontend-f4-cutover` @ current tip (verify still contains R0-3 merge).
2. Apply Wave A (as approved) with path moves and **PROMOTE_WITH_REBASELINE** edits that preserve OQ-3/OQ-4/OQ-5/OQ-6/OQ-7 non-claims and contradictions.
3. Apply Wave B evidence tracking if approved.
4. Apply Wave C merges only where OD-R01-4 approved.
5. Author Wave D missing docs only where OD-R01-5 approved — clause references only for ISO mappings.
6. Optionally Wave E if OD-R01-6 includes G-series.
7. Produce evidence under `docs/evidence/governance/<timestamp>-r0-1b-governance-corpus-promotion/`.
8. Commit **only** approved governance/architecture/compliance/template/evidence files.
9. Open Draft PR against `fix/ca-h01-frontend-f4-cutover` for independent review.

## Out of scope / prohibited

- `.cursor/rules/**` (R0-2)
- Application code, workflows, schemas, migrations, runtime configuration
- Tracking FastAPI `backend/` (requires separate OQ-3 task)
- Production deploy / allowlist population / Environment setting changes
- Full copyrighted ISO/BAS PDFs
- Silent resolution of ADR-001 vs frontend-app contradiction
- Claims of Nest completeness, production readiness, accreditation, DPO/legal approval
- Repair of R0-7 CI failures (except if a doc mentions them honestly)

## Required rebaseline annotations (minimum)

| Document | Required note |
|----------|---------------|
| Baseline | Nest intended canonical but not currently complete/buildable; frontend-app operational pending ADR supersession; R0-3 containment active with conditions |
| ADR-001 | Point to Gap Note + OQ-4; status note “Accepted — pending supersession” |
| ADR-002 | Nest intended; recovery/reconstruction open; FastAPI not yet approved tracked frozen legacy |
| Component Registry | Align status columns with OQ-3/OQ-4 |
| Legacy Deprecation Matrix | FastAPI track-as-frozen deferred to approved later task |

## Acceptance criteria

- [ ] Fresh clone after merge would contain Baseline path cited by AGENTS.md
- [ ] No `.cursor/rules` in the PR
- [ ] Contradictions register items C-02 and C-05 still visible in tracked docs
- [ ] Copyright scan of compliance files passed
- [ ] Diff limited to approved paths
- [ ] Independent review can classify GO / GO WITH CONDITIONS / NO-GO
- [ ] PR remains Draft until review + owner merge authorization

## Suggested commit subject (example)

`docs(governance): track approved governance and architecture corpus (R0-1B)`

## Evidence outputs (R0-1B)

Mirror R0-1A discipline: README, before/after file lists, rebaseline diff summary, copyright scan, owner approval references, git status before/after, summary.json, promotion execution log.
