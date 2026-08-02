import { motion } from "framer-motion";
import { BookOpen, ClipboardList, Clock, RefreshCw } from "lucide-react";
import {
  useCallback,
  useMemo,
  type JSX,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import { Button } from "@/components/ui/button";
import type { CoursePathwayTier } from "@/lib/course-pathway";
import { catalogStatusLabelHr, pathwayTierShortHr } from "@/lib/course-pathway";
import { cn } from "@/lib/utils";

const CONFORA_BLUE = "#1F4E79";

export type CourseBadgeType =
  | "bestseller"
  | "novo"
  | "popularno"
  | "popust"
  | "preporuceno"
  | "besplatno";

export interface CourseCardProps {
  readonly courseId: string;
  readonly title: string;
  readonly slug: string;
  readonly thumbnailUrl: string;
  readonly domain: string;
  readonly level: "Pocetni" | "Srednji" | "Napredni" | "Ekspertni";
  readonly durationHours: number;
  readonly modulesCount: number;
  readonly price: number;
  readonly currency: string;
  readonly pathwayTier: CoursePathwayTier;
  /** Raw status iz API-ja (npr. published, draft). */
  readonly catalogStatus: string;
  readonly hasFinalExam: boolean;
  readonly badges?: readonly CourseBadgeType[];
  readonly discountPct?: number;
  readonly enrolledAt?: string;
  readonly progressPct?: number;
  readonly examInfo?: {
    readonly questionsCount: number;
    readonly passingScore: number;
    readonly attemptsAllowed: number;
  };
  /** Kratak opis ispod naslova (npr. katalog). */
  readonly shortDescription?: string;
  /** Forsira natpis na glavnoj akciji (npr. „Dodaj kurs“ / „Kupi“). */
  readonly ctaLabel?: string;
  readonly secondaryCtaLabel?: string;
  readonly onClick: () => void;
  readonly onPrimaryAction?: () => void;
  /** Tamni dashboard: brand CTA (#0EA5E9). */
  readonly ctaTone?: "default" | "brand";
}

const BADGE_LABELS: Record<CourseBadgeType, string> = {
  bestseller: "Bestseller",
  novo: "Novo",
  popularno: "Popularno",
  popust: "Popust",
  preporuceno: "PREPORUČENO",
  besplatno: "Besplatno",
};

function BadgePill({
  type,
  className,
}: {
  readonly type: CourseBadgeType;
  readonly className?: string;
}): JSX.Element {
  const base =
    "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm";
  const styles: Record<CourseBadgeType, string> = {
    bestseller: "bg-amber-400 text-amber-950",
    novo: "bg-emerald-500 text-white",
    popularno: "bg-violet-600 text-white",
    popust: "bg-red-500 text-white",
    preporuceno: "bg-violet-600 text-white",
    besplatno: "bg-teal-600 text-white",
  };

  return (
    <span className={cn(base, styles[type], className)}>
      {BADGE_LABELS[type]}
    </span>
  );
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("bs-BA", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function resolveCtaLabel(p: CourseCardProps): string {
  if (p.ctaLabel?.trim()) {
    return p.ctaLabel.trim();
  }
  const hasProgress =
    p.progressPct !== undefined && p.progressPct >= 0 && p.progressPct < 100;
  if (hasProgress) {
    return "Nastavi";
  }
  if (p.enrolledAt && p.progressPct === undefined) {
    return "Nastavi";
  }
  const free =
    p.price <= 0 || (p.badges !== undefined && p.badges.includes("besplatno"));
  if (free && !p.enrolledAt) {
    return "Saznaj više";
  }
  if (!p.enrolledAt && p.price > 0) {
    return "Kupi";
  }
  return "Saznaj više";
}

function originalPriceFromDiscount(price: number, discountPct: number): number {
  if (discountPct <= 0 || discountPct >= 100) {
    return price;
  }
  return price / (1 - discountPct / 100);
}

export function CourseCard(props: CourseCardProps): JSX.Element {
  const {
    courseId,
    slug,
    title,
    thumbnailUrl,
    domain,
    level,
    durationHours,
    modulesCount,
    price,
    currency,
    pathwayTier,
    catalogStatus,
    hasFinalExam,
    badges,
    discountPct,
    progressPct,
    examInfo,
    shortDescription,
    onClick,
    onPrimaryAction,
    ctaTone = "default",
  } = props;

  const ctaLabel = useMemo(
    () => resolveCtaLabel(props),
    [
      props.ctaLabel,
      props.enrolledAt,
      props.progressPct,
      props.price,
      props.badges,
    ],
  );

  const showStrikethrough =
    discountPct !== undefined && discountPct > 0 && discountPct < 100;
  const originalPrice = showStrikethrough
    ? originalPriceFromDiscount(price, discountPct)
    : null;

  const showProgressBar =
    progressPct !== undefined && progressPct >= 0 && progressPct <= 100;

  const marketingBadges = useMemo(() => {
    const out: CourseBadgeType[] = [];
    if (badges) {
      for (const b of badges) {
        if (!out.includes(b)) {
          out.push(b);
        }
      }
    }
    return out;
  }, [badges]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    },
    [onClick],
  );

  const handleCtaClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      (onPrimaryAction ?? onClick)();
    },
    [onClick, onPrimaryAction],
  );

  const handleDetailsClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onClick();
    },
    [onClick],
  );

  const ariaLabel = `Kurs: ${title}. ${domain}. Nivo ${level}.`;

  return (
    <motion.article
      data-course-id={courseId}
      data-slug={slug}
      role="article"
      aria-label={ariaLabel}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-left shadow-sm outline-none",
        "transition-shadow duration-300 focus-visible:ring-2 focus-visible:ring-[#1F4E79] focus-visible:ring-offset-2",
        "hover:shadow-lg",
      )}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      whileTap={{ scale: 0.998 }}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[hsl(var(--muted))]">
        <img
          src={thumbnailUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/35"
          aria-hidden
        />
        <div className="absolute left-2 top-2 flex max-w-[calc(100%-1rem)] flex-wrap gap-1">
          <span className="inline-flex max-w-[min(100%,14rem)] shrink-0 items-center rounded-full bg-slate-950/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm ring-1 ring-white/15">
            <span className="truncate">{pathwayTierShortHr(pathwayTier)}</span>
          </span>
          {marketingBadges.map((b) => (
            <BadgePill key={b} type={b} />
          ))}
        </div>
      </div>

      {showProgressBar ? (
        <div
          className="h-1.5 w-full bg-[hsl(var(--muted))]"
          role="progressbar"
          aria-valuenow={Math.round(progressPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Napredak učenja ${Math.round(progressPct)} posto`}
        >
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      ) : (
        <div className="h-1.5 w-full bg-transparent" aria-hidden />
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex w-fit max-w-full items-center rounded-full bg-[hsl(var(--muted))] px-2.5 py-0.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
            <span className="truncate">{domain}</span>
          </span>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            Status:
            {" "}
            <span className="font-semibold text-[hsl(var(--foreground))]">
              {catalogStatusLabelHr(catalogStatus)}
            </span>
          </span>
        </div>

        <h3 className="line-clamp-2 text-base font-bold leading-snug text-[hsl(var(--foreground))]">
          {title}
        </h3>

        {shortDescription ? (
          <p className="line-clamp-2 text-sm leading-snug text-[hsl(var(--muted-foreground))]">
            {shortDescription}
          </p>
        ) : null}

        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[hsl(var(--muted-foreground))]">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              {durationHours}
              h
            </span>
          </span>
          <span aria-hidden className="text-[hsl(var(--border))]">
            |
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              {modulesCount}
              {" "}
              modula
            </span>
          </span>
          <span aria-hidden className="text-[hsl(var(--border))]">
            |
          </span>
          <span>{level}</span>
        </p>

        {hasFinalExam && examInfo ? (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[hsl(var(--muted-foreground))]">
            <span className="inline-flex items-center gap-1">
              <ClipboardList className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>
                {examInfo.questionsCount}
                {" "}
                pit.
              </span>
            </span>
            <span aria-hidden>|</span>
            <span>
              {examInfo.passingScore}
              % prolaz
            </span>
            <span aria-hidden>|</span>
            <span className="inline-flex items-center gap-1">
              <RefreshCw className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>
                {examInfo.attemptsAllowed}
                {" "}
                pok.
              </span>
            </span>
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-3 pt-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-bold text-[hsl(var(--foreground))]">
              {formatMoney(price, currency)}
            </span>
            {showStrikethrough && originalPrice !== null ? (
              <span className="text-sm text-[hsl(var(--muted-foreground))] line-through">
                {formatMoney(originalPrice, currency)}
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full border-[hsl(var(--border))] font-semibold"
              onClick={handleDetailsClick}
              aria-label={`Detalji: ${title}`}
            >
              {props.secondaryCtaLabel?.trim() || "Detalji"}
            </Button>
            <Button
              type="button"
              className="w-full font-semibold text-white hover:opacity-90"
              style={{
                backgroundColor: ctaTone === "brand" ? "#0EA5E9" : CONFORA_BLUE,
              }}
              onClick={handleCtaClick}
              aria-label={`${ctaLabel}: ${title}`}
            >
              {ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
