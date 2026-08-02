import { type JSX, useMemo } from "react";

import type { FrameworkId } from "@/lib/compliance";
import { COMPLIANCE_FRAMEWORK_LABEL, listFrameworkIds, groupsByFramework } from "@/lib/compliance";
import { cn } from "@/lib/utils";

export function ComplianceFrameworkPanel({
  activeFramework,
  onFrameworkChange,
}: {
  readonly activeFramework: FrameworkId;
  readonly onFrameworkChange: (id: FrameworkId) => void;
}): JSX.Element {
  const ids = useMemo(() => [...listFrameworkIds()], []);
  const summary = useMemo(
    () =>
      ids
        .map((id) => `${COMPLIANCE_FRAMEWORK_LABEL[id]}: ${groupsByFramework(id).length} grupa`)
        .join("; "),
    [ids],
  );

  return (
    <section aria-label="Okviri usklađenosti" className="rounded-2xl border border-border/45 bg-surface-secondary/40 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Standardi i okviri</p>
      <p className="sr-only">{summary}</p>
      <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Odabir okvira">
        {ids.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeFramework === id}
            tabIndex={0}
            onClick={() => onFrameworkChange(id)}
            className={cn(
              "rounded-xl border px-3 py-2 text-left text-xs outline-none transition-colors motion-reduce:transition-none",
              "focus-visible:ring-2 focus-visible:ring-brand/35",
              activeFramework === id
                ? "border-brand/50 bg-brand/10 text-text-primary"
                : "border-border/50 bg-surface-primary/60 text-text-secondary hover:border-border/70",
            )}
          >
            <span className="font-semibold">{id}</span>
            <span className="mt-0.5 block text-[10px] opacity-80">{COMPLIANCE_FRAMEWORK_LABEL[id]}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-text-secondary">
        Grupa zahtjeva: {groupsByFramework(activeFramework).length} (stub katalog — nije kompletan normativ).
      </p>
    </section>
  );
}
