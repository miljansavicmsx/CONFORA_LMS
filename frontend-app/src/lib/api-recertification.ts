import { api } from "@/lib/api";
import { getConforaApiConfig } from "@/lib/api/api-config";

export type RecertificationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "REQUEST_INFO"
  | "APPROVED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export interface RecertificationItem {
  recertificationApplicationId: string;
  recertificationId?: string;
  userId: string;
  certificateId: string;
  schemeId?: string | null;
  courseId: string;
  status: RecertificationStatus;
  recertificationDueAt: string;
  reminderStage: string;
  renewalCertificateId?: string | null;
  renewedCertificateId?: string | null;
  createdAt: string;
  updatedAt: string;
}

const NEST_RECERT_BASE = "/v1/me/recertification";

function useNestRecertificationPath(): boolean {
  const provider = getConforaApiConfig().provider;
  return provider === "nest" || provider === "hybrid";
}

export type RecertificationCase = {
  readonly id: string;
  readonly certificateId: string;
  readonly status: string;
  readonly inputs?: Record<string, unknown>;
  readonly recertificationDueAt?: string | null;
};

export async function fetchMyRecertificationCase(certificateId: string): Promise<RecertificationCase> {
  if (useNestRecertificationPath()) {
    const { data } = await api.get<RecertificationCase>(
      `${NEST_RECERT_BASE}/${encodeURIComponent(certificateId.trim())}`,
    );
    return data;
  }
  const started = await startRecertificationForCertificate(certificateId);
  return {
    id: started.recertificationApplicationId,
    certificateId: started.certificateId,
    status: started.status,
    recertificationDueAt: started.recertificationDueAt,
    inputs: {},
  };
}

export async function patchRecertificationInputs(
  certificateId: string,
  inputs: Record<string, unknown>,
): Promise<RecertificationCase> {
  if (useNestRecertificationPath()) {
    const { data } = await api.patch<RecertificationCase>(
      `${NEST_RECERT_BASE}/${encodeURIComponent(certificateId.trim())}/inputs`,
      inputs,
    );
    return data;
  }
  throw new Error("CPD input patch requires Nest recertification API");
}

export async function submitRecertificationForCertificate(certificateId: string): Promise<RecertificationCase> {
  if (useNestRecertificationPath()) {
    const { data } = await api.post<RecertificationCase>(
      `${NEST_RECERT_BASE}/${encodeURIComponent(certificateId.trim())}/submit`,
    );
    return data;
  }
  const item = await startRecertificationForCertificate(certificateId);
  return submitRecertification(item.recertificationApplicationId).then((row) => ({
    id: row.recertificationApplicationId,
    certificateId: row.certificateId,
    status: row.status,
    recertificationDueAt: row.recertificationDueAt,
  }));
}

export async function listMyRecertifications(): Promise<RecertificationItem[]> {
  const { data } = await api.get<RecertificationItem[]>("/api/me/recertifications");
  return Array.isArray(data) ? data : [];
}

/** @deprecated Koristi `startRecertificationForCertificate` — i dalje kompatibilno. */
export async function applyRecertification(certificateId: string): Promise<RecertificationItem> {
  return startRecertificationForCertificate(certificateId);
}

export async function startRecertificationForCertificate(certificateId: string): Promise<RecertificationItem> {
  const { data } = await api.post<RecertificationItem>(
    `/api/me/certificates/${encodeURIComponent(certificateId)}/recertification`,
  );
  return data;
}

export async function submitRecertification(recertificationApplicationId: string): Promise<RecertificationItem> {
  const { data } = await api.post<RecertificationItem>(
    `/api/me/recertifications/${encodeURIComponent(recertificationApplicationId)}/submit`,
  );
  return data;
}

export async function fetchAdminRecertifications(status?: string): Promise<RecertificationItem[]> {
  const q = status?.trim() ? `?status=${encodeURIComponent(status.trim())}` : "";
  const { data } = await api.get<RecertificationItem[]>(`/api/admin/recertification${q}`);
  return Array.isArray(data) ? data : [];
}
