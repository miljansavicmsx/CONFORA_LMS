/**
 * Puni model kursa za off-canvas panel (spaja listu /api/courses + lokalno obogaćenje).
 */

export interface CourseLesson {
  readonly id: string;
  readonly title: string;
  readonly durationMinutes: number;
  readonly type: "video" | "pdf" | "text";
  readonly isFreePreview: boolean;
}

export interface CourseModule {
  readonly id: string;
  readonly title: string;
  readonly lessons: readonly CourseLesson[];
}

export interface CourseInstructor {
  readonly name: string;
  readonly title?: string;
  readonly bio?: string;
  readonly avatarUrl?: string;
}

export interface CourseReview {
  readonly id: string;
  readonly author: string;
  readonly rating: number;
  readonly comment: string;
  readonly date: string;
}

export interface CourseStructurePreviewModule {
  readonly title: string;
  readonly lessonCount: number;
}

export interface Course {
  readonly courseId: string;
  readonly slug: string;
  readonly title: string;
  readonly domain: string;
  readonly thumbnailUrl: string;
  readonly level: string;
  readonly durationHours: number;
  readonly price: number;
  readonly currency: string;
  /** @deprecated Prefer hasFinalExam / leadsToCertification — ostaje radi kompatibilnosti s karticom. */
  readonly isCertifiable: boolean;
  readonly publishedStatus: string;
  readonly hasFinalExam: boolean;
  readonly autoIssueExamPassCertificate: boolean;
  readonly leadsToCertification: boolean;
  readonly certificationSchemeReference: string | null;
  readonly shortSummary: string;
  readonly moduleCount: number;
  readonly lessonCountTotal: number;
  readonly structurePreview: readonly CourseStructurePreviewModule[];
  readonly description: string;
  readonly promoVideoUrl: string | null;
  readonly learningObjectives: readonly string[];
  readonly examQuestionsCount: number;
  readonly examPassingScore: number;
  readonly examAttemptsAllowed: number;
  readonly examTimeLimitMinutes: number | null;
  readonly enrolled: boolean;
  readonly modules: readonly CourseModule[];
  readonly instructor: CourseInstructor;
  readonly reviews: readonly CourseReview[];
}
