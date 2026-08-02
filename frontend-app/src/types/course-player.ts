export type LessonContentType = "video" | "pdf" | "text" | "quiz";

export interface LessonChapter {
  readonly timeSeconds: number;
  readonly title: string;
}

export interface LessonSubtitle {
  readonly language: string;
  readonly url: string;
}

export interface LessonNode {
  readonly id: string;
  readonly title: string;
  readonly contentType: LessonContentType;
  readonly durationMinutes: number;
  readonly contentUrl?: string;
  readonly htmlBody?: string;
  /** Označeno kao AI-generirano (kurikulum). */
  readonly isAIGenerated?: boolean;
  /** Odobren sadržaj za learners (false dok čeka pregled). */
  readonly aiContentApproved?: boolean;
  /** AI lekcija bez odobrenja — sadržaj sakriven learnerima. */
  readonly pendingAiReview?: boolean;
  /** Poster / thumbnail za video player. */
  readonly thumbnailUrl?: string;
  readonly lastPositionSeconds?: number;
  readonly chapters?: readonly LessonChapter[];
  readonly subtitles?: readonly LessonSubtitle[];
  /** Poveznica na transkript lekcije (HTML/PDF). WCAG 1.2.1 / 1.2.5. */
  readonly transcriptUrl?: string;
  /** Prag za automatsko završetak videa (default u playeru 90). */
  readonly videoCompletionThresholdPct?: number;
}

export interface ModuleNode {
  readonly id: string;
  readonly title: string;
  readonly order: number;
  readonly lessons: readonly LessonNode[];
}

export interface CourseOutline {
  readonly courseId: string;
  readonly title: string;
  readonly modules: readonly ModuleNode[];
}
