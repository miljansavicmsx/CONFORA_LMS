import type { JSX } from "react";

import { AI_DISCLOSURE_STANDARD_HR } from "@/ai-governance";

/**
 * ISO §6.5 f — visible disclosure for user-facing AI (shown before first message in support chat).
 */
export function AiDisclosure(): JSX.Element {
  return (
    <aside
      className="rounded-lg border border-border/60 bg-surface-secondary/80 p-3 text-xs leading-relaxed text-text-secondary"
      aria-label="AI disclosure"
    >
      <p className="font-semibold text-text-primary">AI disclosure</p>
      <p className="mt-1.5">{AI_DISCLOSURE_STANDARD_HR}</p>
    </aside>
  );
}
