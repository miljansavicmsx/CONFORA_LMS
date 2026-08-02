/**
 * LMS katalog + moji kursevi — katalog s filtrom oblasti, pretragom i mini korpom (frontend-only).
 */

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useMemo, useState, type JSX } from "react";
import { Link, useNavigate } from "react-router";

import {
  CourseCatalogFilterBar,
  CourseCatalogHero,
  CourseMiniCart,
} from "@/components/learning";
import { CertificationLexiconBanner } from "@/components/learner/CertificationLexiconBanner";
import { CourseCard, type CourseCardProps } from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EnterpriseEmptyState,
  EnterpriseSectionHeader,
  GovernanceCard,
  LearningCard,
  MetricCard,
  ds,
} from "@/design-system";
import { fetchPublishedCourses } from "@/lib/catalog-api";
import type { CourseListRow } from "@/lib/enrich-course-detail";
import {
  courseRowPathwayFlags,
  getCourseListDescriptionPreview,
  pathwayTierForCourseRow,
} from "@/lib/enrich-course-detail";
import {
  courseMatchesLmsCatalogArea,
  courseMatchesSearchQuery,
  type LmsCatalogAreaId,
} from "@/lib/lms-catalog-areas";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useCourseCartStore } from "@/store/courseCartStore";
import { useCourseStore } from "@/store/courseStore";
import { useAuthStore } from "@/stores/authStore";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
  },
} as const;

const LEVELS = ["Pocetni", "Srednji", "Napredni", "Ekspertni"] as const;

const PILOT_DEMO_SLUG = "demo-certification-course";

type EnrollmentRow = {
  readonly courseId: string;
  readonly enrolledAt?: string | null;
  readonly overallProgress?: number | null;
  readonly examPassed?: boolean | null;
  readonly enrollmentStatus?: string | null;
  readonly courseCompletionStatus?: string | null;
};

function normalizeLevel(raw: string): (typeof LEVELS)[number] {
  const t = raw.trim();
  if (LEVELS.includes(t as (typeof LEVELS)[number])) {
    return t as (typeof LEVELS)[number];
  }
  return "Srednji";
}

function enrollmentFor(row: CourseListRow, enrollments: readonly EnrollmentRow[]): EnrollmentRow | undefined {
  return enrollments.find((e) => e.courseId === row.courseId);
}

function ctaForCourse(row: CourseListRow, enrollment?: EnrollmentRow): string {
  const progress = enrollment?.overallProgress ?? 0;
  const completed =
    String(enrollment?.courseCompletionStatus ?? "").toUpperCase() === "COURSE_COMPLETED" || progress >= 100;
  if (completed && row.hasFinalExam !== false && !enrollment?.examPassed) {
    return "Pokreni ispit";
  }
  if (completed) {
    return "Završen kurs";
  }
  if (enrollment && String(enrollment.enrollmentStatus ?? "active").toLowerCase() === "active") {
    return "Nastavi učenje";
  }
  const price = row.price ?? 0;
  if (row.slug === PILOT_DEMO_SLUG) {
    return "Dodaj kurs";
  }
  return price > 0 ? "Kupi" : "Dodaj kurs";
}

function catalogRowToCardProps(
  row: CourseListRow,
  enrollments: readonly EnrollmentRow[],
  navigate: (to: string) => void,
): CourseCardProps {
  const openPanel = useCourseStore.getState().openPanel;
  const price = row.price ?? 0;
  const pf = courseRowPathwayFlags(row);
  const enrollment = enrollmentFor(row, enrollments);
  const progressPct = enrollment?.overallProgress ?? undefined;
  const ctaLabel = ctaForCourse(row, enrollment);
  const primaryAction = () => {
    if (ctaLabel === "Nastavi učenje") {
      navigate(`/learn/${encodeURIComponent(row.courseId)}`);
      return;
    }
    if (ctaLabel === "Pokreni ispit") {
      navigate("/dashboard/exams");
      return;
    }
    openPanel(row.slug);
  };
  return {
    courseId: row.courseId,
    title: row.title,
    slug: row.slug,
    thumbnailUrl:
      row.thumbnailUrl?.trim() ||
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&h=360&fit=crop",
    domain: row.domain?.trim() || "Općenito",
    level: normalizeLevel(String(row.level || "Srednji")),
    durationHours: row.durationHours || 1,
    modulesCount: row.moduleCount ?? 4,
    price,
    currency: "EUR",
    pathwayTier: pathwayTierForCourseRow(row),
    catalogStatus: String(row.status || "published"),
    hasFinalExam: pf.hasFinalExam,
    badges: [],
    shortDescription: getCourseListDescriptionPreview(row),
    ...(enrollment?.enrolledAt ? { enrolledAt: enrollment.enrolledAt } : {}),
    ...(progressPct !== undefined && progressPct !== null ? { progressPct } : {}),
    ctaLabel,
    secondaryCtaLabel: "Detalji",
    onClick: () => {
      openPanel(row.slug);
    },
    onPrimaryAction: primaryAction,
    ctaTone: "brand",
  };
}

