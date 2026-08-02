import { ChevronDown, CheckCircle2, Lock } from "lucide-react";
import { type JSX } from "react";

import { MiniRingProgress } from "@/components/course-player/MiniRingProgress";
import type { ModuleNode } from "@/types/course-player";
import { isLessonLocked, useCoursePlayerStore } from "@/store/coursePlayerStore";
import { cn } from "@/lib/utils";

function lessonIcon(contentType: string, active: boolean): JSX.Element {
  const map: Record<string, string> = {
    video: "▶",
    pdf: "📄",
    text: "📝",
    quiz: "❓",
  };
  const ch = map[contentType] ?? "📝";
  return (
    <span
      className={cn(
        "flex w-4 shrink-0 justify-center text-base leading-none",
        active ? "text-brand" : "text-text-muted",
      )}
      aria-hidden
    >
      {ch}
    </span>
  );
}

function moduleDurationMinutes(mod: ModuleNode): number {
  return mod.lessons.reduce((s, l) => s + l.durationMinutes, 0);
}

function moduleCompletedCount(
  mod: ModuleNode,
  isCompleted: (id: string) => boolean,
): number {
  return mod.lessons.filter((l) => isCompleted(l.id)).length;
}

function formatDurationMinutes(mins: number): string {
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  return `${mins}m`;
}

export function CourseTOC({
  modules,
  currentLessonId,
  onSelectLesson,
  className,
  immersive = false,
}: {
  readonly modules: readonly ModuleNode[];
  readonly currentLessonId: string | null;
  readonly onSelectLesson: (moduleId: string, lessonId: string) => void;
  readonly className?: string;
  /** Tamni immersive player (D.7). */
  readonly immersive?: boolean;
}): JSX.Element {
  const lessonProgress = useCoursePlayerStore((s) => s.lessonProgress);
  const isCompleted = useCoursePlayerStore((s) => s.isCompleted);

  const sorted = [...modules].sort((a, b) => a.order - b.order);

  if (immersive) {
    return (
      <nav
        className={cn("flex h-full flex-col overflow-y-auto", className)}
        aria-label="Sadržaj kursa"
      >
        {sorted.map((mod, modIdx) => {
          const totalL = mod.lessons.length;
          const doneL = moduleCompletedCount(mod, isCompleted);
          const pct = totalL > 0 ? Math.round((doneL / totalL) * 100) : 0;
          const dur = moduleDurationMinutes(mod);

          return (
            <details
              key={mod.id}
              className="group border-b border-border/20 open:bg-surface-secondary/90"
              open={modIdx === 0}
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
                <ChevronDown className="h-4 w-4 shrink-0 text-text-muted transition-transform group-open:rotate-180" />
                <MiniRingProgress percent={pct} className="shrink-0 text-brand" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold tabular-nums text-brand">{mod.order}.</span>
                    <span className="truncate text-sm font-semibold text-text-primary">{mod.title}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {totalL}
                    {" "}
                    lekcija ·
                    {" "}
                    {formatDurationMinutes(dur)}
                  </p>
                </div>
              </summary>
              <ul className="border-t border-border/15 pb-2 pt-1">
                {mod.lessons.map((lesson) => {
                  const done = isCompleted(lesson.id);
                  const locked = isLessonLocked(lesson.id, modules, lessonProgress);
                  const active = lesson.id === currentLessonId;

                  return (
                    <li key={lesson.id}>
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => onSelectLesson(mod.id, lesson.id)}
                        aria-current={active ? "true" : undefined}
                        className={cn(
                          "flex h-10 w-full items-center gap-3 px-4 text-left text-sm transition-colors",
                          active && "border-r-2 border-brand bg-brand/10 text-text-primary",
                          !active && !locked && "text-text-secondary hover:bg-white/5",
                          done && !active && "text-text-muted",
                          locked && "cursor-not-allowed opacity-45",
                        )}
                      >
                        {lessonIcon(lesson.contentType, active)}
                        <span className="min-w-0 flex-1 truncate font-medium">{lesson.title}</span>
                        {lesson.pendingAiReview ? (
                          <span className="shrink-0 rounded border border-amber-500/45 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100">
                            AI · pregled
                          </span>
                        ) : lesson.isAIGenerated ? (
                          <span className="shrink-0 rounded border border-violet-500/40 bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-100">
                            AI
                          </span>
                        ) : null}
                        <span className="shrink-0 tabular-nums text-xs text-text-muted">
                          {formatDurationMinutes(lesson.durationMinutes)}
                        </span>
                        {done ? (
                          <CheckCircle2
                            className="h-4 w-4 shrink-0 text-emerald-400"
                            aria-label="Završeno"
                          />
                        ) : null}
                        {locked ? (
                          <Lock className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-label="Zaključano" />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      className={cn("flex flex-col gap-2 overflow-y-auto p-3", className)}
      aria-label="Sadržaj kursa"
    >
      {sorted.map((mod, modIdx) => {
        const totalL = mod.lessons.length;
        const doneL = moduleCompletedCount(mod, isCompleted);
        const pct = totalL > 0 ? Math.round((doneL / totalL) * 100) : 0;
        const dur = moduleDurationMinutes(mod);

        return (
          <details
            key={mod.id}
            className="group rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] open:shadow-sm"
            open={modIdx === 0}
          >
            <summary className="flex cursor-pointer list-none items-start gap-2 px-3 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
              <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform group-open:rotate-180" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-xs font-semibold text-[#1F4E79]">
                    {mod.order}
                    .
                  </span>
                  <span className="font-medium text-[hsl(var(--foreground))]">{mod.title}</span>
                </div>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  {totalL}
                  {" "}
                  lekcija ·
                  {dur}
                  min
                </p>
                <div
                  className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Napredak modula ${mod.title}`}
                >
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </summary>
            <ul className="space-y-0.5 border-t border-[hsl(var(--border))] px-2 py-2">
              {mod.lessons.map((lesson) => {
                const done = isCompleted(lesson.id);
                const locked = isLessonLocked(lesson.id, modules, lessonProgress);
                const active = lesson.id === currentLessonId;

                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => onSelectLesson(mod.id, lesson.id)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                        active && "bg-[#1F4E79]/10 text-[#1F4E79]",
                        !active && !locked && "hover:bg-[hsl(var(--muted))]",
                        locked && "cursor-not-allowed opacity-50",
                      )}
                    >
                      {lessonIcon(lesson.contentType, Boolean(active))}
                      <span className="min-w-0 flex-1 truncate font-medium">{lesson.title}</span>
                      {lesson.pendingAiReview ? (
                        <span className="shrink-0 rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-900 dark:text-amber-100">
                          AI · pregled
                        </span>
                      ) : lesson.isAIGenerated ? (
                        <span className="shrink-0 rounded border border-violet-500/35 bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-violet-900 dark:text-violet-100">
                          AI
                        </span>
                      ) : null}
                      <span className="shrink-0 text-xs text-[hsl(var(--muted-foreground))]">
                        {lesson.durationMinutes}
                        m
                      </span>
                      {done ? (
                        <span className="shrink-0 text-base" aria-label="Završeno">
                          ✅
                        </span>
                      ) : null}
                      {locked ? (
                        <span className="shrink-0 text-base" aria-label="Zaključano">
                          🔒
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </details>
        );
      })}
    </nav>
  );
}
