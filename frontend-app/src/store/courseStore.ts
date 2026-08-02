import { create } from "zustand";

import { enrichCourseFromListRow, type CourseListRow } from "@/lib/enrich-course-detail";
import { fetchPublicCatalogCourseByIdentifier } from "@/lib/api/public-catalog-client";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type { Course } from "@/types/course-detail";

export interface CourseStore {
  readonly selectedCourseSlug: string | null;
  readonly isPanelOpen: boolean;
  readonly courseData: Course | null;
  readonly isLoading: boolean;
  openPanel: (slug: string) => void;
  closePanel: () => void;
  fetchCourse: (slug: string) => Promise<void>;
}

export const useCourseStore = create<CourseStore>((set, get) => ({
  selectedCourseSlug: null,
  isPanelOpen: false,
  courseData: null,
  isLoading: false,

  openPanel: (slug: string) => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("kurs", slug);
    const qs = searchParams.toString();
    window.history.pushState({}, "", qs ? `${path}?${qs}` : path);
    set({ selectedCourseSlug: slug, isPanelOpen: true });
    void get().fetchCourse(slug);
  },

  closePanel: () => {
    window.history.pushState({}, "", window.location.pathname);
    set({
      isPanelOpen: false,
      selectedCourseSlug: null,
      courseData: null,
      isLoading: false,
    });
  },

  fetchCourse: async (slug: string) => {
    set({ isLoading: true });
    try {
      const lookup = await fetchPublicCatalogCourseByIdentifier(slug);
      if (lookup.kind !== "ok") {
        set({ courseData: null, isLoading: false });
        return;
      }
      const data = lookup.data as CourseListRow;
      let enrolled = false;
      const token = useAuthStore.getState().accessToken;
      if (token) {
        try {
          const { data: ens } = await api.get<
            { readonly courseId: string; readonly enrollmentStatus?: string | null }[]
          >("/api/me/enrollments");
          enrolled = ens.some(
            (e) =>
              e.courseId === data.courseId &&
              String(e.enrollmentStatus ?? "active").toLowerCase() === "active",
          );
        } catch {
          enrolled = false;
        }
      }
      set({ courseData: enrichCourseFromListRow(data, { enrolled }), isLoading: false });
    } catch {
      set({ courseData: null, isLoading: false });
    }
  },
}));
