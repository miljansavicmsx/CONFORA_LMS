import { Clock, GraduationCap } from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { resolveCatalogSector } from "@/lib/learner-polish-labels";
import type { CatalogCourseRow } from "@/lib/lms-learner-api";
import { cn } from "@/lib/utils";

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640";

type Props = {
  readonly course: CatalogCourseRow;
  readonly className?: string;
};

function formatDuration(min: number | null): string | null {
  if (min == null || min <= 0) return null;
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

export function PublicCourseCard({ course, className }: Props): JSX.Element {
  const duration = formatDuration(course.durationMin);
  const detailHref = `/courses/${encodeURIComponent(course.id)}`;
  const sector = resolveCatalogSector(course);

  return (
    <article
      data-testid={`catalog-course-card-${course.id}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-surface-secondary/25",
        "ring-1 ring-white/[0.03] transition hover:border-brand/30 hover:shadow-lg hover:shadow-black/20",
        className,
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={course.coverImage?.trim() || FALLBACK_COVER}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
          aria-hidden
        />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand/90">
            {sector}
          </p>
          <h3 className="mt-1 text-base font-semibold leading-snug text-white line-clamp-2">
            {course.title}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
          {course.descriptionPreview || "Opis programa dostupan na stranici detalja."}
        </p>

        <dl className="grid grid-cols-2 gap-2 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 shrink-0 text-brand/80" aria-hidden />
            <span className="truncate" title={course.scope.name}>
              {course.scope.name}
            </span>
          </div>
          {duration ? (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-brand/80" aria-hidden />
              <span>{duration}</span>
            </div>
          ) : (
            <div>
              <span className="rounded-full border border-border/50 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                Pilot podaci
              </span>
            </div>
          )}
        </dl>

        <p className="text-[11px] text-text-muted" data-testid={`catalog-course-sector-${course.id}`}>
          Sektor: {sector} · Edukacijski program (nije certifikacija osobe)
        </p>

        {course.languages.length > 0 ? (
          <p className="text-[11px] text-text-muted">
            Jezici: {course.languages.join(", ")}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Button type="button" size="sm" className="flex-1" asChild>
            <Link to={detailHref} data-testid={`catalog-view-programme-${course.id}`}>
              Pregledaj program
            </Link>
          </Button>
          <Button type="button" size="sm" variant="outline" asChild>
            <Link to="/login">Prijava za nastavak</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
