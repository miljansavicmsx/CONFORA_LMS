import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { CourseCreateFullDraft } from "@/types/lms-stores";

const DRAFT_KEY = "confora-admin-course-wizard-draft";

export type WizardStep = 1 | 2 | 3 | 4;

export type WizardStoreState = {
  step: WizardStep;
  courseData: CourseCreateFullDraft;
  isDirty: boolean;
  setStep: (step: WizardStep) => void;
  updateCourseData: (patch: Partial<CourseCreateFullDraft>) => void;
  /** Sprema nacrt u localStorage i briše isDirty. */
  saveDraft: () => Promise<void>;
  loadDraft: () => void;
  clearWizard: () => void;
};

function readDraftFromStorage(): CourseCreateFullDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CourseCreateFullDraft;
  } catch {
    return null;
  }
}

export const useWizardStore = create<WizardStoreState>()(
  immer((set, get) => ({
    step: 1,
    courseData: {},
    isDirty: false,

    setStep: (step) =>
      set((s) => {
        s.step = step;
      }),

    updateCourseData: (patch) =>
      set((s) => {
        const { exam_config: examPatch, ...rest } = patch;
        Object.assign(s.courseData, rest);
        if (examPatch !== undefined) {
          if (examPatch === null) {
            s.courseData.exam_config = null;
          } else {
            const prev = s.courseData.exam_config ?? {};
            s.courseData.exam_config = { ...prev, ...examPatch };
          }
        }
        s.isDirty = true;
      }),

    saveDraft: async () => {
      const data = get().courseData;
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      } catch {
        /* quota / private mode */
      }
      set((s) => {
        s.isDirty = false;
      });
    },

    loadDraft: () => {
      const draft = readDraftFromStorage();
      if (!draft) return;
      set((s) => {
        s.courseData = draft;
        s.isDirty = false;
      });
    },

    clearWizard: () =>
      set((s) => {
        s.step = 1;
        s.courseData = {};
        s.isDirty = false;
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* ignore */
        }
      }),
  })),
);
