import { Check, Loader2, Sparkles } from "lucide-react";
import { type JSX } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CatalogCourseCardProps {
  readonly courseId: string;
  readonly title: string;
  readonly description: string;
  readonly learningGoals: readonly string[];
  /** Cover / hero — ako nedostaje, koristi se gradient. */
  readonly heroBannerUrl: string | null;
  readonly price: number | null;
  readonly currency?: string;
  readonly isAuthenticated: boolean;
  readonly checkoutLoading?: boolean;
  readonly onCtaClick: () => void;
}

function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("hr-HR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `€${amount.toFixed(2)}`;
  }
}

function truncate(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) {
    return t;
  }
  return `${t.slice(0, maxLen - 1).trim()}…`;
}

export function CourseCard({
  title,
  description,
  learningGoals,
  heroBannerUrl,
  price,
  currency = "EUR",
  isAuthenticated,
  checkoutLoading = false,
  onCtaClick,
}: CatalogCourseCardProps): JSX.Element {
  const hasPrice = price !== null && price !== undefined && price > 0;
  const priceLabel = hasPrice ? formatPrice(price, currency) : "Besplatno";

  const ctaLabel = !isAuthenticated
    ? "Prijavi se / Kupi"
    : hasPrice
      ? "Kupi"
      : "Započni";

  const goals = learningGoals.slice(0, 4);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm",
        "ring-1 ring-slate-900/[0.04] transition-[box-shadow,transform] duration-300",
        "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/[0.08]",
      )}
    >
      {/* Hero */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {heroBannerUrl ? (
          <>
            <img
              src={heroBannerUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent"
              aria-hidden
            />
          </>
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#1F4E79] via-[#0EA5E9] to-slate-900"
            aria-hidden
          >
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent" />
            <Sparkles
              className="absolute right-4 top-4 h-8 w-8 text-white/30"
              aria-hidden
            />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-lg font-bold leading-snug tracking-tight text-white drop-shadow-sm line-clamp-2">
            {title}
          </h2>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-4">
        <p className="text-sm leading-relaxed text-slate-600 line-clamp-3">
          {truncate(description, 220)}
        </p>

        {goals.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ciljevi učenja
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {goals.map((g) => (
                <li
                  key={g}
                  className="inline-flex max-w-full items-center gap-1 rounded-full border border-sky-100 bg-sky-50/90 px-2.5 py-1 text-xs font-medium text-sky-950"
                >
                  <Check className="h-3 w-3 shrink-0 text-sky-600" aria-hidden />
                  <span className="truncate">{truncate(g, 48)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-auto flex flex-col gap-3 border-t border-slate-100 pt-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Cijena
            </span>
            <span className="text-xl font-bold tabular-nums text-confora-ink">
              {priceLabel}
            </span>
          </div>

          <Button
            type="button"
            className="h-11 w-full rounded-xl bg-[#1F4E79] text-sm font-semibold text-white shadow-md transition hover:bg-[#1a4268] hover:opacity-95 disabled:opacity-60"
            onClick={onCtaClick}
            disabled={checkoutLoading}
            aria-busy={checkoutLoading}
          >
            {checkoutLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Otvaram naplatu…
              </span>
            ) : (
              ctaLabel
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
