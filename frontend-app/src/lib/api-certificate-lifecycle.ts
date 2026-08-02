import { api } from "@/lib/api";

export interface CertificateLifecycleActionBody {
  reason: string;
  internalNotes?: string;
  effectiveDate?: string;
}

export async function suspendCertificate(certificateId: string, body: CertificateLifecycleActionBody): Promise<void> {
  await api.post(`/api/certificates/${encodeURIComponent(certificateId)}/suspend`, body);
}

export async function withdrawCertificate(certificateId: string, body: CertificateLifecycleActionBody): Promise<void> {
  await api.post(`/api/certificates/${encodeURIComponent(certificateId)}/withdraw`, body);
}

export async function reactivateCertificate(certificateId: string, body: CertificateLifecycleActionBody): Promise<void> {
  await api.post(`/api/certificates/${encodeURIComponent(certificateId)}/reactivate`, body);
}

export async function revokeCertificate(certificateId: string, body: CertificateLifecycleActionBody): Promise<void> {
  await api.post(`/api/certificates/${encodeURIComponent(certificateId)}/revoke`, body);
}

export async function runDailyCertificateExpiryJob(): Promise<{
  checked: number;
  expiredMarked: number;
  remindersDue: number;
}> {
  const { data } = await api.post("/api/admin/jobs/daily-certificate-expiry");
  return data as { checked: number; expiredMarked: number; remindersDue: number };
}

