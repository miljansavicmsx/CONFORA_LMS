import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  FileText,
  GraduationCap,
  Play,
  ShoppingCart,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useState,
  type JSX,
} from "react";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { EnterpriseAlertBanner } from "@/design-system";
import { api } from "@/lib/api";
import { createCheckoutSession } from "@/lib/catalog-api";
import { pathwayTierFromFlags, pathwayTierLabelHr } from "@/lib/course-pathway";
import { useCourseStore } from "@/store/courseStore";
import { useCourseCartStore } from "@/store/courseCartStore";
import { useAuthStore } from "@/stores/authStore";
import type { Course, CourseLesson, CourseModule } from "@/types/course-detail";
import { cn } from "@/lib/utils";

const EXCERPT_LEN = 300;

const PANEL_SPRING = { type: "spring" as const, damping: 25, stiffness: 200 };

function youtubeEmbedUrl(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/i,
  );
  return m?.[1] ? `https://www.youtube.com/embed/${m[1]}` : null;
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

function LessonTypeIcon({ type }: { readonly type: CourseLesson["type"] }): JSX.Element {
  const cls = "h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]";
  if (type === "video") {
    return <Video className={cls} aria-hidden />;
  }
  if (type === "pdf") {
    return <FileText className={cls} aria-hidden />;
  }
  return <BookOpen className={cls} aria-hidden />;
}

function TabList({
  active,
  onChange,
  baseId,
}: {
  readonly active: TabKey;
  readonly onChange: (t: TabKey) => void;
  readonly baseId: string;
}): JSX.Element {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "pregled", label: "Pregled" },
    { key: "kurikulum", label: "Kurikulum" },
    { key: "instruktor", label: "Instruktor" },
    { key: "recenzije", label: "Recenzije" },
  ];
  return (
    <div
      role="tablist"
      aria-label="Sekcije kursa"
      className="flex gap-1 border-b border-[hsl(var(--border))] pb-px"
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          id={`${baseId}-tab-${t.key}`}
          aria-selected={active === t.key}
          aria-controls={`${baseId}-panel-${t.key}`}
          tabIndex={active === t.key ? 0 : -1}
          className={cn(
            "relative rounded-t-md px-3 py-2 text-sm font-medium transition-colors",
            active === t.key
              ? "text-[#1F4E79]"
              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
          )}
          onClick={() => onChange(t.key)}
        >
          {t.label}
          {active === t.key ? (
            <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#1F4E79]" />
          ) : null}
        </button>
      ))}
    </div>
  );
}

type TabKey = "pregled" | "kurikulum" | "instruktor" | "recenzije";

