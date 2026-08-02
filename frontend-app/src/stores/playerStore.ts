import { castDraft } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { Course, LessonProgress } from "@/types/lms-stores";

export type PlayerStoreState = {
  currentCourse: Course | null;
  currentModuleId: string | null;
  currentLessonId: string | null;
  lessonProgress: Map<string, LessonProgress>;
  setCurrentCourse: (course: Course | null) => void;
  setCurrentLesson: (moduleId: string, lessonId: string) => void;
  markLessonComplete: (lessonId: string) => void;
  updateLessonProgress: (
    lessonId: string,
    patch: Partial<Pick<LessonProgress, "activeTimeSeconds" | "lastPositionSeconds" | "completed">>,
  ) => void;
  getModuleProgress: (moduleId: string) => number;
  resetPlayer: () => void;
};

export const usePlayerStore = create<PlayerStoreState>()(
  immer((set, get) => ({
    currentCourse: null,
    currentModuleId: null,
    currentLessonId: null,
    lessonProgress: new Map(),

    setCurrentCourse: (course) =>
      set((s) => {
        s.currentCourse = course ? castDraft(course) : null;
        if (!course) {
          s.currentModuleId = null;
          s.currentLessonId = null;
          s.lessonProgress = new Map();
        }
      }),

    setCurrentLesson: (moduleId, lessonId) =>
      set((s) => {
        s.currentModuleId = moduleId;
        s.currentLessonId = lessonId;
        if (!s.lessonProgress.has(lessonId)) {
          s.lessonProgress.set(lessonId, {
            lessonId,
            moduleId,
            completed: false,
            activeTimeSeconds: 0,
            lastPositionSeconds: null,
          });
        }
      }),

    markLessonComplete: (lessonId) =>
      set((s) => {
        const row = s.lessonProgress.get(lessonId);
        if (row) {
          row.completed = true;
        } else {
          const modId = s.currentModuleId ?? "";
          s.lessonProgress.set(lessonId, {
            lessonId,
            moduleId: modId,
            completed: true,
            activeTimeSeconds: 0,
            lastPositionSeconds: null,
          });
        }
      }),

    updateLessonProgress: (lessonId, patch) =>
      set((s) => {
        const row = s.lessonProgress.get(lessonId);
        if (!row) return;
        if (patch.activeTimeSeconds !== undefined) row.activeTimeSeconds = patch.activeTimeSeconds;
        if (patch.lastPositionSeconds !== undefined) row.lastPositionSeconds = patch.lastPositionSeconds;
        if (patch.completed !== undefined) row.completed = patch.completed;
      }),

    getModuleProgress: (moduleId) => {
      const { currentCourse, lessonProgress } = get();
      const modules = currentCourse?.modules;
      if (!modules?.length) return 0;
      const mod = modules.find((m) => m.moduleId === moduleId);
      const lessons = mod?.lessons;
      if (!lessons?.length) return 0;
      let done = 0;
      for (const l of lessons) {
        if (lessonProgress.get(l.lessonId)?.completed) done += 1;
      }
      return Math.round((done / lessons.length) * 100);
    },

    resetPlayer: () =>
      set((s) => {
        s.currentCourse = null;
        s.currentModuleId = null;
        s.currentLessonId = null;
        s.lessonProgress = new Map();
      }),
  })),
);
