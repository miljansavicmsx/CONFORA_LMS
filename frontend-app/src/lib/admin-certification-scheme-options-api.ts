import { api } from "@/lib/api";

export type CertificationSchemeOptionItem = {
  readonly schemeId: string;
  readonly code: string;
  readonly name: string;
};

export async function fetchCertificationSchemeOptions(
  courseId: string,
): Promise<CertificationSchemeOptionItem[]> {
  const { data } = await api.get<{ items: CertificationSchemeOptionItem[] }>(
    `/api/admin/courses/${encodeURIComponent(courseId)}/certification-scheme-options`,
  );
  return Array.isArray(data?.items) ? data.items : [];
}
