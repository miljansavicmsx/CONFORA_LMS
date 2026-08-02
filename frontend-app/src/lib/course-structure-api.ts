import { api } from "@/lib/api";
import type { CourseOutline, LessonContentType, LessonNode, ModuleNode } from "@/types/course-player";

export type ApiLessonStructure = {
  readonly lessonId: string;
  readonly title: string;
  readonly contentType: string;
  readonly orderIndex: number;
  readonly isMandatory?: boolean;
  readonly estimatedMinutes?: number;
  readonly contentUrl?: string | null;
  readonly htmlBody?: string | null;
  readonly thumbnailUrl?: string | null;
  readonly isAIGenerated?: boolean;
  readonly aiContentApproved?: boolean;
  readonly pendingAiReview?: boolean;
};

export type ApiModuleStructure = {
  readonly moduleId: string;
  readonly title: string;
  readonly orderIndex: number;
  readonly hasQuiz?: boolean;
  readonly lessons: readonly ApiLessonStructure[];
};

export type ApiCourseStructureResponse = {
  readonly courseId: string;
  readonly title: string;
  readonly modules: readonly ApiModuleStructure[];
};

function normalizeContentType(raw: string): LessonContentType {
  const t = String(raw || "text").toLowerCase();
  if (t === "video") {
    return "video";
  }
  if (t === "pdf") {
    return "pdf";
  }
  if (t === "quiz") {
    return "quiz";
  }
  return "text";
}

function mapLesson(m: ApiLessonStructure): LessonNode {
  const contentType = normalizeContentType(m.contentType);
  const url = m.contentUrl?.trim() || undefined;
  const html = m.htmlBody?.trim() || undefined;
  const aiGen = Boolean(m.isAIGenerated);
  const pending = Boolean(m.pendingAiReview);
  return {
    id: m.lessonId,
    title: m.title || "Lekcija",
    contentType,
    durationMinutes: Math.max(0, Number(m.estimatedMinutes) || 0),
    ...(url ? { contentUrl: url } : {}),
    ...(html ? { htmlBody: html } : {}),
    ...(m.thumbnailUrl?.trim() ? { thumbnailUrl: m.thumbnailUrl.trim() } : {}),
    ...(aiGen ? { isAIGenerated: true } : {}),
    ...(m.aiContentApproved !== undefined ? { aiContentApproved: Boolean(m.aiContentApproved) } : {}),
    ...(pending ? { pendingAiReview: true } : {}),
  };
}

export function mapApiStructureToOutline(data: ApiCourseStructureResponse): CourseOutline {
  const modules: ModuleNode[] = [...data.modules]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((mod) => ({
      id: mod.moduleId,
      title: mod.title || "Modul",
      order: mod.orderIndex,
      lessons: [...mod.lessons].sort((a, b) => a.orderIndex - b.orderIndex).map(mapLesson),
    }));
  return {
    courseId: data.courseId,
    title: data.title || "Kurs",
    modules,
  };
}

export async function fetchCourseStructure(courseId: string): Promise<CourseOutline> {
  const { data } = await api.get<ApiCourseStructureResponse>(`/api/courses/${encodeURIComponent(courseId)}/structure`);
  return mapApiStructureToOutline(data);
}
