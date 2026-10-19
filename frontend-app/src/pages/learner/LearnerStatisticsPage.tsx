import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { JSX } from "react";
import { Link } from "react-router";
import { DASHBOARD_NS } from "@confora/i18n";
import { useTranslation } from "react-i18next";

import { fetchLearningStatistics, saveAnalyticsConsent } from "@/lib/learning-api";

export default function LearnerStatisticsPage(): JSX.Element {
  const { t } = useTranslation(DASHBOARD_NS);
  const queryClient = useQueryClient();
  const stats = useQuery({ queryKey: ["learning", "statistics"], queryFn: fetchLearningStatistics });
  const consent = useMutation({
    mutationFn: saveAnalyticsConsent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["learning", "statistics"] });
    },
  });

  if (stats.isError) return <p role="alert" className="p-8 text-red-300">{t("learning.loadError")}</p>;
  if (!stats.data) return <p className="p-8" role="status">{t("loading")}</p>;

  return (
    <section aria-labelledby="learning-statistics" className="mx-auto max-w-4xl space-y-8 px-4 py-8 text-text-primary">
      <header>
        <h1 id="learning-statistics" className="text-3xl font-semibold">{t("learning.statisticsTitle")}</h1>
        <Link className="text-[#0EA5E9] underline-offset-4 hover:underline" to="/dashboard">{t("learning.backToDashboard")}</Link>
      </header>
      <section aria-labelledby="progress-heading">
        <h2 id="progress-heading" className="text-xl font-semibold">{t("learning.progress")}</h2>
        <ul className="mt-3 space-y-3">
          {stats.data.enrolments.map((row) => (
            <li key={row.enrolmentId}>
              <p className="font-medium">{row.courseTitle}</p>
              <div className="mt-1 h-2 rounded bg-white/10" role="progressbar" aria-valuenow={row.progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={row.courseTitle}>
                <div className="h-2 rounded bg-[#0EA5E9]" style={{ width: `${row.progressPercent}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="quiz-heading">
        <h2 id="quiz-heading" className="text-xl font-semibold">{t("learning.quizResults")}</h2>
        {stats.data.quizResults.length === 0 ? <p className="mt-2">{t("learning.noQuizResults")}</p> : null}
        <ul className="mt-3 space-y-2">
          {stats.data.quizResults.map((row) => (
            <li key={row.attemptId} className="rounded-xl border border-white/10 p-3">
              {row.courseTitle} · {row.quizTitle} · {row.scorePercent}% · {row.passed ? t("learning.passedShort") : t("learning.failedShort")}
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="consent-heading">
        <h2 id="consent-heading" className="text-xl font-semibold">{t("learning.consentLabel")}</h2>
        <p className="mt-2 text-text-secondary">{stats.data.analyticsConsent ? t("learning.consentOn") : t("learning.consentOff")}</p>
        <button
          type="button"
          className="mt-3 inline-flex h-11 items-center rounded-md border border-[#0EA5E9] px-4 text-[#0EA5E9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
          onClick={() => consent.mutate(!stats.data?.analyticsConsent)}
        >
          {stats.data.analyticsConsent ? t("learning.consentRevoke") : t("learning.consentGrant")}
        </button>
      </section>
    </section>
  );
}
