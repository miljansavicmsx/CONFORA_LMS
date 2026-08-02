/**
 * Central JSON fallbacks for LMS API calls during Vitest (jsdom).
 * Keep responses minimal and non-sensitive — only enough for components to render.
 */

let unmockedWarned = false;

export function warnUnmockedLmsApiOnce(method: string, url: string): void {
  if (unmockedWarned) {
    return;
  }
  unmockedWarned = true;
  console.warn(`Test intercepted unmocked API request: ${method} ${url}`);
}

/** @returns null when no canned mock — caller should synthesize HTTP 404. */
export function resolveLmsTestMock(
  method: string,
  pathname: string,
): { status: number; data: unknown } | null {
  const m = method.toUpperCase();
  const p = pathname.replace(/\/+$/, "") || "/";

  if (m === "GET" && p === "/api/public/launch-mode") {
    return { status: 200, data: { launchMode: "pilot" } };
  }
  if (m === "POST" && p === "/api/demo/start") {
    return { status: 200, data: { demoId: "vitest-demo" } };
  }
  if (m === "GET" && p === "/api/admin/backups/status") {
    return {
      status: 200,
      data: {
        enabled: false,
        provider: "test",
        lastBackupAt: null,
        lastRestoreSmoke: null,
        retentionDays: 7,
        rpoHours: 24,
        rtoHours: 4,
      },
    };
  }
  if (m === "POST" && p === "/api/admin/backups/restore-smoke") {
    return { status: 200, data: { status: "skipped", reason: "vitest" } };
  }
  if (m === "GET" && p.startsWith("/api/admin/support/tickets")) {
    return { status: 200, data: [] };
  }
  if (m === "POST" && p === "/api/public/certificates/verify") {
    return { status: 200, data: { valid: false } };
  }
  if (m === "POST" && p === "/api/onboarding/request-demo") {
    return { status: 200, data: { leadId: "vitest-lead" } };
  }
  if (m === "POST" && p === "/api/onboarding/start-trial") {
    return { status: 200, data: { leadId: "vitest-trial" } };
  }
  if (m === "POST" && p === "/api/sales/contact") {
    return { status: 200, data: { leadId: "vitest-sales" } };
  }
  if (m === "GET" && p === "/api/admin/leads") {
    return { status: 200, data: [] };
  }
  if (m === "GET" && p === "/api/admin/leads/launch-status") {
    return { status: 200, data: {} };
  }
  if (m === "GET" && (p === "/api/courses" || p.startsWith("/api/courses/"))) {
    return { status: 200, data: [] };
  }
  if (m === "GET" && p === "/api/public/cases") {
    return { status: 200, data: [] };
  }
  if (m === "GET" && p === "/v1/staff/reports/overview") {
    return {
      status: 200,
      data: {
        contractVersion: "vitest",
        generatedAt: "2026-06-14T00:00:00.000Z",
        counts: {},
        slaSummary: {},
      },
    };
  }
  if (m === "GET" && p === "/v1/staff/reports/available") {
    return { status: 200, data: { available: ["overview"] } };
  }
  if (m === "GET" && p === "/v1/staff/reports/export/policy") {
    return { status: 200, data: { formats: ["JSON", "CSV"], reportKeys: ["certificates"] } };
  }
  if (m === "POST" && p === "/v1/staff/reports/export") {
    return { status: 200, data: "status,count\nsubmitted,1\n" };
  }
  if (m === "GET" && p === "/api/roleplay/scenarios") {
    return { status: 200, data: [] };
  }
  if (m === "POST" && p === "/api/roleplay/sessions") {
    return {
      status: 200,
      data: {
        sessionId: "vitest-session",
        scenarioId: "vitest-scenario",
        status: "open",
      },
    };
  }
  if (
    m === "POST" &&
    /^\/api\/roleplay\/sessions\/[^/]+\/evaluate$/.test(p)
  ) {
    return {
      status: 200,
      data: {
        sessionId: "vitest-session",
        status: "evaluated",
        passed: false,
        score: 0,
        feedback: "",
      },
    };
  }
  const learnerStats = {
    heroSubtitle: "Vitest",
    overallProgressPct: 0,
    continueCourseId: "",
    stats: {
      activeCourses: 0,
      totalCourses: 0,
      weekLearningLabel: "—",
      certificatesCount: 0,
      lastCertificateLabel: "—",
      avgScorePct: 0,
      trendActive: "up" as const,
      trendWeek: "up" as const,
      trendCerts: "up" as const,
      trendScore: "up" as const,
    },
    activities: [] as unknown[],
  };
  if (m === "GET" && p === "/api/dashboard/learner/stats") {
    return { status: 200, data: learnerStats };
  }

  return null;
}
