import type { JSX } from "react";

import { EnterpriseSectionHeader } from "@/design-system";
import { KNOWLEDGE_GLOSSARY } from "@/lib/knowledge/knowledge-glossary";

export function StandardsGlossaryPanel(): JSX.Element {
  return (
    <nav className="rounded-2xl border border-border/50 bg-surface-primary/20 p-4" aria-label="Pojmovnik standards intelligence">
      <EnterpriseSectionHeader title="Glossary" description="Alias podrška za command center pretragu." titleLevel="h3" />
      <div className="mt-3 max-h-[min(50vh,360px)] overflow-y-auto pr-1">
        <dl className="space-y-3 text-sm">
          {KNOWLEDGE_GLOSSARY.map((g) => (
            <div key={g.term}>
              <dt className="font-semibold text-text-primary">{g.term}</dt>
              <dd className="text-text-secondary">{g.definition}</dd>
              <dd className="text-[11px] text-text-muted">Alias: {g.aliases.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </div>
    </nav>
  );
}
