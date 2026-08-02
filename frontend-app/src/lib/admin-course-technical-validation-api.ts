import { api } from "@/lib/api";

export type TechnicalCommitteeValidationPayload = {
  readonly validated: boolean;
  readonly notes?: string;
};

export async function postTechnicalCommitteeValidation(
  courseId: string,
  body: TechnicalCommitteeValidationPayload,
): Promise<void> {
  await api.post(
    `/api/admin/courses/${encodeURIComponent(courseId)}/technical-committee-validation`,
    body,
  );
}
