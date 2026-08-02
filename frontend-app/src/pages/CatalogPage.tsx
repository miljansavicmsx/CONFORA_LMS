import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useCallback, useState, type JSX } from "react";
import { Link, useNavigate } from "react-router";

import { CourseCard } from "@/components/catalog/CourseCard";
import { CertificationCatalogDisclaimer } from "@/components/catalog/CertificationCatalogDisclaimer";
import {
  createCheckoutSession,
  fetchPublishedCourses,
  type PublishedCourseDto,
} from "@/lib/catalog-api";
import { enrichCourseFromListRow, type CourseListRow } from "@/lib/enrich-course-detail";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

function dtoToListRow(d: PublishedCourseDto): CourseListRow {
  const base: CourseListRow = {
    courseId: d.courseId,
    slug: d.slug,
    title: d.title,
    domain: d.domain,
    price: d.price,
    level: d.level ?? "Srednji",
    durationHours: d.durationHours ?? 24,
    thumbnailUrl: d.thumbnailUrl ?? null,
    isCertifiable: d.isCertifiable ?? true,
    status: d.status ?? null,
    shortSummary: d.shortSummary ?? null,
    description: d.description ?? null,
    learningOutcomes: d.learningOutcomes ?? null,
    certificationSchemeReference: d.certificationSchemeReference ?? null,
    moduleCount: d.moduleCount ?? null,
    lessonCountTotal: d.lessonCountTotal ?? null,
    structurePreview: d.structurePreview ?? null,
    badges: d.badges ?? null,
  };
  return {
    ...base,
    ...(typeof d.leadsToCertification === "boolean" ? { leadsToCertification: d.leadsToCertification } : {}),
    ...(typeof d.hasFinalExam === "boolean" ? { hasFinalExam: d.hasFinalExam } : {}),
    ...(typeof d.autoIssueExamPassCertificate === "boolean"
      ? { autoIssueExamPassCertificate: d.autoIssueExamPassCertificate }
      : {}),
  };
}

function CatalogCardSkeleton(): JSX.Element {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className="aspect-[16/10] animate-pulse bg-gradient-to-br from-slate-200 to-slate-300" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
        <div className="flex flex-wrap gap-2 pt-2">
          <div className="h-7 w-24 animate-pulse rounded-full bg-slate-100" />
          <div className="h-7 w-32 animate-pulse rounded-full bg-slate-100" />
        </div>
        <div className="mt-4 flex justify-between border-t border-slate-100 pt-4">
          <div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

export default function CatalogPage(): JSX.Element {
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = Boolean(accessToken);

  const [checkoutCourseId, setCheckoutCourseId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["catalog", "published-courses"],
    queryFn: fetchPublishedCourses,
  });

  const handleCta = useCallback(
    async (courseId: string, price: number | null) => {
      setCheckoutError(null);
      if (!isAuthenticated) {
        navigate(`/login?next=${encodeURIComponent("/katalog")}`);
        return;
      }
      if (price === null || price <= 0) {
        setCheckoutError(
          "Ovaj kurs nema postavljenu cijenu za online kupnju. Javite se podršci ili odaberite drugi program.",
        );
        return;
      }
      setCheckoutCourseId(courseId);
      try {
        const url = await createCheckoutSession(courseId);
        window.location.href = url;
      } catch {
        setCheckoutError(
          "Nije moguće otvoriti Stripe naplatu. Provjerite jeste li prijavljeni i pokušajte ponovo.",
        );
      } finally {
        setCheckoutCourseId(null);
      }
    },
    [isAuthenticated, navigate],
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="text-lg font-bold tracking-tight text-[#1F4E79]"
          >
            CONFORA
          </Link>
          <nav aria-label="Primarna" className="flex items-center gap-3 text-sm font-medium">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-confora-ink"
              >
                Moj prostor
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100"
                >
                  Prijava
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-[#1F4E79] px-4 py-2 text-white shadow-sm transition hover:bg-[#1a4268]"
                >
                  Registracija
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section aria-labelledby="catalog-heading" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div
          className={cn(
            "mb-10 max-w-2xl",
            "bg-grid-slate-700/05 rounded-2xl border border-slate-200/60 bg-white/60 p-6 shadow-sm",
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Katalog
          </p>
          <h1
            id="catalog-heading"
            className="mt-2 text-3xl font-bold tracking-tight text-confora-ink sm:text-4xl"
          >
            Programi i certificirani tečajevi
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Pregledajte objavljene kurseve i nastavite na sigurnu Stripe naplatu. Za kupnju
            morate biti prijavljeni.
          </p>
        </div>

        <div className="mb-8">
          <CertificationCatalogDisclaimer />
        </div>

        {checkoutError ? (
          <div
            className="mb-8 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p>{checkoutError}</p>
          </div>
        ) : null}

        {isPending ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <CatalogCardSkeleton key={i} />
            ))}
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-slate-700">Nismo mogli učitati katalog.</p>
            <button
              type="button"
              className="mt-4 text-sm font-semibold text-brand underline-offset-2 hover:underline"
              onClick={() => void refetch()}
            >
              Pokušaj ponovo
            </button>
          </div>
        ) : null}

        {!isPending && !isError && data ? (
          <>
            {isFetching && !isPending ? (
              <p className="mb-4 text-xs text-slate-500">Osvježavanje…</p>
            ) : null}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {data.map((dto: PublishedCourseDto) => {
                const row = dtoToListRow(dto);
                const enriched = enrichCourseFromListRow(row);
                const hero =
                  dto.heroBannerUrl?.trim() ||
                  dto.thumbnailUrl?.trim() ||
                  null;

                return (
                  <CourseCard
                    key={dto.courseId}
                    courseId={dto.courseId}
                    title={dto.title}
                    description={dto.description?.trim() || enriched.description}
                    learningGoals={
                      dto.learningGoals?.length
                        ? [...dto.learningGoals]
                        : enriched.learningObjectives
                    }
                    heroBannerUrl={hero}
                    price={dto.price}
                    isAuthenticated={isAuthenticated}
                    checkoutLoading={checkoutCourseId === dto.courseId}
                    onCtaClick={() => void handleCta(dto.courseId, dto.price)}
                  />
                );
              })}
            </div>
            {data.length === 0 ? (
              <p className="mt-10 text-center text-sm text-slate-500">
                Trenutno nema objavljenih kurseva.
              </p>
            ) : null}
          </>
        ) : null}
      </section>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} CONFORA LMS
      </footer>
    </div>
  );
}
