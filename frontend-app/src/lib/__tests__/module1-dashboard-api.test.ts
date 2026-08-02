/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from "vitest";

import {
  ME_DASHBOARD_CONTRACT_VERSION,
  type MeDashboardResponse,
} from "@/lib/module1-dashboard-api";

describe("module1-dashboard-api contract types (P1-A-03)", () => {
  it("declares MeDashboardResponse v1.1.0 contract version", () => {
    expect(ME_DASHBOARD_CONTRACT_VERSION).toBe("1.1.0");
  });

  it("accepts hero, stats, and activities on MeDashboardResponse", () => {
    const payload: MeDashboardResponse = {
      viewer: {
        userId: "b2000000-0000-4000-8000-000000000001",
        firstName: "Pilot",
        lastName: "Learner",
        email: "pilot@confora.test",
        accountStatus: "ACTIVE",
        roles: ["USR_CAND"],
        previewMode: false,
      },
      guards: { courseActionsDisabled: false, readOnlyHistory: false },
      catalog: { scopes: [], filters: { languages: [], levels: [] }, byScope: [] },
      progress: { inProgressCourses: [], nextExam: null, certificatesExpiringSoon: [] },
      notifications: [],
      hero: { subtitle: "Summary", overallProgressPct: 0, continueCourseId: "" },
      stats: {
        activeCourses: 0,
        totalCourses: 0,
        weekLearningLabel: "0h 00m learning",
        certificatesCount: 0,
        lastCertificateLabel: "—",
        avgScorePct: 0,
        trendActive: "down",
        trendWeek: "down",
        trendCerts: "down",
        trendScore: "down",
      },
      activities: [],
    };
    expect(payload.hero.subtitle).toBe("Summary");
    expect(payload.activities).toEqual([]);
  });
});
