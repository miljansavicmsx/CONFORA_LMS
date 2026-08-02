/**
 * Sys admin console — platform overview, learning inspection, verification trail.
 */

import { api } from "@/lib/api";

export type PlatformOverview = {
  readonly applicationsByStatus: Record<string, number>;
  readonly decisionsByStatus: Record<string, number>;
  readonly certificatesByKind: Record<string, number>;
  readonly enrollmentsActive: number;
  readonly enrollmentsTotalSampled: number;
  readonly auditEventsLast24hSampled: number;
  readonly aiTutorEventsLast24hSampled: number;
  readonly verificationEventsLast24hSampled: number;
  readonly suspiciousAuditFlagsSampled: number;
  readonly sampleLimits: Record<string, number>;
};

export type LearningInspection = {
  readonly userId: string;
  readonly enrollmentRows: readonly Record<string, unknown>[];
  readonly learningProgressRows: readonly Record<string, unknown>[];
  readonly certificateRows: readonly Record<string, unknown>[];
  readonly examAttemptRows: readonly Record<string, unknown>[];
  readonly quizAttemptRows: readonly Record<string, unknown>[];
};

export type CertificateVerificationRow = {
  readonly verificationId: string;
  readonly createdAt: string;
  readonly method: string;
  readonly result: string;
  readonly certificateId?: string | null;
  readonly verificationValueRedacted: string;
  readonly ipRedacted?: string | null;
};

export type CertificateVerificationListResponse = {
  readonly items: readonly CertificateVerificationRow[];
  readonly nextCursor: string | null;
};

export async function fetchPlatformOverview(): Promise<PlatformOverview> {
  const { data } = await api.get<PlatformOverview>("/api/admin/sys/platform-overview");
  return data;
}

export async function fetchLearningInspection(userId: string): Promise<LearningInspection> {
  const { data } = await api.get<LearningInspection>(
    `/api/admin/sys/users/${encodeURIComponent(userId)}/learning-inspection`,
  );
  return data;
}

export async function fetchCertificateVerifications(params: {
  readonly limit?: number;
  readonly cursor?: string | null;
}): Promise<CertificateVerificationListResponse> {
  const { data } = await api.get<CertificateVerificationListResponse>(
    "/api/admin/sys/certificate-verifications",
    {
      params: {
        limit: params.limit ?? 40,
        ...(params.cursor ? { cursor: params.cursor } : {}),
      },
    },
  );
  return {
    items: data.items ?? [],
    nextCursor: data.nextCursor ?? null,
  };
}
