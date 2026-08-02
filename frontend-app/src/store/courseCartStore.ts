import { create } from "zustand";

export type CourseCartLine = {
  readonly courseId: string;
  readonly slug: string;
  readonly title: string;
  readonly price: number;
};

type State = {
  readonly items: readonly CourseCartLine[];
  addPaidCourse: (line: CourseCartLine) => void;
  removeCourse: (courseId: string) => void;
  clear: () => void;
  contains: (courseId: string) => boolean;
};

export const useCourseCartStore = create<State>((set, get) => ({
  items: [],

  addPaidCourse: (line) => {
    if (line.price <= 0) {
      return;
    }
    set((s) => {
      if (s.items.some((i) => i.courseId === line.courseId)) {
        return s;
      }
      return { items: [...s.items, line] };
    });
  },

  removeCourse: (courseId) => {
    set((s) => ({ items: s.items.filter((i) => i.courseId !== courseId) }));
  },

  clear: () => set({ items: [] }),

  contains: (courseId) => get().items.some((i) => i.courseId === courseId),
}));
