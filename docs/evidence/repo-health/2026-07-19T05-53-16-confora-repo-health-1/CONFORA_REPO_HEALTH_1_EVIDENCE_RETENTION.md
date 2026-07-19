# CONFORA-REPO-HEALTH-1 — Evidence Retention Policy (Proposed)

## Intent

Keep CONFORA governance evidence durable and auditable **without** unbounded growth or accidental secret inclusion.

## Scope

Applies to `docs/evidence/**` and related summary/report artifacts.

## Retain (do not delete)

| Class | Examples | Policy |
|-------|----------|--------|
| Canonical GO / NO-GO package for a closed slice | Appeals final, A-03, DPO-LEGAL-2, EXTERNAL-PILOT-GATE-2 | Retain indefinitely in git when intentionally committed |
| Security / legal decision packages | A-02-R3, A-03, DPO-LEGAL-* | Retain; never rewrite history to fabricate signatures |
| Baseline / regression anchors referenced by later slices | TD-085, STAFF-MFA-3, EXAM-REG recovery | Retain while referenced |

## Prefer not to commit / keep local-only

| Class | Examples | Policy |
|-------|----------|--------|
| Failed / superseded intermediate runs | Earlier `*-1r-browser` FAIL folders, `08-02-19-appeals-complaints-2r` | May remain local; commit only if needed for audit trail of failure |
| Bounded logs with possible noise | `bounded-logs/*.log` | Prefer redact + commit summaries; avoid tokens |
| Screenshots / QR / TOTP material | `*qr*.png`, enrollment screenshots | **Never commit** |
| Raw auth setup outputs | `tmp-keycloak-setup-output.txt` | **Never commit** |

## Retention tiers (proposal)

| Tier | Duration | Action after duration |
|------|----------|------------------------|
| T0 — Active program evidence | Current phase + 24 months | Keep in git |
| T1 — Superseded technical runs | 90 days local optional | Delete local copies only after confirming canonical successor exists |
| T2 — Large binary tooling adjacent to evidence | N/A | Do not store under `docs/evidence/`; use `.tools` ignored |

## Commit hygiene for evidence

1. Never `git add .`
2. Add explicit paths only.
3. Ensure `summary.json` has no secrets; scan for `eyJ`, `otpauth://`, passwords.
4. Prefer UTF-8 text evidence over binaries.
5. One canonical folder per slice verdict; note superseded folders in the canonical index.

## Current snapshot (this workspace)

| Metric | Value |
|--------|------:|
| Top-level domains under `docs/evidence/` | 70 |
| Tracked files under `docs/evidence/` | 511 |
| Untracked `docs/evidence` status entries | 411 |

Largest untracked evidence domain observed: `f5-pilot-readiness` (240 entries).
