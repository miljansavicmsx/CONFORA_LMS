import { api } from "@/lib/api";

export type AdminCoursePatchPayload = Record<string, unknown>;

export async function patchAdminCourse(
  courseId: string,
  payload: AdminCoursePatchPayload,
): Promise<void> {
  await api.patch(`/api/admin/courses/${encodeURIComponent(courseId)}`, payload);
}