function PanelContent({
  course,
  activeTab,
  baseId,
}: {
  readonly course: Course;
  readonly activeTab: TabKey;
  readonly baseId: string;
}): JSX.Element {
  const [descExpanded, setDescExpanded] = useState(false);
  const excerpt =
    course.description.length > EXCERPT_LEN && !descExpanded
      ? `${course.description.slice(0, EXCERPT_LEN).trim()}…`
      : course.description;
  const embed = course.promoVideoUrl
    ? youtubeEmbedUrl(course.promoVideoUrl)
    : null;

  if (activeTab === "pregled") {
    return (
      <div
        role="tabpanel"
        id={`${baseId}-panel-pregled`}
        aria-labelledby={`${baseId}-tab-pregled`}
        className="space-y-5 px-4 py-4 sm:px-5"
      >
        {embed ? (
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-black shadow-sm">
            <iframe
              title="Promo video"
              src={embed}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-[hsl(var(--muted))]">
            <img
              src={course.thumbnailUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div>
          <p className="text-sm leading-relaxed text-[hsl(var(--foreground))]">
            {excerpt}
          </p>
          {course.description.length > EXCERPT_LEN ? (
            <button
              type="button"
              className="mt-2 text-sm font-medium text-[#1F4E79] hover:underline"
              onClick={() => setDescExpanded((v) => !v)}
            >
              {descExpanded ? "Prikaži manje" : "Prikaži više"}
            </button>
          ) : null}
        </div>

        <EnterpriseAlertBanner severity="info" icon={Sparkles} title="AI preporuka (informativno)">
          {course.leadsToCertification ? (
            <>
              Program „{course.title}” tipično je koristan ako gradite formalnu certifikaciju osobe — nakon edukacije
              slijedi <span className="font-medium text-[hsl(var(--foreground))]">odvojena</span> prijava i odluka tijela
              za certifikaciju.
            </>
          ) : (
            <>
              Program „{course.title}” prikladan je za dublje razumijevanje teme prije praktičnih projekata u organizaciji.
            </>
          )}
        </EnterpriseAlertBanner>

        {course.learningObjectives.length > 0 ? (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-[hsl(var(--foreground))]">
              Ishodi učenja
            </h3>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-[hsl(var(--muted-foreground))]">
              {course.learningObjectives.slice(0, 8).map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[hsl(var(--foreground))]">
            <GraduationCap className="h-4 w-4 shrink-0 text-[#1F4E79]" aria-hidden />
            Tip programa
          </h3>
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">
            {pathwayTierLabelHr(
              pathwayTierFromFlags({
                hasFinalExam: course.hasFinalExam,
                autoIssueExamPassCertificate: course.autoIssueExamPassCertificate,
                leadsToCertification: course.leadsToCertification,
              }),
            )}
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
            <li>
              <span className="font-medium text-[hsl(var(--foreground))]">Potvrda prolaska ispita</span>{" "}
              (ako je predviđena) dokazuje uspješan završetak provjere znanja u sklopu tečaja — to{" "}
              <span className="font-medium text-[hsl(var(--foreground))]">nije</span> isto što i formalni
              certifikat tijela za certifikaciju.
            </li>
            <li>
              <span className="font-medium text-[hsl(var(--foreground))]">Formalna certifikacija</span> je
              odvojen postupak uz ispunjenje uvjeta sheme; sam upis na tečaj{" "}
              <span className="font-medium text-[hsl(var(--foreground))]">ne</span> znači automatsku
              certifikaciju.
            </li>
          </ul>
          {course.leadsToCertification && course.certificationSchemeReference ? (
            <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
              Referenca sheme:{" "}
              <span className="font-mono text-[hsl(var(--foreground))]">
                {course.certificationSchemeReference}
              </span>
            </p>
          ) : null}
        </div>

        {course.structurePreview.length > 0 || course.moduleCount > 0 ? (
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <h3 className="mb-2 text-sm font-semibold text-[hsl(var(--foreground))]">
              Pregled strukture
            </h3>
            <p className="mb-2 text-xs text-[hsl(var(--muted-foreground))]">
              {course.moduleCount}
              {" "}
              modula ·
              {course.lessonCountTotal}
              {" "}
              lekcija ukupno
            </p>
            {course.structurePreview.length > 0 ? (
              <ul className="space-y-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                {course.structurePreview.map((m, i) => (
                  <li key={i} className="flex justify-between gap-2 border-b border-[hsl(var(--border))]/60 py-1 last:border-0">
                    <span className="min-w-0 text-[hsl(var(--foreground))]">{m.title}</span>
                    <span className="shrink-0 tabular-nums text-xs">
                      {m.lessonCount}
                      {" "}
                      lekcija
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {course.hasFinalExam ? (
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 p-4">
            <h3 className="mb-2 text-sm font-semibold text-[hsl(var(--foreground))]">
              Završni ispit
            </h3>
            <p className="mb-3 text-xs text-[hsl(var(--muted-foreground))]">
              {course.autoIssueExamPassCertificate
                ? "Nakon uspješnog ispita sustav može automatski izdati potvrdu prolaska (exam-pass) u sklopu edukacije."
                : "Provjera znanja je predviđena programom; potvrda o prolazu ovisi o pravilima tog programa."}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[hsl(var(--foreground))] shadow-sm ring-1 ring-[hsl(var(--border))]">
                Pitanja: {course.examQuestionsCount}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[hsl(var(--foreground))] shadow-sm ring-1 ring-[hsl(var(--border))]">
                Prolaznost: {course.examPassingScore}%
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[hsl(var(--foreground))] shadow-sm ring-1 ring-[hsl(var(--border))]">
                Pokušaji: {course.examAttemptsAllowed}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[hsl(var(--foreground))] shadow-sm ring-1 ring-[hsl(var(--border))]">
                Limit:{" "}
                {course.examTimeLimitMinutes != null
                  ? `${course.examTimeLimitMinutes} min`
                  : "—"}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Ovaj program ne uključuje završni ispit.</p>
        )}
      </div>
    );
  }

  if (activeTab === "kurikulum") {
    return (
      <div
        role="tabpanel"
        id={`${baseId}-panel-kurikulum`}
        aria-labelledby={`${baseId}-tab-kurikulum`}
        className="space-y-3 px-4 py-4 sm:px-5"
      >
        {course.modules.map((mod: CourseModule) => (
          <ModuleAccordion key={mod.id} module={mod} />
        ))}
      </div>
    );
  }

  if (activeTab === "instruktor") {
    const ins = course.instructor;
    return (
      <div
        role="tabpanel"
        id={`${baseId}-panel-instruktor`}
        aria-labelledby={`${baseId}-tab-instruktor`}
        className="space-y-4 px-4 py-4 sm:px-5"
      >
        {ins ? (
          <>
            <div className="flex gap-4">
              {ins.avatarUrl ? (
                <img
                  src={ins.avatarUrl}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-[hsl(var(--border))]"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-lg font-bold text-[#1F4E79]">
                  {ins.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-[hsl(var(--foreground))]">
                  {ins.name}
                </p>
                {ins.title ? (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {ins.title}
                  </p>
                ) : null}
              </div>
            </div>
            {ins.bio ? (
              <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                {ins.bio}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Nema podataka o instruktoru.
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-recenzije`}
      aria-labelledby={`${baseId}-tab-recenzije`}
      className="space-y-4 px-4 py-4 sm:px-5"
    >
      {course.reviews.length === 0 ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Još nema recenzija za ovaj kurs.
        </p>
      ) : (
        course.reviews.map((r) => (
          <article
            key={r.id}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-[hsl(var(--foreground))]">
                {r.author}
              </span>
              <span className="text-xs text-amber-600" aria-hidden>
                {"★".repeat(Math.min(5, Math.max(0, r.rating)))}
                {"☆".repeat(5 - Math.min(5, Math.max(0, r.rating)))}
              </span>
            </div>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              {r.comment}
            </p>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              {r.date}
            </p>
          </article>
        ))
      )}
    </div>
  );
}

function ModuleAccordion({ module }: { readonly module: CourseModule }): JSX.Element {
  return (
    <details className="group rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] open:shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-3 text-sm font-medium text-[hsl(var(--foreground))] marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 truncate">{module.title}</span>
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <ul className="space-y-2 border-t border-[hsl(var(--border))] px-3 py-2">
        {module.lessons.map((lesson) => (
          <li
            key={lesson.id}
            className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]"
          >
            <LessonTypeIcon type={lesson.type} />
            <div className="min-w-0 flex-1">
              <span className="text-[hsl(var(--foreground))]">{lesson.title}</span>
              <span className="text-xs">
                {" "}
                · {lesson.durationMinutes}
                min
              </span>
            </div>
            {lesson.isFreePreview ? (
              <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-emerald-600">
                <Play className="h-3.5 w-3.5" aria-hidden />
                Preview
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </details>
  );
}

export function OffCanvasPanel(): JSX.Element {
  const baseId = useId();
  const navigate = useNavigate();
  const isPanelOpen = useCourseStore((s) => s.isPanelOpen);
  const courseData = useCourseStore((s) => s.courseData);
  const isLoading = useCourseStore((s) => s.isLoading);
  const closePanel = useCourseStore((s) => s.closePanel);
  const fetchCourse = useCourseStore((s) => s.fetchCourse);
  const accessToken = useAuthStore((s) => s.accessToken);
  const cartItems = useCourseCartStore((s) => s.items);
  const addPaidCourse = useCourseCartStore((s) => s.addPaidCourse);
  const [activeTab, setActiveTab] = useState<TabKey>("pregled");
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("kurs");
    if (slug) {
      useCourseStore.setState({
        selectedCourseSlug: slug,
        isPanelOpen: true,
      });
      void useCourseStore.getState().fetchCourse(slug);
    }
  }, []);

  useEffect(() => {
    const onPop = (): void => {
      const slug = new URLSearchParams(window.location.search).get("kurs");
      if (!slug) {
        useCourseStore.setState({
          isPanelOpen: false,
          selectedCourseSlug: null,
          courseData: null,
          isLoading: false,
        });
      } else {
        useCourseStore.setState({
          selectedCourseSlug: slug,
          isPanelOpen: true,
        });
        void useCourseStore.getState().fetchCourse(slug);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (!isPanelOpen) {
      return;
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePanel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPanelOpen, closePanel]);

  useEffect(() => {
    document.body.style.overflow = isPanelOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPanelOpen]);

  useEffect(() => {
    if (isPanelOpen) {
      setActiveTab("pregled");
    }
  }, [isPanelOpen, courseData?.slug]);

  const handleOverlayClick = useCallback(() => {
    closePanel();
  }, [closePanel]);

  const handleContinue = useCallback(() => {
    if (courseData?.courseId) {
      navigate(`/learn/${encodeURIComponent(courseData.courseId)}`);
    }
    closePanel();
  }, [closePanel, courseData?.courseId, navigate]);

  const handleFreeEnroll = useCallback(async () => {
    if (!courseData) {
      return;
    }
    setActionError(null);
    if (!accessToken) {
      navigate(`/login?next=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}`);
      return;
    }
    setEnrollLoading(true);
    try {
      await api.post("/api/me/enrollments", { courseId: courseData.courseId });
      await fetchCourse(courseData.slug);
    } catch {
      setActionError("Upis nije uspio. Ako kurs nije besplatan, koristite naplatu.");
    } finally {
      setEnrollLoading(false);
    }
  }, [accessToken, courseData, fetchCourse, navigate]);

  const handleCheckoutSingle = useCallback(async () => {
    if (!courseData || courseData.price <= 0) {
      return;
    }
    setActionError(null);
    if (!accessToken) {
      navigate(`/login?next=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}`);
      return;
    }
    setCheckoutLoading(true);
    try {
      const url = await createCheckoutSession(courseData.courseId);
      window.location.href = url;
    } catch {
      setActionError("Nije moguće otvoriti naplatu. Pokušajte ponovo.");
    } finally {
      setCheckoutLoading(false);
    }
  }, [accessToken, courseData, navigate]);

  const handleAddToCart = useCallback(() => {
    if (!courseData || courseData.price <= 0) {
      return;
    }
    setActionError(null);
    addPaidCourse({
      courseId: courseData.courseId,
      slug: courseData.slug,
      title: courseData.title,
      price: courseData.price,
    });
  }, [addPaidCourse, courseData]);

  const handleCheckoutCart = useCallback(async () => {
    setActionError(null);
    if (!accessToken) {
      navigate(`/login?next=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}`);
      return;
    }
    const ids = cartItems.map((i) => i.courseId);
    if (ids.length === 0) {
      setActionError("Košarica je prazna.");
      return;
    }
    setCheckoutLoading(true);
    try {
      const url =
        ids.length === 1
          ? await createCheckoutSession(ids[0]!)
          : await createCheckoutSession({ courseIds: ids });
      window.location.href = url;
    } catch {
      setActionError("Nije moguće otvoriti naplatu za košaricu.");
    } finally {
      setCheckoutLoading(false);
    }
  }, [accessToken, cartItems, navigate]);

  return (
    <AnimatePresence>
      {isPanelOpen ? (
        <>
          <motion.div
            key="offcanvas-overlay"
            role="presentation"
            aria-hidden
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleOverlayClick}
          />
          <motion.aside
            key="offcanvas-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${baseId}-title`}
            className="fixed right-0 top-0 z-[101] flex h-full w-full max-w-full flex-col bg-[hsl(var(--card))] shadow-2xl sm:w-[480px] sm:max-w-[480px]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={PANEL_SPRING}
          >
            <header className="sticky top-0 z-10 flex shrink-0 items-center gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]/95 px-4 py-3 backdrop-blur-sm">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label="Zatvori panel"
                onClick={closePanel}
              >
                <X className="h-5 w-5" />
              </Button>
              <h2
                id={`${baseId}-title`}
                className="min-w-0 flex-1 truncate text-base font-semibold text-[hsl(var(--foreground))]"
              >
                {courseData?.title ?? "Kurs"}
              </h2>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-20 text-sm text-[hsl(var(--muted-foreground))]">
                  Učitavanje…
                </div>
              ) : !courseData ? (
                <div className="space-y-4 px-4 py-8 text-center">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Kurs nije pronađen ili API nije dostupan.
                  </p>
                  <Button type="button" variant="outline" onClick={closePanel}>
                    Zatvori
                  </Button>
                </div>
              ) : (
                <>
                  <div className="sticky top-0 z-[1] border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 pt-3 sm:px-5">
                    <TabList
                      active={activeTab}
                      onChange={setActiveTab}
                      baseId={baseId}
                    />
                  </div>
                  <PanelContent
                    course={courseData}
                    activeTab={activeTab}
                    baseId={baseId}
                  />
                </>
              )}
            </div>

            {courseData && !isLoading ? (
              <footer className="sticky bottom-0 z-10 space-y-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/95 p-4 backdrop-blur-sm">
                {cartItems.length > 0 ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">
                    <span className="inline-flex items-center gap-1 font-medium text-[hsl(var(--foreground))]">
                      <ShoppingCart className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      Košarica:
                      {cartItems.length}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 shrink-0 text-xs"
                      disabled={checkoutLoading}
                      onClick={() => void handleCheckoutCart()}
                    >
                      Plati zajedno
                    </Button>
                  </div>
                ) : null}

                {actionError ? (
                  <p className="text-xs text-red-600" role="alert">
                    {actionError}
                  </p>
                ) : null}

                {courseData.enrolled ? (
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      className="w-full gap-2 bg-[#1F4E79] font-semibold text-white hover:opacity-90"
                      onClick={handleContinue}
                    >
                      <Play className="h-4 w-4" />
                      Nastavi učenje
                    </Button>
                    {courseData.leadsToCertification ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-[#1F4E79]/40 text-sm font-semibold text-[#1F4E79]"
                        asChild
                      >
                        <Link to="/dashboard/certification/applications">
                          Certifikacija — odvojena prijava
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                ) : courseData.price <= 0 ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold text-[hsl(var(--foreground))]">Besplatno</p>
                    <Button
                      type="button"
                      className="w-full bg-[#1F4E79] font-semibold text-white hover:opacity-90"
                      disabled={enrollLoading}
                      aria-busy={enrollLoading}
                      onClick={() => void handleFreeEnroll()}
                    >
                      {enrollLoading ? "Upisujem…" : "Dodaj kurs / Upiši se"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold text-[hsl(var(--foreground))]">
                      {formatMoney(courseData.price, courseData.currency)}
                    </p>
                    <Button
                      type="button"
                      className="w-full bg-[#1F4E79] font-semibold text-white hover:opacity-90"
                      disabled={checkoutLoading}
                      aria-busy={checkoutLoading}
                      onClick={() => void handleCheckoutSingle()}
                    >
                      {checkoutLoading ? "Otvaranje naplate…" : "Kupi i plati (ovaj kurs)"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full font-semibold"
                      disabled={checkoutLoading}
                      onClick={handleAddToCart}
                    >
                      Dodaj u košaricu
                    </Button>
                    <p className="text-[11px] leading-snug text-[hsl(var(--muted-foreground))]">
                      Plaćanje se nastavlja kroz finansijski modul (naplata putem platforme). Ako trebate AMF / članarinu,
                      koristite <Link className="font-medium text-[#1F4E79] underline" to="/dashboard/billing">
                        Financije
                      </Link>
                      .
                    </p>
                    {courseData.leadsToCertification ? (
                      <p className="text-[11px] leading-snug text-[hsl(var(--muted-foreground))]">
                        Kupnja omogućava pristup edukaciji. Formalna certifikacija po shemi je zaseban postupak nakon
                        ispunjenja uvjeta.
                      </p>
                    ) : null}
                  </div>
                )}
              </footer>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
