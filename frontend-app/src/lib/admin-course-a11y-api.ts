import { api } from "@/lib/api";

export type CourseA11yMissingField =
  | "captions_url"
  | "transcript_url"
  | "embed_caption_attestation";

export type CourseAccessibilitySummary = {
  readonly status: "green" | "yellow" | "red";
  readonly ready: boolean;
  readonly inGracePeriod: boolean;
  readonly graceUntil: string | null;
  readonly requireCaptionsForVideo: boolean;
  readonly requireTranscript: boolean;
  readonly videoLessonCount: number;
  readonly minDaysUntilAttestationExpiry?: number | null;
  readonly missing: readonly {
    readonly lessonId: string;
    readonly lessonTitle: string;
    readonly missing: readonly CourseA11yMissingField[];
  }[];
};

export type CourseA11yIndexRow = {
  readonly courseId: string;
  readonly title: string;
  readonly status: string;
  readonly a11yStatus: "green" | "yellow" | "red";
  readonly a11yReady: boolean;
  readonly videoLessonCount: number;
};

export async function fetchCoursesA11yIndex(): Promise<readonly CourseA11yIndexRow[]> {
  const { data } = await api.get<readonly CourseA11yIndexRow[]>("/api/admin/courses/a11y-index");
  return data;
}

export async function fetchAccessibilityReadiness(
  courseId: string,
): Promise<CourseAccessibilitySummary> {
  const { data } = await api.get<CourseAccessibilitySummary>(
    `/api/admin/courses/${encodeURIComponent(courseId)}/accessibility-readiness`,
  );
  return data;
}

export type DraftTranscriptResponse = {
  readonly transcript: string;
  readonly isAiGenerated: boolean;
  readonly requiresAuthorReview: boolean;
};

export async function draftTranscriptFromVideo(
  courseId: string,
  lessonId: string,
  body?: { readonly videoUrl?: string },
): Promise<DraftTranscriptResponse> {
  const { data } = await api.post<DraftTranscriptResponse>(
    `/api/admin/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/draft-transcript`,
    body ?? {},
  );
  return data;
}
