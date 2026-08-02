import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { BookOpen, Check, GraduationCap, LayoutList, Loader2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from "react";
import { Link, Navigate, useParams } from "react-router";

import { AiTutorFloating } from "@/components/course-player/AiTutorFloating";
import { CoursePlayerHeader } from "@/components/course-player/CoursePlayerHeader";
import { PlayerNotesPanel } from "@/components/course-player/PlayerNotesPanel";
import { CourseTOC } from "@/components/CourseTOC";
import { LessonContent } from "@/components/LessonContent";
import {
  AiTutorPanel,
  ExamReadinessBanner,
  LearningCertificationPathwayCard,
  LearningProgressRing,
  QuizCheckpointCard,
} from "@/components/learning";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchCourseProgress } from "@/lib/api-course-progress";
import { MOCK_COURSE_OUTLINE } from "@/data/mock-course-outline";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { fetchCourseStructure } from "@/lib/course-structure-api";
import type { CourseListRow } from "@/lib/enrich-course-detail";
import { api } from "@/lib/api";
import { useCoursePlayerStore } from "@/store/coursePlayerStore";
import { useAiTutorPlayerStore } from "@/store/aiTutorPlayerStore";
import { useAuthStore } from "@/stores/authStore";
import type { CourseOutline, LessonNode, ModuleNode } from "@/types/course-player";
import { cn } from "@/lib/utils";

const devSkipAuthGuard =
  import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH_GUARD === "true";

function sortedModules(mods: readonly ModuleNode[]): ModuleNode[] {
  return [...mods].sort((a, b) => a.order - b.order);
}

function flattenLessons(outline: CourseOutline): { moduleId: string; lesson: LessonNode }[] {
  const out: { moduleId: string; lesson: LessonNode }[] = [];
  for (const m of sortedModules(outline.modules)) {
    for (const l of m.lessons) {
      out.push({ moduleId: m.id, lesson: l });
    }
  }
  return out;
}

function findLesson(
  outline: CourseOutline,
  moduleId: string | null,
  lessonId: string | null,
): LessonNode | null {
  if (!moduleId || !lessonId) {
    return null;
  }
  const mod = outline.modules.find((m) => m.id === moduleId);
  return mod?.lessons.find((l) => l.id === lessonId) ?? null;
}

function PlayerLoadingShell(): JSX.Element {
  return (
    <div className="dark flex h-svh flex-col items-center justify-center gap-4 bg-surface-primary text-text-primary">
      <Loader2 className="h-10 w-10 animate-spin text-brand" aria-label="Učitavanje kursa" />
      <p className="text-sm text-text-muted">Učitavanje strukture kursa…</p>
    </div>
  );
}

