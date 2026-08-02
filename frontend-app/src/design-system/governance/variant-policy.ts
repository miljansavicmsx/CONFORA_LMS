/**
 * Variant policy — prefer composition over one-off className forks.
 */

export const VARIANT_POLICY = {
  badges: "Use EnterpriseStatusBadge + Severity tokens; no raw red-500 for governance health.",
  ribbons: "EnterpriseWorkflowRibbon or IA ribbons — same stage semantics (done/active/pending).",
  heroes: "EnterpriseHero eyebrow + title + description; do not invent new hero grid under pages/.",
  panels: "rounded-2xl border border-border/* bg-surface-* — keep panel elevation consistent.",
  cards: "Prefer EnterpriseKpiCard / DS cards; avoid arbitrary shadow-* stacks.",
} as const;

export const FORBIDDEN_VARIANTS: readonly string[] = [
  "Ad-hoc rainbow status colors outside Severity/semantic tokens",
  "New AI labels without EnterpriseAiBadge + HITL copy review",
];
