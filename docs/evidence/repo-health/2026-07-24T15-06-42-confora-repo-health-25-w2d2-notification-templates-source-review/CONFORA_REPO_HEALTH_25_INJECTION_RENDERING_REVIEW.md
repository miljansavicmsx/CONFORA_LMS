# CONFORA-REPO-HEALTH-25 — Injection / Rendering Review

## Findings count

**`injection_rendering_findings_count`: 2**

| ID | Finding | Severity |
|----|---------|----------|
| INJ-01 | `interpolate()` replaces `{{k}}` with raw `v` — **no HTML/MJML escaping** | **High** — REWORK |
| INJ-02 | Freeform `bodyText`/`heading`/`footer` inserted into MJML text nodes; malicious or accidental markup can break structure | **High** — REWORK (service + interpolate) |

## Checks

| Check | Result |
|-------|--------|
| `<script>` / `mj-raw` / style injection in static MJML | **none** in assets |
| External image/font/CDN | **none** |
| Tracking pixels | **none** |
| Untrusted hardcoded URLs | **none** |
| Safe-by-default interpolation | **FAIL** in `events.ts` |

## Required rework (before MJML/loader import)

1. Escape HTML entities (at minimum) before MJML interpolation, **or**
2. Restrict vars to allowlisted plain text and reject markup, **or**
3. Move composition to a vetted renderer with auto-escape.

## Verdict

Static MJML shells are clean; **loader interpolation is unsafe** → blocks importing `events.ts` / using templates via current loader.