export default function CoursePlayer(): JSX.Element {
  const { courseId = "" } = useParams<{ courseId: string }>();

  const accessToken = useAuthStore((s) => s.accessToken);

  const queryClient = useQueryClient();
  const initCourse = useCoursePlayerStore((s) => s.initCourse);
  const reset = useCoursePlayerStore((s) => s.reset);
  const setCurrentLesson = useCoursePlayerStore((s) => s.setCurrentLesson);
  const markLessonComplete = useCoursePlayerStore((s) => s.markLessonComplete);
  const hydrateLessonProgress = useCoursePlayerStore((s) => s.hydrateLessonProgress);
  const isCompleted = useCoursePlayerStore((s) => s.isCompleted);
  const lessonProgress = useCoursePlayerStore((s) => s.lessonProgress);
  const currentModuleId = useCoursePlayerStore((s) => s.currentModuleId);
  const currentLessonId = useCoursePlayerStore((s) => s.currentLessonId);

  const setPlayerContext = useAiTutorPlayerStore((s) => s.setPlayerContext);
  const resetConversation = useAiTutorPlayerStore((s) => s.resetConversation);
  const abortAiStream = useAiTutorPlayerStore((s) => s.abortStream);

  const [tocOpen, setTocOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);
  type MobilePlayerTab = "lesson" | "toc" | "ai" | "progress";
  const [mobileTab, setMobileTab] = useState<MobilePlayerTab>("lesson");
  const [completionAnnounce, setCompletionAnnounce] = useState("");

  const useRealApi = Boolean(accessToken) && Boolean(courseId) && !devSkipAuthGuard;

  const structureQuery = useQuery({
    queryKey: ["courseStructure", courseId],
    queryFn: () => fetchCourseStructure(courseId),
    enabled: useRealApi,
    retry: false,
  });

  const progressQuery = useQuery({
    queryKey: ["courseProgress", courseId],
    queryFn: () => fetchCourseProgress(courseId),
    enabled: useRealApi && Boolean(courseId),
    retry: false,
  });

  const courseMetaQuery = useQuery({
    queryKey: ["courseCatalogRow", courseId],
    queryFn: async () => {
      const { data } = await api.get<CourseListRow[]>("/api/courses");
      return data.find((c) => c.courseId === courseId) ?? null;
    },
    enabled: useRealApi && Boolean(courseId),
    staleTime: 60_000,
  });

  const mockOutline = useMemo((): CourseOutline => {
    if (courseId && courseId !== MOCK_COURSE_OUTLINE.courseId) {
      return { ...MOCK_COURSE_OUTLINE, courseId, title: `Kurs ${courseId}` };
    }
    return MOCK_COURSE_OUTLINE;
  }, [courseId]);

  const outline: CourseOutline | null = useMemo(() => {
    if (useRealApi) {
      return structureQuery.data ?? null;
    }
    return mockOutline;
  }, [mockOutline, structureQuery.data, useRealApi]);

  const flat = useMemo(() => (outline ? flattenLessons(outline) : []), [outline]);
  const totalLessons = flat.length;

  const { quizLessonsTotal, quizLessonsCompleted } = useMemo(() => {
    let total = 0;
    let done = 0;
    for (const { lesson } of flat) {
      if (lesson.contentType === "quiz") {
        total += 1;
        if (lessonProgress[lesson.id]) {
          done += 1;
        }
      }
    }
    return { quizLessonsTotal: total, quizLessonsCompleted: done };
  }, [flat, lessonProgress]);

  const hasFinalExam = courseMetaQuery.data?.hasFinalExam !== false;
  const leadsToCertification = courseMetaQuery.data?.leadsToCertification === true;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (window.innerWidth < 768) {
      setTocOpen(false);
    }
    if (window.matchMedia("(min-width: 1280px)").matches) {
      setNotesOpen(true);
    }
  }, []);

  const currentIndex = useMemo(() => {
    if (!currentLessonId) {
      return -1;
    }
    return flat.findIndex((x) => x.lesson.id === currentLessonId);
  }, [flat, currentLessonId]);

  const currentLesson = useMemo(
    () => (outline ? findLesson(outline, currentModuleId, currentLessonId) : null),
    [outline, currentModuleId, currentLessonId],
  );

  const currentModule = useMemo(
    () => outline?.modules.find((m) => m.id === currentModuleId),
    [outline?.modules, currentModuleId],
  );

  useEffect(() => {
    if (!outline?.courseId || !currentModuleId) {
      setPlayerContext(null);
      return;
    }
    setPlayerContext({
      courseId: outline.courseId,
      moduleId: currentModuleId,
      lessonId: currentLessonId,
      lessonTitle: currentLesson?.title ?? null,
      moduleTitle: currentModule?.title ?? null,
    });
  }, [
    outline?.courseId,
    currentModuleId,
    currentLessonId,
    currentLesson?.title,
    currentModule?.title,
    setPlayerContext,
  ]);

  useEffect(
    () => () => {
      abortAiStream();
    },
    [abortAiStream],
  );

  useEffect(() => {
    if (!outline) {
      return;
    }
    resetConversation();
  }, [outline?.courseId, resetConversation]);

  useEffect(() => {
    if (!outline) {
      return;
    }
    initCourse(outline.courseId);
    const first = flat[0];
    if (first) {
      setCurrentLesson(first.moduleId, first.lesson.id);
    }
    return () => reset();
  }, [outline?.courseId, initCourse, reset, setCurrentLesson, flat, outline]);

  useEffect(() => {
    const lessons = progressQuery.data?.lessons;
    if (!lessons?.length) {
      return;
    }
    const m: Record<string, boolean> = {};
    for (const row of lessons) {
      if (row.completed) {
        m[row.lessonId] = true;
      }
    }
    hydrateLessonProgress(m);
  }, [progressQuery.data, hydrateLessonProgress]);

  const handleSelectLesson = useCallback(
    (moduleId: string, lessonId: string) => {
      setCurrentLesson(moduleId, lessonId);
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setTocOpen(false);
      }
    },
    [setCurrentLesson],
  );

  const goPrev = useCallback(() => {
    if (currentIndex <= 0) {
      return;
    }
    const prev = flat[currentIndex - 1];
    if (prev) {
      setCurrentLesson(prev.moduleId, prev.lesson.id);
    }
  }, [currentIndex, flat, setCurrentLesson]);

  const goNext = useCallback(() => {
    if (currentIndex < 0 || currentIndex >= flat.length - 1) {
      return;
    }
    const next = flat[currentIndex + 1];
    if (next) {
      setCurrentLesson(next.moduleId, next.lesson.id);
    }
  }, [currentIndex, flat, setCurrentLesson]);

  const handleMarkComplete = useCallback(() => {
    if (currentLessonId) {
      markLessonComplete(currentLessonId);
      if (useRealApi && courseId) {
        void queryClient.invalidateQueries({ queryKey: ["courseProgress", courseId] });
      }
    }
  }, [currentLessonId, markLessonComplete, useRealApi, courseId, queryClient]);

  const canPrev = currentIndex > 0;
  const canNext = currentIndex >= 0 && currentIndex < flat.length - 1;
  const lessonDone = currentLessonId ? isCompleted(currentLessonId) : false;

  const announceEpoch = useRef("");
  useEffect(() => {
    if (!outline || !lessonDone || !currentLessonId) {
      return;
    }
    const title = currentLesson?.title ?? "Lekcija";
    const stamp = `${currentLessonId}-done`;
    if (announceEpoch.current === stamp) {
      return;
    }
    announceEpoch.current = stamp;
    setCompletionAnnounce(`Lekcija „${title}” označena kao završena.`);
  }, [outline, lessonDone, currentLessonId, currentLesson?.title]);

  const [isXlViewport, setIsXlViewport] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    setIsXlViewport(mq.matches);
    const onChange = (): void => setIsXlViewport(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useActivityTracker(currentLessonId, {
    enabled: Boolean(currentLessonId) && Boolean(outline),
    courseId: courseId || null,
  });

  if (!courseId) {
    return (
      <div className="dark flex min-h-svh items-center justify-center bg-surface-primary p-6 text-text-primary">
        <p className="text-sm text-text-muted">Nedostaje identifikator kursa u URL-u.</p>
      </div>
    );
  }

  if (!devSkipAuthGuard && !accessToken) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(`/learn/${courseId}`)}`}
        replace
      />
    );
  }

  if (useRealApi && structureQuery.isPending) {
    return <PlayerLoadingShell />;
  }

  if (useRealApi && structureQuery.isError) {
    const status = axios.isAxiosError(structureQuery.error)
      ? structureQuery.error.response?.status
      : undefined;
    if (status === 401) {
      return <Navigate to={`/login?next=${encodeURIComponent(`/learn/${courseId}`)}`} replace />;
    }
    if (status === 403) {
      return (
        <div className="dark flex min-h-svh flex-col items-center justify-center gap-4 bg-surface-primary p-8 text-center text-text-primary">
          <p className="max-w-md text-sm text-text-secondary">
            Niste upisani na ovaj kurs ili nemate pristup. Upišite se putem kataloga ili kontaktirajte
            administratora.
          </p>
          <Button asChild className="bg-brand text-white hover:bg-brand/90">
            <Link to="/dashboard">Natrag na nadzornu ploču</Link>
          </Button>
        </div>
      );
    }
    return (
      <div className="dark flex min-h-svh flex-col items-center justify-center gap-4 bg-surface-primary p-8 text-text-primary">
        <p className="text-sm text-text-muted">Ne možemo učitati kurs.</p>
        <Button type="button" variant="outline" onClick={() => void structureQuery.refetch()}>
          Pokušaj ponovo
        </Button>
        <Button asChild variant="ghost" className="text-brand">
          <Link to="/dashboard">Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (!outline || totalLessons === 0) {
    return (
      <div className="dark flex min-h-svh flex-col items-center justify-center gap-3 bg-surface-primary p-8 text-text-primary">
        <p className="text-sm text-text-muted">Kurs nema lekcija ili struktura je prazna.</p>
        <Button asChild variant="outline">
          <Link to="/dashboard">Natrag</Link>
        </Button>
      </div>
    );
  }

  const lessonTitle = currentLesson?.title ?? "Lekcija";
  const lessonOrdinal = currentIndex >= 0 ? currentIndex + 1 : 0;

  const pct = progressQuery.data?.completionPercent ?? 0;
  const courseDone = progressQuery.data?.courseCompletionStatus === "COURSE_COMPLETED";
  const resumeId = progressQuery.data?.resumeLessonId ?? null;

  const progressData = progressQuery.data;
  const playerRailSections = (
    <>
      {useRealApi && progressData ? (
        <>
          <LearningProgressRing
            value={pct}
            label={`Ukupni napredak ${pct}%`}
            caption="Obavezne lekcije prema API-ju"
          />
          <div className="mt-4">
            <ExamReadinessBanner
              courseId={courseId}
              completionPercent={pct}
              mandatoryCompleted={progressData.mandatoryCompleted}
              mandatoryTotal={progressData.mandatoryTotal}
              courseCompleted={courseDone}
              hasFinalExam={hasFinalExam}
            />
          </div>
        </>
      ) : (
        <p className="text-xs text-text-muted">Napredak će biti dostupan nakon prijave i sinkronizacije.</p>
      )}
      <AiTutorPanel className="mt-4" />
      {currentLesson?.contentType === "quiz" ? (
        <div className="mt-4">
          <QuizCheckpointCard
            passed={lessonDone}
            body="Kviz u ovoj lekciji služi kao checkpoint prije završnog ispita. Službeni pokušaji i prolaznost ostaju u modulu ispita."
            {...(lessonDone
              ? {
                  scoreLabel: "Kviz-lekcija je označena završenom u playeru (lokalno / API).",
                }
              : {})}
          />
        </div>
      ) : null}
      <div className="mt-4">
        <LearningCertificationPathwayCard
          completionPercent={pct}
          courseCompleted={courseDone}
          hasFinalExam={hasFinalExam}
          leadsToCertification={leadsToCertification}
          quizLessonsTotal={quizLessonsTotal}
          quizLessonsCompleted={quizLessonsCompleted}
        />
      </div>
      <PlayerNotesPanel
        hideAiTrigger
        className="mt-4 max-h-72 min-h-0 shrink-0 border-t border-border/30 bg-transparent pt-4 xl:max-h-[min(40vh,22rem)] xl:border-l-0"
      />
    </>
  );

  const showLessonPane = isXlViewport || mobileTab === "lesson";

  return (
    <div className="dark flex h-svh flex-col overflow-hidden bg-surface-primary text-text-primary">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {completionAnnounce}
      </div>
      <CoursePlayerHeader
        courseTitle={outline.title}
        lessonTitle={lessonTitle}
        lessonIndexDisplay={lessonOrdinal}
        totalLessons={totalLessons}
        tocOpen={tocOpen}
        onToggleToc={() => setTocOpen((v) => !v)}
        notesOpen={notesOpen}
        onToggleNotes={() => setNotesOpen((v) => !v)}
      />

      {useRealApi && progressQuery.data ? (
        <div
          className="fixed left-0 right-0 top-14 z-[65] border-b border-border/20 bg-surface-primary/95 px-3 py-2 backdrop-blur-md sm:px-4"
          role="status"
          aria-label="Napredak kursa"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between gap-2 text-xs text-text-muted">
                <span>Napredak (obavezne lekcije)</span>
                <span className="tabular-nums font-medium text-text-secondary">{pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-2 rounded-full bg-brand transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                />
              </div>
              {resumeId && !courseDone ? (
                <p className="mt-1 text-xs text-text-muted">
                  Nastavite s lekcije <span className="font-mono text-text-secondary">{resumeId}</span> ili kroz
                  sadržaj lijevo.
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {courseDone ? (
                <Badge className="border-emerald-500/40 bg-emerald-600/90 text-white hover:bg-emerald-600">
                  Kurs završen
                </Badge>
              ) : null}
              {courseDone ? (
                <Button asChild size="sm" className="bg-brand text-white hover:bg-brand/90">
                  <Link to={`/dashboard/exams?courseId=${encodeURIComponent(courseId)}`}>Završni ispit</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {tocOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          aria-label="Zatvori sadržaj kursa"
          onClick={() => setTocOpen(false)}
        />
      ) : null}

      <div className={cn("flex min-h-0 flex-1", useRealApi && progressQuery.data ? "pt-[7.5rem]" : "pt-14")}>
        <aside
          className={cn(
            "z-50 flex w-72 shrink-0 flex-col border-r border-border/20 bg-surface-primary",
            "fixed left-0 top-14 h-[calc(100svh-3.5rem)] transition-transform duration-200 md:static md:z-0 md:h-full md:translate-x-0",
            tocOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <CourseTOC
            modules={outline.modules}
            currentLessonId={currentLessonId}
            onSelectLesson={(mid, lid) => {
              handleSelectLesson(mid, lid);
              setMobileTab("lesson");
            }}
            immersive
            className="min-h-0 flex-1"
          />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col xl:flex-row">
          <div
            className={cn(
              "flex min-h-0 min-w-0 flex-1 flex-col",
              "pb-[4.25rem] xl:pb-0 motion-reduce:transition-none",
            )}
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              {showLessonPane ? (
                <div
                  className={cn(
                    "mx-auto w-full px-4 py-4 md:px-6",
                    currentLesson?.contentType === "video" ? "max-w-5xl" : "max-w-3xl",
                  )}
                >
                  <LessonContent
                    lesson={currentLesson}
                    immersive
                    playerContext={{ courseId: outline.courseId, moduleId: currentModuleId ?? "" }}
                    onVideoComplete={() => {
                      if (currentLessonId) {
                        markLessonComplete(currentLessonId);
                      }
                    }}
                    onQuizComplete={(result) => {
                      if (result.passed && currentLessonId) {
                        markLessonComplete(currentLessonId);
                      }
                    }}
                    onQuizContinueNext={goNext}
                  />
                </div>
              ) : null}

              {!isXlViewport && mobileTab === "toc" ? (
                <div className="p-4 pb-8">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Sadržaj kursa</p>
                  <CourseTOC
                    modules={outline.modules}
                    currentLessonId={currentLessonId}
                    onSelectLesson={(mid, lid) => {
                      handleSelectLesson(mid, lid);
                      setMobileTab("lesson");
                    }}
                    immersive={false}
                    className="max-h-[min(70vh,520px)] rounded-xl border border-border/30"
                  />
                </div>
              ) : null}

              {!isXlViewport && mobileTab === "ai" ? (
                <div className="space-y-4 p-4">
                  <AiTutorPanel />
                  <PlayerNotesPanel hideAiTrigger className="min-h-[14rem] border-0 bg-transparent" />
                </div>
              ) : null}

              {!isXlViewport && mobileTab === "progress" ? (
                <div className="space-y-2 overflow-y-auto p-4">{playerRailSections}</div>
              ) : null}
            </div>

            <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-border/20 bg-surface-primary/95 px-3 py-3 backdrop-blur-md sm:gap-4 sm:px-5">
              <Button
                type="button"
                variant="outline"
                onClick={goPrev}
                disabled={!canPrev}
                className="shrink-0 border-border/50 bg-transparent text-text-primary hover:bg-white/5"
              >
                ← Prethodna
              </Button>

              <motion.div className="min-w-0 flex-1 sm:max-w-xs">
                <AnimatePresence mode="wait">
                  {lessonDone ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 420, damping: 28 }}
                    >
                      <Button
                        type="button"
                        disabled
                        className="w-full border-emerald-500/40 bg-emerald-600/90 font-semibold text-white hover:bg-emerald-600"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Check className="h-4 w-4" aria-hidden />
                          Završeno
                        </span>
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="mark"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full border border-border/40 bg-surface-secondary font-semibold text-text-primary hover:bg-surface-tertiary"
                        onClick={handleMarkComplete}
                        disabled={!currentLessonId}
                      >
                        ✓ Označi završenim
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <Button
                type="button"
                variant="outline"
                onClick={goNext}
                disabled={!canNext}
                className="shrink-0 border-border/50 bg-transparent text-text-primary hover:bg-white/5"
              >
                Sljedeća →
              </Button>
            </footer>
          </div>

          {notesOpen ? (
            <aside
              aria-label="Napredak, AI tutor i bilješke"
              className="hidden w-[min(100%,22rem)] shrink-0 flex-col gap-0 overflow-y-auto border-l border-border/20 bg-surface-primary px-3 py-4 xl:flex"
            >
              {playerRailSections}
            </aside>
          ) : null}
        </div>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-[60] flex items-stretch justify-around border-t border-border/40 bg-surface-primary/95 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-md xl:hidden"
        aria-label="Mobilni izbornik playera"
      >
        {(
          [
            { id: "lesson" as const, label: "Lekcija", Icon: BookOpen },
            { id: "toc" as const, label: "Sadržaj", Icon: LayoutList },
            { id: "ai" as const, label: "AI", Icon: Sparkles },
            { id: "progress" as const, label: "Napredak", Icon: GraduationCap },
          ] as const
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium text-text-muted transition-colors",
              mobileTab === id ? "text-brand" : "hover:text-text-secondary",
            )}
            aria-current={mobileTab === id ? "page" : undefined}
            onClick={() => setMobileTab(id)}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </nav>

      <AiTutorFloating />
    </div>
  );
}
