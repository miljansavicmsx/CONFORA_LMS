import { AlertTriangle, BookOpen, Loader2, SearchX } from "lucide-react";
import type { JSX, ReactNode } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";

type StateProps = {
  readonly title: string;
  readonly description: string;
  readonly testId?: string;
  readonly action?: ReactNode;
};

export function PublicLoadingState({
  title = "Učitavanje…",
  description = "Molimo pričekajte trenutak.",
  testId = "public-loading-state",
}: Partial<StateProps>): JSX.Element {
  return (
    <div
      data-testid={testId}
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/50 bg-surface-secondary/20 px-6 py-16 text-center"
      aria-busy="true"
    >
      <Loader2 className="h-10 w-10 animate-spin text-brand" aria-hidden />
      <p className="text-sm font-medium text-text-primary">{title}</p>
      <p className="max-w-md text-xs text-text-muted">{description}</p>
    </div>
  );
}

export function PublicEmptyState({
  title,
  description,
  testId = "public-empty-state",
  action,
}: StateProps): JSX.Element {
  return (
    <div
      data-testid={testId}
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-surface-secondary/15 px-6 py-14 text-center"
    >
      <BookOpen className="h-10 w-10 text-text-muted" aria-hidden />
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      <p className="max-w-lg text-sm text-text-secondary">{description}</p>
      {action}
    </div>
  );
}

export function PublicNotFoundState({
  title,
  description,
  testId = "public-not-found-state",
  action,
}: StateProps): JSX.Element {
  return (
    <div
      data-testid={testId}
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-6 py-14 text-center"
      role="alert"
    >
      <SearchX className="h-10 w-10 text-amber-400" aria-hidden />
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      <p className="max-w-lg text-sm text-text-secondary">{description}</p>
      {action}
    </div>
  );
}

export function PublicErrorState({
  title,
  description,
  testId = "public-error-state",
  action,
}: StateProps): JSX.Element {
  return (
    <div
      data-testid={testId}
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-500/35 bg-red-500/5 px-6 py-14 text-center"
      role="alert"
    >
      <AlertTriangle className="h-10 w-10 text-red-400" aria-hidden />
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      <p className="max-w-lg text-sm text-text-secondary">{description}</p>
      {action}
    </div>
  );
}

export function PublicBackToCatalogAction(): JSX.Element {
  return (
    <Button type="button" variant="secondary" size="sm" asChild>
      <Link to="/courses">Natrag na katalog</Link>
    </Button>
  );
}