function CourseCardGrid({ cards }: { readonly cards: readonly CourseCardProps[] }): JSX.Element {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((props) => (
        <CourseCard key={props.courseId} {...props} />
      ))}
    </div>
  );
}

export default function LearnerCoursesPage(): JSX.Element {
  const [selectedArea, setSelectedArea] = useState<LmsCatalogAreaId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role ?? "learner");
  const cartItems = useCourseCartStore((s) => s.items);
  const restrictedCatalogView = role === "tech_committee" || role === "cert_committee";

  const {
    data: catalogRows,
    isPending: catalogPending,
    isError: catalogError,
    refetch: refetchCatalog,
  } = useQuery({
    queryKey: ["dashboard", "catalog", "courses"],
    queryFn: () => fetchPublishedCourses(),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["me", "enrollments"],
    queryFn: async () => {
      const { data } = await api.get<EnrollmentRow[]>("/api/me/enrollments");
      return data;
    },
    enabled: !restrictedCatalogView,
  });

  const filteredRows = useMemo(() => {
    const rows = catalogRows ?? [];
    return rows.filter(
      (row) => courseMatchesLmsCatalogArea(row, selectedArea) && courseMatchesSearchQuery(row, searchQuery),
    );
  }, [catalogRows, selectedArea, searchQuery]);

  const { inProgressRows, completedRows, discoverRows } = useMemo(() => {
    const enrollMap = new Map(enrollments.map((e) => [e.courseId, e]));
    const inProgress: CourseListRow[] = [];
    const completed: CourseListRow[] = [];
    const discover: CourseListRow[] = [];
    for (const row of filteredRows) {
      const e = enrollMap.get(row.courseId);
      const progress = e?.overallProgress ?? 0;
      const comp =
        String(e?.courseCompletionStatus ?? "").toUpperCase() === "COURSE_COMPLETED" || progress >= 100;
      if (comp) {
        completed.push(row);
      } else if (e && String(e.enrollmentStatus ?? "active").toLowerCase() === "active") {
        inProgress.push(row);
      } else {
        discover.push(row);
      }
    }
    return { inProgressRows: inProgress, completedRows: completed, discoverRows: discover };
  }, [filteredRows, enrollments]);

  const recommendedRows = useMemo(() => discoverRows.slice(0, 3), [discoverRows]);

  const toCards = (rows: readonly CourseListRow[]) => rows.map((row) => catalogRowToCardProps(row, enrollments, navigate));

  const filteredCatalogCards = useMemo(
    () => toCards(filteredRows),
    [filteredRows, enrollments, navigate],
  );

  const continueHref =
    inProgressRows[0]?.courseId != null
      ? `/learn/${encodeURIComponent(inProgressRows[0].courseId)}`
      : undefined;

  const activeEnrollments = enrollments.filter(
    (e) => String(e.enrollmentStatus ?? "active").toLowerCase() === "active",
  );

  return (
    <div className="relative min-h-0 flex-1 overflow-auto px-4 py-8 text-text-primary lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-grid-slate-700/05" aria-hidden />

      <CourseMiniCart open={cartOpen} onOpenChange={setCartOpen} />

      <motion.div
        className="relative mx-auto max-w-6xl space-y-8"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      >
        <motion.header variants={fadeUp} className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <CourseCatalogHero
              aiHint="Krenite od programa koji najviše odgovara vašoj ulozi; certifikacija po shemi je uvijek odvojen korak nakon edukacije."
              {...(continueHref ? { continueHref, showContinue: true } : { showContinue: false })}
            />
            <div className="flex shrink-0 flex-wrap gap-2 self-end sm:self-start">
              <Button
                type="button"
                variant="outline"
                className="shrink-0 border-brand/50 text-brand"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="mr-2 h-4 w-4" aria-hidden />
                Korpa ({cartItems.length})
              </Button>
              <Button type="button" variant="outline" className="shrink-0 border-border/60" asChild>
                <Link to="/katalog">Javni katalog</Link>
              </Button>
              <Button type="button" className="shrink-0 bg-brand text-white hover:bg-brand/90" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
          <CertificationLexiconBanner variant="compact" />
        </motion.header>

        <motion.section variants={fadeUp} className={cn(ds.gridOps, "md:grid-cols-3")}>
          <LearningCard ariaLabel="Sažetak aktivnih programa" heading="Aktivni kursevi" density="compact">
            <p className={cn(ds.typography.mono, "!mt-0 text-2xl font-bold text-text-primary")}>{activeEnrollments.length}</p>
            <p className="mt-1 text-xs text-text-secondary">Upisi dostupni za nastavak u playeru.</p>
          </LearningCard>
          <MetricCard ariaLabel="Broj programa u frontend korpi" heading="Korpa (frontend)">
            <p className={cn(ds.typography.mono, "!mt-0 text-2xl font-bold text-text-primary")}>{cartItems.length}</p>
            <p className="mt-1 text-xs text-text-secondary">Naplata se završava u finansijskom modulu.</p>
          </MetricCard>
          <GovernanceCard ariaLabel="Podsjetnik certifikacijskog puta" heading="Certifikacija" density="compact">
            <p className={cn(ds.typography.body, "!mt-0 font-semibold text-text-primary")}>
              Kurs + ispit ≠ certifikacija osobe
            </p>
            <p className="mt-1 text-xs text-text-secondary">PERSON_CERTIFICATION je odvojen postupak.</p>
          </GovernanceCard>
        </motion.section>

        {restrictedCatalogView ? (
          <motion.section variants={fadeUp} className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5">
            <p className="text-sm font-semibold text-text-primary">Ova uloga nema katalog za kupovinu.</p>
            <p className="mt-2 text-sm text-text-secondary">
              Komiteti rade validaciju sadržaja, pitanja ili odluke. Za operativni rad koristite odgovarajuće ISO/admin
              rute.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {role === "tech_committee" ? (
                <>
                  <Button asChild type="button" className="bg-brand text-white hover:bg-brand/90">
                    <Link to="/dashboard/admin/item-bank">Pitanja za validaciju</Link>
                  </Button>
                  <Button asChild type="button" variant="outline" className="border-border/60">
                    <Link to="/dashboard/admin/sadrzaj">Obuke za validaciju</Link>
                  </Button>
                </>
              ) : (
                <Button asChild type="button" className="bg-brand text-white hover:bg-brand/90">
                  <Link to="/dashboard/iso/decisions">Odluke certifikacije</Link>
                </Button>
              )}
            </div>
          </motion.section>
        ) : null}

        {!restrictedCatalogView ? (
          <motion.section variants={fadeUp} className="space-y-6">
            <CourseCatalogFilterBar
              selectedArea={selectedArea}
              onAreaChange={setSelectedArea}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {inProgressRows.length > 0 ? (
              <div className="space-y-3">
                <EnterpriseSectionHeader
                  eyebrow="Moji programi"
                  title="U tijeku"
                  description="Nastavite učenje u playeru ili otvorite detalje programa."
                  titleLevel="h2"
                />
                <CourseCardGrid cards={toCards(inProgressRows)} />
              </div>
            ) : null}

            {completedRows.length > 0 ? (
              <div className="space-y-3">
                <EnterpriseSectionHeader
                  eyebrow="Arhiva učenja"
                  title="Završeno"
                  description="Programi s potpunim napretkom ili završnim statusom u API-ju."
                  titleLevel="h2"
                />
                <CourseCardGrid cards={toCards(completedRows)} />
              </div>
            ) : null}

            {recommendedRows.length > 0 ? (
              <div className="space-y-3">
                <EnterpriseSectionHeader
                  eyebrow="Za vas"
                  title="Preporučeno"
                  description="Novi programi koje još niste upisali (prvi iz kataloga u ovom filtru)."
                  titleLevel="h2"
                />
                <CourseCardGrid cards={toCards(recommendedRows)} />
              </div>
            ) : null}

            <div id="catalog-all" className="space-y-3 scroll-mt-24">
              <EnterpriseSectionHeader
                eyebrow="Katalog"
                title="Svi programi u filtru"
                description="Kartice otvaraju detalje (off-canvas) — upis i naplata ostaju na postojećim tokovima."
                titleLevel="h2"
              />
              {catalogPending ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  <Skeleton className="h-52 rounded-xl" />
                  <Skeleton className="h-52 rounded-xl" />
                  <Skeleton className="h-52 rounded-xl" />
                </div>
              ) : catalogError ? (
                <div className="rounded-xl border border-border/50 bg-surface-secondary/40 p-6 text-sm text-text-secondary">
                  <p>Nije moguće učitati katalog.</p>
                  <button type="button" className="mt-3 text-brand underline" onClick={() => void refetchCatalog()}>
                    Pokušaj ponovo
                  </button>
                </div>
              ) : filteredCatalogCards.length > 0 ? (
                <CourseCardGrid cards={filteredCatalogCards} />
              ) : (
                <EnterpriseEmptyState
                  title="Nema programa za ovaj filtrirani prikaz"
                  description="Pokušajte promijeniti oblast, pretražiti po nazivu ili kontaktirati organizaciju za novi program."
                  primary={[
                    { label: "Predložite novu obuku", to: "/dashboard/support" },
                    { label: "Osvježi katalog", to: "/dashboard/courses" },
                  ]}
                />
              )}
            </div>
          </motion.section>
        ) : null}
      </motion.div>
    </div>
  );
}
