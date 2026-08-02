import { api } from "@/lib/api";

export const ME_DASHBOARD_CONTRACT_VERSION = "1.1.0" as const;

export type MeDashboardTrend = "up" | "down";

export type MeDashboardActivityKind = "lesson" | "quiz" | "enroll";

export type MeDashboardHero = {
  readonly subtitle: string;
  readonly overallProgressPct: number;
  readonly continueCourseId: string;
};

export type MeDashboardStats = {
  readonly activeCourses: number;
  readonly totalCourses: number;
  readonly weekLearningLabel: string;
  readonly certificatesCount: number;
  readonly lastCertificateLabel: string;
  readonly avgScorePct: number;
  readonly trendActive: MeDashboardTrend;
  readonly trendWeek: MeDashboardTrend;
  readonly trendCerts: MeDashboardTrend;
  readonly trendScore: MeDashboardTrend;
};

export type MeDashboardActivity = {
  readonly id: string;
  readonly kind: MeDashboardActivityKind;
  readonly title: string;
  readonly courseTag: string;
  readonly timeLabel: string;
  readonly occurredAt: string;
  readonly detail: string | null;
};

export type MeDashboardResponse = {
  readonly viewer: {
    readonly userId: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly accountStatus: string;
    readonly roles: readonly string[];
    readonly previewMode: boolean;
  };
  readonly guards: {
    readonly courseActionsDisabled: boolean;
    readonly readOnlyHistory: boolean;
  };
  readonly catalog: {
    readonly scopes: readonly { readonly id: string; readonly name: string }[];
    readonly filters: { readonly languages: readonly string[]; readonly levels: readonly string[] };
    readonly byScope: readonly {
      readonly scopeId: string;
      readonly scopeName: string;
      readonly courses: readonly {
        readonly id: string;
        readonly title: string;
        readonly scopeId: string;
        readonly scopeName: string;
        readonly coverImage: string | null;
        readonly languages: readonly string[];
        readonly level: string | null;
        readonly durationMin: number | null;
        readonly price: { readonly amount: string; readonly currency: string };
      }[];
    }[];
  };
  readonly progress: {
    readonly inProgressCourses: readonly {
      readonly enrollmentId: string;
      readonly courseId: string;
      readonly title: string;
      readonly scopeName: string;
      readonly progressPct: number;
      readonly status: string;
    }[];
    readonly nextExam: null | {
      readonly sessionId: string;
      readonly scheduledFor: string | null;
      readonly courseTitle: string;
      readonly scopeName: string;
    };
    readonly certificatesExpiringSoon: readonly {
      readonly id: string;
      readonly uid: string;
      readonly scopeText: string;
      readonly expiryDate: string | null;
    }[];
  };
  readonly notifications: readonly {
    readonly id: string;
    readonly eventKey: string;
    readonly title: string;
    readonly body: string;
    readonly createdAt: string;
    readonly readAt: string | null;
  }[];
  readonly hero: MeDashboardHero;
  readonly stats: MeDashboardStats;
  readonly activities: readonly MeDashboardActivity[];
};

export type CertificationPublicResponse = {
  readonly sections: readonly {
    readonly key: string;
    readonly documentId: string;
    readonly type: string;
    readonly title: string;
    readonly contentUrl: string | null;
    readonly aiReadableUrl: string | null;
    readonly version: number;
  }[];
  readonly generatedAt: string;
};

export const MODULE1_DASHBOARD_QUERY_KEY = ["module1", "me-dashboard"] as const;
export const MODULE1_PUBLIC_QUERY_KEY = ["module1", "certification-body-public"] as const;

export async function fetchMeDashboard(asUserId?: string): Promise<MeDashboardResponse> {
  const { data } = await api.get<MeDashboardResponse>("/v1/me/dashboard", {
    params: asUserId ? { asUserId } : undefined,
  });
  return data;
}

export async function fetchCertificationBodyInfo(): Promise<CertificationPublicResponse> {
  const { data } = await api.get<CertificationPublicResponse>("/v1/public/certification-body-info");
  return data;
}
