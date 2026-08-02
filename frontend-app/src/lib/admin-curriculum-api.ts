import axios, { type AxiosError } from "axios";

import type {
  AdminCourseStructureResponse,
  CurriculumPutBody,
} from "@/admin/content-editor/curriculum-api-types";
import { defaultCertificateConfig, adminApiToEditorState, editorStateToCurriculumPut } from "@/admin/content-editor/curriculum-io";
import type { CertificateConfigState } from "@/admin/content-editor/types";
import type { EditorModule } from "@/admin/content-editor/types";
import { api } from "@/lib/api";

const STRUCTURE_PATH = (courseId: string) =>
  `/api/admin/courses/${encodeURIComponent(courseId)}/structure`;
const CURRICULUM_PUT_PATH = (courseId: string) =>
  `/api/admin/courses/${encodeURIComponent(courseId)}/curriculum`;

export function getCurriculumApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : "Neočekivana greška.";
  }
  const ax = error as AxiosError<{ detail?: unknown }>;
  const detail = ax.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail
      .map((x) => {
        if (typeof x === "object" && x !== null && "msg" in x) {
          return String((x as { msg: string }).msg);
        }
        return "";
      })
      .filter(Boolean)
      .join("; ");
  }
  if (ax.response?.status === 401) {
    return "Niste prijavljeni ili je sesija istekla.";
  }
  if (ax.response?.status === 403) {
    return "Nedovoljne ovlasti za administraciju sadržaja.";
  }
  if (ax.response?.status === 404) {
    return "Kurs nije pronađen.";
  }
  return ax.message || "Zahtjev nije uspio.";
}

/**
 * GET strukture kurikuluma (admin, bez provjere upisa).
 * Backend: GET /api/admin/courses/{courseId}/structure
 */
export async function fetchCourseStructure(courseId: string): Promise<AdminCourseStructureResponse> {
  const { data } = await api.get<AdminCourseStructureResponse>(STRUCTURE_PATH(courseId));
  return data;
}

/**
 * PUT kurikuluma (moduli/lekcije/kviz).
 * Backend: PUT /api/admin/courses/{courseId}/curriculum
 */
export async function saveCourseStructure(courseId: string, payload: CurriculumPutBody): Promise<void> {
  await api.put(CURRICULUM_PUT_PATH(courseId), payload);
}

/** @deprecated Prefer fetchCourseStructure */
export async function fetchAdminCourseStructure(courseId: string): Promise<ReturnType<typeof adminApiToEditorState>> {
  const data = await fetchCourseStructure(courseId);
  return adminApiToEditorState(data);
}

/** @deprecated Prefer saveCourseStructure + editorStateToCurriculumPut */
export async function saveAdminCurriculum(
  courseId: string,
  courseTitle: string,
  modules: readonly EditorModule[],
  certificateConfig: CertificateConfigState = defaultCertificateConfig(),
): Promise<void> {
  await saveCourseStructure(courseId, editorStateToCurriculumPut(courseTitle, modules, certificateConfig));
}

export type { AdminCourseStructureResponse, CurriculumPutBody } from "@/admin/content-editor/curriculum-api-types";
export type { AdminCourseStructurePayload } from "@/admin/content-editor/curriculum-io";
