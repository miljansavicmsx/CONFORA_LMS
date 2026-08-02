import { create } from "zustand";

import { api } from "@/lib/api";
import type { ModuleNode } from "@/types/course-player";

export interface CoursePlayerState {
  readonly currentCourseId: string | null;
  readonly currentModuleId: string | null;
  readonly currentLessonId: string | null;
  /** lessonId -> završena */
  readonly lessonProgress: Readonly<Record<string, boolean>>;
  setCurrentLesson: (moduleId: string, lessonId: string) => void;
  initCourse: (courseId: string, initialCompleted?: Record<string, boolean>) => void;
  /** Spoji server napredak bez resetovanja trenutne lekcije. */
  hydrateLessonProgress: (completed: Record<string, boolean>) => void;
  markLessonComplete: (lessonId: string) => void;
  markLessonIncomplete: (lessonId: string) => void;
  isCompleted: (lessonId: string) => boolean;
  reset: () => void;
}

function orderedLessonIds(modules: readonly ModuleNode[]): string[] {
  const sorted = [...modules].sort((a, b) => a.order - b.order);
  const ids: string[] = [];
  for (const m of sorted) {
    for (const l of m.lessons) {
      ids.push(l.id);
    }
  }
  return ids;
}

/** Eksport za TOC: je li lekcija zaključana (sekvencijalni unlock). */
export function isLessonLocked(
  lessonId: string,
  modules: readonly ModuleNode[],
  lessonProgress: Readonly<Record<string, boolean>>,
): boolean {
  const order = orderedLessonIds(modules);
  const idx = order.indexOf(lessonId);
  if (idx <= 0) {
    return false;
  }
  return !order.slice(0, idx).every((id) => Boolean(lessonProgress[id]));
}

export const useCoursePlayerStore = create<CoursePlayerState>((set, get) => ({
  currentCourseId: null,
  currentModuleId: null,
  currentLessonId: null,
  lessonProgress: {},

  initCourse: (courseId, initialCompleted = {}) => {
    set({
      currentCourseId: courseId,
      lessonProgress: { ...initialCompleted },
      currentModuleId: null,
      currentLessonId: null,
    });
  },

  hydrateLessonProgress: (completed) => {
    set((s) => ({
      lessonProgress: { ...s.lessonProgress, ...completed },
    }));
  },

  setCurrentLesson: (moduleId, lessonId) => {
    set({ currentModuleId: moduleId, currentLessonId: lessonId });
  },

  markLessonComplete: (lessonId) => {
    set((s) => ({
      lessonProgress: { ...s.lessonProgress, [lessonId]: true },
    }));
    const courseId = get().currentCourseId;
    void (async () => {
      try {
        if (courseId) {
          await api.post(
            `/api/me/course-progress/${encodeURIComponent(courseId)}/complete-lesson`,
            { lessonId },
          );
          return;
        }
        await api.put(`/api/learning/progress/${encodeURIComponent(lessonId)}`, {
          status: "completed",
          completionPercentage: 100,
        });
      } catch (e) {
        console.warn("[coursePlayerStore] markLessonComplete sync failed", e);
      }
    })();
  },

  markLessonIncomplete: (lessonId) => {
    set((s) => {
      const next = { ...s.lessonProgress };
      delete next[lessonId];
      return { lessonProgress: next };
    });
  },

  isCompleted: (lessonId) => Boolean(get().lessonProgress[lessonId]),

  reset: () =>
    set({
      currentCourseId: null,
      currentModuleId: null,
      currentLessonId: null,
      lessonProgress: {},
    }),
}));
