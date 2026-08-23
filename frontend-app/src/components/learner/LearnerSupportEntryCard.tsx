import type { JSX } from "react";

export function LearnerSupportEntryCard({ context }: { readonly context: "education" }): JSX.Element {
  const description = context === "education" ? "Za pitanja o pristupu edukaciji ili napretku obratite se podršci kroz postojeće kanale." : "";
  return (
    <aside className="rounded-lg border border-border/50 p-3 text-sm text-text-secondary" data-testid="learner-support-entry-card">
      <h2 className="font-medium text-text-primary">Podrška za polaznike</h2>
      <p className="mt-1">{description}</p>
    </aside>
  );
}
