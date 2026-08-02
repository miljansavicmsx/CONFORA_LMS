import { createElement, type ReactElement } from "react";

/**
 * R0-7D2S2: minimal public-verify narrative panel.
 * Full EnterprisePanels.tsx is outside the approved 68-file manifest.
 * Kept as `.ts` (manifest path) — no JSX syntax.
 */
export type EnterpriseNarrativePanelProps = {
  readonly title: string;
  readonly body: string;
};

export function EnterpriseNarrativePanel({
  title,
  body,
}: EnterpriseNarrativePanelProps): ReactElement {
  return createElement(
    "div",
    {
      className: "rounded-2xl border border-border/35 bg-surface-secondary/20 p-4",
      role: "region",
      "aria-label": "Narativ",
      "data-testid": "enterprise-narrative-panel",
    },
    createElement("h3", { className: "text-sm font-semibold text-text-primary" }, title),
    createElement("p", { className: "mt-2 text-sm leading-relaxed text-text-secondary" }, body),
  );
}
