import type { Step1BasicInfoFormValues } from "@/admin/schemas/step1BasicInfoSchema";
import { api } from "@/lib/api";

/** Tijelo za POST /api/admin/courses (usklađeno s AdminCourseCreateBody). */
export function wizardStep1ToCreatePayload(values: Step1BasicInfoFormValues): Record<string, unknown> {
  const learningGoals = values.learningGoals.map((g) => g.trim()).filter(Boolean);
  const payload: Record<string, unknown> = {
    title: values.name.trim(),
    slug: values.slug.trim(),
    description: values.description.trim(),
    domains: values.domains,
    subtitle: values.subtitle.trim(),
    price: values.price,
    currency: values.currency,
    level: values.level,
    durationHours: values.durationHours,
    isCertifiable: values.certificationType !== "none",
    featured: false,
    badges: [],
    learningGoals,
    accessType: values.accessType,
    examRandomOrder: values.examRandomOrder,
    examShowResults: values.examShowResults,
    certificationType: values.certificationType,
    examQuestionCount: values.examQuestionCount,
    passingScorePct: values.passingScorePct,
    examAttempts: values.examAttempts,
    examTimeLimitMinutes: values.examTimeLimitMinutes,
    examNoTimeLimit: values.examNoTimeLimit,
    examCooldown: values.examCooldown,
    certLifetime: values.certLifetime,
  };
  if (values.accessType === "custom" && values.customAccessMonths != null) {
    payload.customAccessMonths = values.customAccessMonths;
  }
  if (values.certificationType !== "none") {
    if (!values.certLifetime && values.certValidityMonths != null) {
      payload.certValidityMonths = values.certValidityMonths;
    }
  }
  if (values.promoVideoUrl?.trim()) {
    payload.promoVideoUrl = values.promoVideoUrl.trim();
  }
  if (values.thumbnailDataUrl?.trim()) {
    payload.thumbnailDataUrl = values.thumbnailDataUrl.trim();
  }
  if (values.heroBannerDataUrl?.trim()) {
    payload.heroBannerDataUrl = values.heroBannerDataUrl.trim();
  }
  return payload;
}

export type AdminCourseCreateResponse = {
  readonly courseId: string;
  readonly slug: string;
  readonly thumbnailUrl?: string | null;
  readonly heroBannerUrl?: string | null;
  readonly authorEnrolled?: boolean;
};

export async function createAdminCourse(
  values: Step1BasicInfoFormValues,
): Promise<AdminCourseCreateResponse> {
  const { data } = await api.post<AdminCourseCreateResponse>(
    "/api/admin/courses",
    wizardStep1ToCreatePayload(values),
  );
  return data;
}
