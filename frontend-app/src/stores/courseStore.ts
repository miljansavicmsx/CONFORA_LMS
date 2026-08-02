import { castDraft } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { api } from "@/lib/api";
import type { CourseDetail } from "@/types/lms-stores";

type CourseListItem = {
  readonly courseId: string;
  readonly slug: string;
  readonly title: string;
  readonly domain?: string | null;
  readonly categorySlug?: string | null;
  readonly price?: number | null;
  readonly level?: string;
  readonly durationHours?: number;
  readonly thumbnailUrl?: string | null;
  readonly badges?: readonly string[];
  readonly status?: string;
  readonly isCertifiable?: boolean;
  readonly featured?: boolean;
};

export type CourseStoreState = {
  selectedCourseSlug: string | null;
  isPanelOpen: boolean;
  courseData: CourseDetail | null;
  loading: boolean;
  error: string | null;
  openPanel: (slug: string) => void;
  closePanel: () => void;
  fetchCourse: (slug: string) => Promise<void>;
};

export const useCourseStore = create<CourseStoreState>()(
  immer((set, get) => ({
    selectedCourseSlug: null,
    isPanelOpen: false,
    courseData: null,
    loading: false,
    error: null,

    openPanel: (slug) => {
      set((s) => {
        s.selectedCourseSlug = slug;
        s.isPanelOpen = true;
        s.error = null;
      });
      void get().fetchCourse(slug);
    },

    closePanel: () =>
      set((s) => {
        s.isPanelOpen = false;
        s.selectedCourseSlug = null;
        s.courseData = null;
        s.error = null;
      }),

    fetchCourse: async (slug) => {
      const trimmed = slug.trim();
      if (!trimmed) {
        set((s) => {
          s.error = "Nedostaje slug kursa.";
          s.courseData = null;
        });
        return;
      }

      set((s) => {
        s.loading = true;
        s.error = null;
      });

      try {
        const { data } = await api.get<CourseListItem[]>("/api/courses");
        const row = data.find((c) => c.slug === trimmed);
        if (!row) {
          set((s) => {
            s.courseData = null;
            s.error = "Kurs nije pronađen.";
          });
          return;
        }

        const detail: CourseDetail = {
          ...row,
          description: null,
          modules: [],
        };

        set((s) => {
          s.courseData = castDraft(detail);
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Učitavanje kursa nije uspjelo.";
        set((s) => {
          s.courseData = null;
          s.error = message;
        });
      } finally {
        set((s) => {
          s.loading = false;
        });
      }
    },
  })),
);
