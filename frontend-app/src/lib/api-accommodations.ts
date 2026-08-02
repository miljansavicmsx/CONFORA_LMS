import { api } from "@/lib/api";

export type EquitableAccessStatement = {
  readonly title: string;
  readonly commitment: string;
  readonly standards: readonly string[];
  readonly accessibilityLevel: string;
  readonly latestCiReportUrl: string | null;
  readonly latestCiRunAt: string | null;
  readonly knownLimitations: readonly string[];
  readonly accommodationChannel: {
    readonly formPath: string;
    readonly email: string;
    readonly publicApplyNote: string;
  };
  readonly accessibilityFeedbackChannel: {
    readonly formPath: string;
    readonly routedTo: string;
    readonly email: string;
  };
  readonly lastReviewedAt: string | null;
  readonly reviewCadence: string;
  readonly nextReviewDate: string | null;
  readonly documentVersion: string | null;
  readonly artifactPath: string;
};

export type AccommodationRequestType =
  | "EXTRA_TIME"
  | "SCREEN_READER_COMPAT"
  | "LARGE_PRINT"
  | "SEPARATE_ROOM"
  | "SIGN_LANGUAGE"
  | "OTHER";

export type AccommodationRequest = {
  readonly id: string;
  readonly applicationId: string | null;
  readonly requestType: AccommodationRequestType;
  readonly detailsText: string;
  readonly evidenceUrl: string | null;
  readonly status: string;
  readonly requestedAt: string;
  readonly decisionAt: string | null;
  readonly decisionRationale: string | null;
  readonly accommodationsGranted: unknown;
};

export async function fetchEquitableAccessStatement(): Promise<EquitableAccessStatement> {
  const { data } = await api.get<EquitableAccessStatement>("/v1/public/equitable-access");
  return data;
}

export async function submitAccessibilityFeedback(body: {
  subjectLine: string;
  description: string;
  complainantName?: string;
  complainantEmail?: string;
}): Promise<{ id?: string }> {
  const { data } = await api.post("/v1/public/equitable-access/accessibility-feedback", body);
  return data as { id?: string };
}

export async function fetchMyAccommodations(): Promise<AccommodationRequest[]> {
  const { data } = await api.get<AccommodationRequest[]>("/v1/me/accommodations");
  return Array.isArray(data) ? data : [];
}

export async function submitAccommodationRequest(body: {
  requestType: AccommodationRequestType;
  detailsText: string;
  evidenceUrl?: string | null;
  applicationId?: string | null;
}): Promise<AccommodationRequest> {
  const { data } = await api.post<AccommodationRequest>("/v1/me/accommodations", body);
  return data;
}

export async function fetchAccommodationQueue(): Promise<
  Array<AccommodationRequest & { requester?: { email: string; firstName: string; lastName: string } }>
> {
  const { data } = await api.get("/v1/admin/accommodations/queue");
  return Array.isArray(data) ? data : [];
}

export async function decideAccommodation(
  id: string,
  body: {
    status: "APPROVED" | "PARTIALLY_APPROVED" | "REJECTED" | "UNDER_REVIEW";
    decisionRationale: string;
    accommodationsGranted?: { extraTimePct?: number; types?: string[] };
  },
): Promise<AccommodationRequest> {
  const { data } = await api.patch<AccommodationRequest>(`/v1/admin/accommodations/${id}/decision`, body);
  return data;
}
