/**
 * Statistics module API responses (`/api/me/statistics`, `/api/admin/statistics/*`, certification eligibility).
 */

import { api } from "@/lib/api";

export type DailyPerfPoint = {
  date: string;
  activeSeconds: number;
  lessonTouchCount: number;
};

export type QuizRecent = {
  quizId: string;
  scorePct: number | null;
  passed: boolean;
  createdAt: string | null;
};

export type CandidateStatistics = {
  dailyPerformance: DailyPerfPoint[];
  completedLessonsCount: number;
  quizResults: {
    attemptsConsidered: number;
    avgScorePct: number;
    passRatePct: number;
    recentAttempts: QuizRecent[];
  };
  examReadiness: Array<{
    courseId: string;
    courseTitle: string;
    overallProgressPct: number;
    examBestScorePct: number | null;
    examPassingPct: number;
    likelyReadyForExam: boolean;
    examPassed: boolean;
  }>;
  timeSpentSeconds: number;
  learningStreakDays: number;
  continuityScore: number;
  activeDaysLast7: number;
  activeDaysLast30?: number;
  recommendation: {
    title: string;
    detail: string;
    href: string;
    reason: string;
  };
};

export async function fetchCandidateStatistics(): Promise<CandidateStatistics> {
  const { data } = await api.get<CandidateStatistics>("/api/me/statistics");
  return data;
}

export type TrainingStatistics = Record<string, unknown>;

export async function fetchTrainingStatistics(params?: {
  inactiveDays?: number;
  sampleCap?: number;
}): Promise<TrainingStatistics> {
  const { data } = await api.get<TrainingStatistics>("/api/admin/statistics/training", {
    params: {
      inactive_days: params?.inactiveDays,
      sample_cap: params?.sampleCap,
    },
  });
  return data;
}

export type ExecutiveStatistics = Record<string, unknown>;

export type TechnicalStatistics = Record<string, unknown>;

export async function fetchTechnicalStatistics(sampleCap?: number): Promise<TechnicalStatistics> {
  const { data } = await api.get<TechnicalStatistics>("/api/admin/statistics/technical", {
    params: { sample_cap: sampleCap },
  });
  return data;
}

export async function fetchExecutiveStatistics(sampleCap?: number): Promise<ExecutiveStatistics> {
  const { data } = await api.get<ExecutiveStatistics>("/api/admin/statistics/executive", {
    params: { sample_cap: sampleCap },
  });
  return data;
}

export type EligibilityEvidenceResponse = Record<string, unknown>;

export async function fetchEligibilityEvidence(sampleCap?: number): Promise<EligibilityEvidenceResponse> {
  const { data } = await api.get<EligibilityEvidenceResponse>(
    "/api/certification/statistics/eligibility-evidence",
    { params: { sample_cap: sampleCap } },
  );
  return data;
}
