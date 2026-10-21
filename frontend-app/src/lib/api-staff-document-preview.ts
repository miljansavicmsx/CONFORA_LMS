/**
 * F5-UI-5 — audited staff-only presigned document preview (short TTL).
 */

import { api } from "@/lib/api";

export type StaffDocumentPreviewKind = "identity_evidence" | "certificate_pdf";

export type StaffDocumentPreviewRequest = {
  readonly documentKind: StaffDocumentPreviewKind;
  readonly storageKey: string;
  readonly verificationId?: string;
  readonly certificateId?: string;
};

export type StaffDocumentPreviewResponse = {
  readonly contractVersion: string;
  readonly documentKind: StaffDocumentPreviewKind;
  readonly previewUrl: string;
  readonly expiresAt: string;
  readonly ttlSeconds: number;
  readonly accessMode: "PRESIGNED_URL";
};

export async function requestStaffDocumentPreview(
  input: StaffDocumentPreviewRequest,
): Promise<StaffDocumentPreviewResponse> {
  const { data } = await api.post<StaffDocumentPreviewResponse>(
    "/v1/staff/documents/presign-preview",
    input,
  );
  return data;
}
