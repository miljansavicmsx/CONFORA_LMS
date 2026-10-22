import { api } from "@/lib/api";
import { getConforaApiConfig, joinBaseUrlAndPath } from "@/lib/api/api-config";

export type PublicPersonnelRecord = {
  readonly status: string;
  readonly documentType: string | null;
  readonly issuedAt: string | null;
  readonly holderName: string | null;
};

export type PublicPersonnelResult =
  | { readonly kind: "ok"; readonly data: PublicPersonnelRecord }
  | { readonly kind: "not_found" }
  | { readonly kind: "rate_limited" }
  | { readonly kind: "error" };

export function isPersonnelCertificateNumber(value: string): boolean {
  return /^CON-\d{4}-\d{4}$/iu.test(value.trim());
}

export function personnelStatusLabel(status: string): string {
  switch (status) {
    case "VALID":
      return "Važeći";
    case "SUSPENDED":
      return "Suspendovan";
    case "WITHDRAWN":
      return "Povučen";
    case "EXPIRED":
      return "Istekao";
    default:
      return status;
  }
}

export function formatPersonnelDate(value: string | null): string {
  if (!value) {
    return "—";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }
  return parsed.toLocaleDateString("bs-BA", { dateStyle: "medium" });
}

async function publicGet(path: string): Promise<Response> {
  return fetch(joinBaseUrlAndPath(getConforaApiConfig().nestBaseUrl, path), {
    headers: { Accept: "application/json" },
  });
}

export async function fetchPublicPersonnelCertificate(number: string): Promise<PublicPersonnelResult> {
  const response = await publicGet(`/v1/public/certificates/${encodeURIComponent(number.trim())}`);
  if (response.status === 429) {
    return { kind: "rate_limited" };
  }
  if (!response.ok) {
    return { kind: "error" };
  }
  const data = (await response.json()) as PublicPersonnelRecord;
  if (typeof data?.status !== "string") {
    return { kind: "error" };
  }
  return { kind: "ok", data };
}

export async function issuePersonnelCertificate(body: {
  decisionId: string;
  holderDisplayName: string;
  registryConsent: boolean;
}): Promise<{ certificateNumber: string; status: string; credentialId: string }> {
  const { data } = await api.post<{ certificateNumber: string; status: string; credentialId: string }>(
    "/v1/committee/certificates",
    body,
  );
  return data;
}

export async function changePersonnelCertificateStatus(
  credentialId: string,
  body: { toStatus: "ACTIVE" | "SUSPENDED" | "WITHDRAWN"; reason: string },
): Promise<{ publicStatus: string }> {
  const { data } = await api.post<{ publicStatus: string }>(
    `/v1/committee/certificates/${encodeURIComponent(credentialId)}/status`,
    body,
  );
  return data;
}

export async function proposePersonnelAmfSuspension(
  credentialId: string,
  reason: string,
): Promise<{ suspended: boolean }> {
  const { data } = await api.post<{ suspended: boolean }>(
    `/v1/committee/certificates/${encodeURIComponent(credentialId)}/amf-proposals`,
    { reason },
  );
  return data;
}

export async function downloadHolderCertificatePdf(credentialId: string, filename: string): Promise<void> {
  const response = await api.get<ArrayBuffer>(`/v1/me/certificates/${encodeURIComponent(credentialId)}/pdf`, {
    responseType: "arraybuffer",
  });
  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadPersonnelCredential(credentialId: string, filename: string): Promise<void> {
  const { data } = await api.get<{ jwt: string }>(
    `/v1/me/certificates/${encodeURIComponent(credentialId)}/credential`,
  );
  const blob = new Blob([data.jwt], { type: "application/jwt" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function addPersonnelCpdRecord(
  credentialId: string,
  body: { title: string; hours: number; completedAt: string },
): Promise<void> {
  await api.post(`/v1/me/certificates/${encodeURIComponent(credentialId)}/cpd`, body);
}
