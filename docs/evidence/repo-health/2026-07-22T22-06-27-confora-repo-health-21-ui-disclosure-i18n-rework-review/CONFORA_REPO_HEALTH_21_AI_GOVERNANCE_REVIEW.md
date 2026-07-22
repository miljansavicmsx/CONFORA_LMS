# CONFORA-REPO-HEALTH-21 — AI Governance Review

**Scope:** `packages/ui/src/ai-disclosure.tsx` (untracked)  
**Authority:** CONFORA Baseline — AI assistive only; no autonomous certification authority.

## Findings

| ID | Finding | Severity |
|----|---------|----------|
| AG-01 | Component is presentational disclosure only — no decision API, scoring, or certification mutation. | Info (positive) |
| AG-02 | Does **not** claim AI makes final certification decisions. | Info (positive) |
| AG-03 | Does **not** claim AI replaces human review. | Info (positive) |
| AG-04 | Banner frames outputs as “suggestions” and asks user to “verify” — directionally aligned with transparency. | Low residual |
| AG-05 | Missing explicit **human oversight mandatory** wording in component contract / recommended copy. | Medium — rework |
| AG-06 | Missing explicit **AI does not decide certification / competence outcomes** constraint in recommended copy / docs. | Medium — rework |
| AG-07 | Hardcoded English disclosure weakens multilingual transparency obligations. | High — i18n (see i18n requirements) |
| AG-08 | No AI metadata capture (model, prompt hash, reviewer) — appropriate for a pure UI badge; must not pretend to be the audit record. | Info |

## Risk of implying automated certification

**Current risk: low for explicit false claims, medium for omission.**

- No phrases like “approved”, “certified”, “decision”, “auto”, “without review”.
- Omission of human-in-the-loop language means a consumer could place the badge near a decision UI and imply more than the badge states.
- Rework must document intended placement: disclosure of AI-assisted **content**, never a substitute for COM_CERT / human decision UI.

## Required governance wording for rework (copy owned by product i18n)

Product translation strings used with this component SHOULD include meaning equivalent to:

1. Output is AI-assisted / generated with AI assistance.
2. Outputs are suggestions or drafts only.
3. Human review / oversight is required before reliance.
4. AI does **not** make certification decisions.

Exact wording is locale-owned; package must not hardcode English.

## Forbidden implications (must remain true after rework)

- Never auto-certify.
- Never hide AI usage (component exists to disclose).
- Never bypass reviewer workflows via this UI alone.
- No tenant/auth/business decision behavior in this component.

## External approvals

This review does **not** claim external pilot, security-delegate, or DPO/legal approval.
