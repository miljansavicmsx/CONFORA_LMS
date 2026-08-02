/**
 * Pilot korak 6 — napredak kursa (obavezne lekcije, COURSE_COMPLETED).
 */

import { api } from "@/lib/api";

export type CourseProgressLessonRow = {
  readonly lessonId: string;
  readonly required: boolean;
  readonly completed: boolean;
};

export type CourseProgressResponse = {
  readonly courseId: string;
  readonly completionPercent: number;
  readonly mandatoryCompleted: number;
  readonly mandatoryTotal: number;
  readonly courseCompletionStatus: string | null;
  readonly resumeLessonId: string | null;
  readonly lessons: readonly CourseProgressLessonRow[];
};

export async function fetchCourseProgress(courseId: string): Promise<CourseProgressResponse> {
  const { data } = await api.get<CourseProgressResponse>(
    `/api/me/course-progress/${encodeURIComponent(courseId)}`,
  );
  return data;
}
