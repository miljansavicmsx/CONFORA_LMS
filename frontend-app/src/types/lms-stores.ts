/**
 * Tipovi dijeljeni između Zustand store-ova (CONFORA LMS).
 */

export type User = {
  readonly userId?: string;
  readonly id?: string;
  readonly email: string;
  readonly full_name?: string;
  readonly role?: string;
  readonly avatar_url?: string | null;
};

export type LessonSummary = {
  readonly lessonId: string;
  readonly title: string;
  readonly durationSeconds?: number | null;
};

export type ModuleSummary = {
  readonly moduleId: string;
  readonly title: string;
  readonly lessons: readonly LessonSummary[];
};

/** Katalog / player — osnovni kurs (`modules` opcionalno za napredak u playeru). */
export type Course = {
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
  readonly modules?: readonly ModuleSummary[];
};

/** Detalj kursa (panel / player). */
export type CourseDetail = Course & {
  readonly description?: string | null;
};

export type LessonProgress = {
  readonly lessonId: string;
  readonly moduleId: string;
  completed: boolean;
  activeTimeSeconds: number;
  lastPositionSeconds: number | null;
};

export type ExamConfigDraft = {
  exam_questions_count?: number;
  exam_passing_score?: number;
  exam_attempts_allowed?: number;
  exam_time_limit_minutes?: number | null;
  exam_cooldown_hours?: number | null;
  cert_validity_months?: number | null;
};

/** Admin wizard — skraćeni oblik backend `CourseCreateFull`. */
export type CourseCreateFullDraft = {
  slug?: string;
  title?: string;
  description?: string | null;
  domain?: string | null;
  category_slug?: string | null;
  price?: number;
  currency?: string;
  level?: string;
  duration_hours?: number;
  thumbnail_url?: string | null;
  badges?: string[];
  is_certifiable?: boolean;
  featured?: boolean;
  exam_config?: ExamConfigDraft | null;
};
