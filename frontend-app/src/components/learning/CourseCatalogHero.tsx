import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import type { JSX, ReactNode } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { EnterpriseAlertBanner } from "@/design-system";

export function CourseCatalogHero({
  title = "Izaberite program obuke",
  subtitle = "Moderni katalog programa — filtrirajte po oblasti, upišite se i nastavite učenje u playeru.",
  aiHint,
  continueHref,
  continueLabel = "Nastavi započeto",
  showContinue,
  browseAllId = "catalog-all",
}: {
  readonly title?: string;
  readonly subtitle?: string;
  readonly aiHint?: ReactNode;
  readonly continueHref?: string;
  readonly continueLabel?: string;
  readonly showContinue?: boolean;
  readonly browseAllId?: string;
}): JSX.Element {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border/45 bg-gradient-to-br from-sky-500/15 via-surface-secondary/90 to-brand/10 p-6 ring-1 ring-white/5 sm:p-8"
      aria-labelledby={`${browseAllId}-heading`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/20 blur-3xl" aria-hidden />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">LMS katalog</p>
          <h1 id={`${browseAllId}-heading`} className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            {title}
          </h1>
          <p className="text-sm leading-relaxed text-text-secondary">{subtitle}</p>
          {aiHint ? (
            <EnterpriseAlertBanner severity="info" icon={Sparkles} title="AI preporuka">
              {aiHint}
            </EnterpriseAlertBanner>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
          {showContinue && continueHref ? (
            <Button asChild type="button" className="bg-brand font-semibold text-white hover:bg-brand/90">
              <Link to={continueHref}>
                {continueLabel}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          ) : null}
          <Button asChild type="button" variant="outline" className="border-border/60">
            <a href={`#${browseAllId}`}>
              <BookOpen className="mr-2 h-4 w-4" aria-hidden />
              Pregledaj sve programe
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
