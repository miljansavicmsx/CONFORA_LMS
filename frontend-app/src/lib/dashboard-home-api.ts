import type { CourseCardProps } from "@/components/CourseCard";
import { api } from "@/lib/api";

export const DASHBOARD_HOME_QUERY_KEY = ["dashboard", "home"] as const;

export type DashboardCourseCardModel = Omit<CourseCardProps, "onClick">;

export type DashboardStats = {
  readonly activeCourses: number;
  readonly totalCourses: number;
  readonly weekLearningLabel: string;
  readonly certificatesCount: number;
  readonly lastCertificateLabel: string;
  readonly avgScorePct: number;
  readonly trendActive: "up" | "down";
  readonly trendWeek: "up" | "down";
  readonly trendCerts: "up" | "down";
  readonly trendScore: "up" | "down";
};

export type DashboardActivityKind = "lesson" | "quiz" | "enroll";

export type DashboardActivity = {
  readonly id: string;
  readonly kind: DashboardActivityKind;
  readonly title: string;
  readonly courseTag: string;
  readonly timeLabel: string;
  readonly detail?: string;
};

export type DashboardHomePayload = {
  readonly heroSubtitle: string;
  readonly overallProgressPct: number;
  readonly continueCourseId: string;
  readonly stats: DashboardStats;
  readonly activeCourses: readonly DashboardCourseCardModel[];
  readonly recommendedCourses: readonly DashboardCourseCardModel[];
  readonly activities: readonly DashboardActivity[];
};

type LearnerStatsApiActivity = {
  id: string;
  kind: string;
  title: string;
  courseTag: string;
  timeLabel: string;
  detail?: string;
};

type LearnerStatsApiResponse = {
  heroSubtitle: string;
  overallProgressPct: number;
  continueCourseId: string;
  stats: DashboardStats;
  activities: LearnerStatsApiActivity[];
};

function normalizeActivityKind(raw: string): DashboardActivityKind {
  if (raw === "lesson" || raw === "quiz" || raw === "enroll") {
    return raw;
  }
  return "lesson";
}

/** Učitava stvarne metrike i aktivnost iz backend-a (`GET /api/dashboard/learner/stats`). */
export async function fetchDashboardHome(): Promise<DashboardHomePayload> {
  const { data } = await api.get<LearnerStatsApiResponse>("/api/dashboard/learner/stats");

  const activities: DashboardActivity[] = (data.activities ?? []).map((a) => ({
    id: a.id,
    kind: normalizeActivityKind(a.kind),
    title: a.title,
    courseTag: a.courseTag,
    timeLabel: a.timeLabel,
    ...(typeof a.detail === "string" && a.detail.length > 0 ? { detail: a.detail } : {}),
  }));

  return {
    heroSubtitle: data.heroSubtitle,
    overallProgressPct: data.overallProgressPct,
    continueCourseId: data.continueCourseId ?? "",
    stats: data.stats,
    activeCourses: [],
    recommendedCourses: [],
    activities,
  };
}
