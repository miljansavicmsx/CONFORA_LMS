/**
 * Statistika učenja — kandidat + prošireni paneli za uloge (trening, izvršni, cert. odbor).
 */

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Activity,
  BarChart3,
  BookOpenCheck,
  Flame,
  Loader2,
  Target,
  TrendingUp,
} from "lucide-react";
import { useMemo, type JSX, type ReactNode } from "react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  fetchCandidateStatistics,
  fetchEligibilityEvidence,
  fetchExecutiveStatistics,
  fetchTechnicalStatistics,
  fetchTrainingStatistics,
  type CandidateStatistics,
} from "@/lib/statistics-api";
import { useAuthStore } from "@/stores/authStore";

const Q_CAND = ["statistics", "candidate"] as const;

function formatDuration(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h <= 0) {
    return `${m} min`;
  }
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function roleFlags(role: string | undefined) {
  const r = (role ?? "").trim().toLowerCase();
  return {
    training: ["training_admin", "admin", "sys_admin"].includes(r),
    technical: ["tech_committee", "sys_admin"].includes(r),
    executive: ["director", "admin", "sys_admin"].includes(r),
    certCommittee: ["cert_committee", "sys_admin"].includes(r),
    sysAdmin: r === "sys_admin",
  };
}

function hasLearnerActivity(data: CandidateStatistics): boolean {
  return (
    data.timeSpentSeconds > 0 ||
    data.completedLessonsCount > 0 ||
    data.quizResults.attemptsConsidered > 0 ||
    data.examReadiness.length > 0 ||
    data.dailyPerformance.some((d) => d.activeSeconds > 0)
  );
}

function DailyChart({ series }: { readonly series: CandidateStatistics["dailyPerformance"] }): JSX.Element {
  const maxSec = useMemo(
    () => Math.max(1, ...series.map((d) => d.activeSeconds)),
    [series],
  );
  return (
    <div className="space-y-2">
      <div className="flex h-36 items-end gap-1">
        {series.map((d) => {
          const hPct = Math.round((d.activeSeconds / maxSec) * 100);
          return (
            <div key={d.date} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div
                className="w-full max-w-[28px] rounded-t-md bg-brand/50 ring-1 ring-brand/25"
                style={{ height: `${Math.max(8, hPct)}%` }}
                title={`${d.date}: ${formatDuration(d.activeSeconds)}`}
              />
              <span className="truncate text-[10px] text-text-muted">
                {d.date.slice(5).replace("-", "/")}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-text-muted">
        Zadnjih 14 dana (sekunde aktivnosti po danu, agregirano iz zapisa napretka).
      </p>
    </div>
  );
}

export default function StatisticsPage(): JSX.Element {
  const role = useAuthStore((s) => s.user?.role);
  const flags = useMemo(() => roleFlags(role), [role]);

  const candQ = useQuery({
    queryKey: Q_CAND,
    queryFn: fetchCandidateStatistics,
  });

  const trainQ = useQuery({
    queryKey: ["statistics", "training"],
    queryFn: () => fetchTrainingStatistics({ inactiveDays: 14, sampleCap: 2500 }),
    enabled: flags.training,
    retry: false,
  });

  const execQ = useQuery({
    queryKey: ["statistics", "executive"],
    queryFn: () => fetchExecutiveStatistics(1500),
    enabled: flags.executive,
    retry: false,
  });

  const techQ = useQuery({
    queryKey: ["statistics", "technical"],
    queryFn: () => fetchTechnicalStatistics(2500),
    enabled: flags.technical,
    retry: false,
  });

  const eligQ = useQuery({
    queryKey: ["statistics", "eligibility"],
    queryFn: () => fetchEligibilityEvidence(500),
    enabled: flags.certCommittee,
    retry: false,
  });

  const trainErr =
    trainQ.isError && axios.isAxiosError(trainQ.error) && trainQ.error.response?.status === 403;
  const execErr =
    execQ.isError && axios.isAxiosError(execQ.error) && execQ.error.response?.status === 403;
  const eligErr =
    eligQ.isError && axios.isAxiosError(eligQ.error) && eligQ.error.response?.status === 403;
  const techErr =
    techQ.isError && axios.isAxiosError(techQ.error) && techQ.error.response?.status === 403;

  const data = candQ.data;
  const noLearnerData = data ? !hasLearnerActivity(data) : false;

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="flex items-start gap-4 border-b border-border/40 pb-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
            <BarChart3 className="h-6 w-6 text-brand" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Statistika</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Napredak, kvizovi i priprema za ispit temelje se na vašim zapisima učenja i statusu upisa.
            </p>
          </div>
        </header>

        {candQ.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Učitavanje statistike…
          </div>
        ) : null}

        {candQ.error ? (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {candQ.error instanceof Error ? candQ.error.message : "Greška pri učitavanju."}
          </p>
        ) : null}

        {data ? (
          <>
            {noLearnerData ? (
              <section className="rounded-2xl border border-dashed border-border/60 bg-surface-secondary/30 p-6">
                <h2 className="text-lg font-semibold text-text-primary">Još nema statistike učenja.</h2>
                <p className="mt-2 text-sm text-text-secondary">
                  Odaberite kurs i završite prvu lekciju ili kviz. Nakon toga će se prikazati dnevni učinak, streak,
                  kviz rezultati i spremnost za ispit.
                </p>
                <Button asChild className="mt-4 bg-brand text-white hover:bg-brand/90">
                  <Link to="/dashboard/courses">Odaberite kurs</Link>
                </Button>
              </section>
            ) : null}
            <section
              className="rounded-2xl border border-border/50 bg-surface-secondary/35 p-6 ring-1 ring-white/[0.04]"
              aria-label="Preporuka sljedećeg koraka"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Sljedeći korak
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-text-primary">{data.recommendation.title}</h2>
                  <p className="mt-2 text-sm text-text-secondary">{data.recommendation.detail}</p>
                </div>
                <Button
                  asChild
                  className="shrink-0 bg-brand font-semibold text-white hover:bg-brand/90"
                >
                  <Link to={data.recommendation.href}>Otvori</Link>
                </Button>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Ključne metrike">
              <MetricCard
                icon={<Flame className="h-4 w-4 text-amber-300" />}
                label="Streak (dana)"
                value={String(data.learningStreakDays)}
              />
              <MetricCard
                icon={<Activity className="h-4 w-4 text-sky-300" />}
                label="Kontinuitet (0–100)"
                value={String(data.continuityScore)}
              />
              <MetricCard
                icon={<TrendingUp className="h-4 w-4 text-emerald-300" />}
                label="Aktivni dani (7d)"
                value={String(data.activeDaysLast7)}
              />
              <MetricCard
                icon={<BookOpenCheck className="h-4 w-4 text-violet-300" />}
                label="Završene lekcije"
                value={String(data.completedLessonsCount)}
              />
            </section>

            <section className="grid gap-4 sm:grid-cols-2" aria-label="Aktivni dani i readiness">
              <MetricCard
                icon={<Activity className="h-4 w-4 text-sky-300" />}
                label="Aktivni dani (30d)"
                value={String(data.activeDaysLast30 ?? data.activeDaysLast7)}
              />
              <MetricCard
                icon={<Target className="h-4 w-4 text-brand" />}
                label="Kursevi spremni za ispit"
                value={String(data.examReadiness.filter((r) => r.likelyReadyForExam && !r.examPassed).length)}
              />
            </section>

            <div className="rounded-2xl border border-border/50 bg-surface-secondary/25 p-5 ring-1 ring-white/[0.04]">
              <p className="text-sm font-semibold text-text-primary">Ukupno vrijeme učenja (iz napretka)</p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-text-primary">
                {formatDuration(data.timeSpentSeconds)}
              </p>
            </div>

            <section className="rounded-2xl border border-border/50 bg-surface-secondary/25 p-5 ring-1 ring-white/[0.04]">
              <h2 className="text-sm font-semibold text-text-primary">Dnevna aktivnost</h2>
              <div className="mt-4">
                {data.dailyPerformance.some((d) => d.activeSeconds > 0) ? (
                  <DailyChart series={data.dailyPerformance} />
                ) : (
                  <p className="rounded-xl border border-dashed border-border/50 px-4 py-5 text-sm text-text-muted">
                    Nema dnevne aktivnosti u zadnjem periodu. Otvorite kurs i završite lekciju da se graf popuni.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-border/50 bg-surface-secondary/25 p-5 ring-1 ring-white/[0.04]">
              <h2 className="text-sm font-semibold text-text-primary">Kvizovi</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="border-border/50">
                  Prosjek: {data.quizResults.avgScorePct}%
                </Badge>
                <Badge variant="outline" className="border-border/50">
                  Prolaznost: {data.quizResults.passRatePct}%
                </Badge>
                <Badge variant="outline" className="border-border/50">
                  Uzorko: {data.quizResults.attemptsConsidered} pokušaja
                </Badge>
              </div>
              <div className="mt-4 overflow-x-auto">
                {data.quizResults.recentAttempts.length ? (
                <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/40 text-xs uppercase text-text-muted">
                      <th className="py-2 font-medium">Kviz</th>
                      <th className="py-2 font-medium">Bodovi</th>
                      <th className="py-2 font-medium">Prolaz</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.quizResults.recentAttempts.slice(0, 12).map((q) => (
                      <tr key={`${q.quizId}-${q.createdAt}`} className="border-b border-border/30">
                        <td className="py-2 font-mono text-xs text-text-secondary">{q.quizId || "—"}</td>
                        <td className="py-2 tabular-nums text-text-primary">
                          {q.scorePct != null ? `${q.scorePct}%` : "—"}
                        </td>
                        <td className="py-2 text-text-secondary">{q.passed ? "Da" : "Ne"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                ) : (
                  <p className="rounded-xl border border-dashed border-border/50 px-4 py-5 text-sm text-text-muted">
                    Nema pokušaja kviza. Nakon prvog kviza prikazat će se prosjek, prolaznost i zadnji pokušaji.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-border/50 bg-surface-secondary/25 p-5 ring-1 ring-white/[0.04]">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-text-muted" aria-hidden />
                <h2 className="text-sm font-semibold text-text-primary">Priprema za ispit</h2>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/40 text-xs uppercase text-text-muted">
                      <th className="py-2 font-medium">Kurs</th>
                      <th className="py-2 font-medium text-right">Napredak</th>
                      <th className="py-2 font-medium text-right">Najbolji ispit</th>
                      <th className="py-2 font-medium">Spreman?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.examReadiness.map((row) => (
                      <tr key={row.courseId} className="border-b border-border/30">
                        <td className="py-2 text-text-primary">{row.courseTitle || row.courseId}</td>
                        <td className="py-2 text-right tabular-nums">{row.overallProgressPct}%</td>
                        <td className="py-2 text-right tabular-nums text-text-secondary">
                          {row.examBestScorePct != null ? `${row.examBestScorePct}%` : "—"}
                          <span className="ml-1 text-xs text-text-muted">/ {row.examPassingPct}%</span>
                        </td>
                        <td className="py-2">
                          {row.examPassed ? (
                            <Badge className="border-emerald-500/40 bg-emerald-500/15 text-emerald-100">
                              Položio
                            </Badge>
                          ) : row.likelyReadyForExam ? (
                            <Badge className="border-sky-500/40 bg-sky-500/15 text-sky-100">Vjerojatno spreman</Badge>
                          ) : (
                            <Badge variant="outline" className="border-border/50 text-text-muted">
                              U tijeku
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.examReadiness.length === 0 ? (
                  <p className="mt-3 text-sm text-text-muted">Nema aktivnih upisa za prikaz.</p>
                ) : null}
              </div>
            </section>
          </>
        ) : null}

        {flags.training ? (
          <AdminPanel
            title="Trening administracija"
            subtitle="Aktivni polaznici, stopa završetka, distribucija kvizova (uzorkovani podaci)."
            loading={trainQ.isLoading}
            forbidden={trainErr}
            error={Boolean(trainQ.error && !trainErr)}
          >
            {trainQ.data ? <KeyValueGrid data={trainQ.data as Record<string, unknown>} /> : null}
          </AdminPanel>
        ) : null}

        {flags.technical ? (
          <AdminPanel
            title="Tehnički komitet — statistika pitanja"
            subtitle="Kvalitet baze pitanja, AI prijedlozi i pokušaji s niskim rezultatom."
            loading={techQ.isLoading}
            forbidden={techErr}
            error={Boolean(techQ.error && !techErr)}
          >
            {techQ.data ? <KeyValueGrid data={techQ.data as Record<string, unknown>} /> : null}
          </AdminPanel>
        ) : null}

        {flags.executive ? (
          <AdminPanel
            title="Izvršni pregled"
            subtitle="Trendovi certifikacije, prolaznost ispita, performans kurseva, AI tutor okidači."
            loading={execQ.isLoading}
            forbidden={execErr}
            error={Boolean(execQ.error && !execErr)}
          >
            {execQ.data ? <KeyValueGrid data={execQ.data as Record<string, unknown>} /> : null}
          </AdminPanel>
        ) : null}

        {flags.sysAdmin ? (
          <AdminPanel
            title="Sys admin — health KPI"
            subtitle="Širi pregled kombinira podatke obuke i rukovodstva — u skladu s vašom ulogom."
            loading={trainQ.isLoading || execQ.isLoading}
            forbidden={false}
            error={Boolean((trainQ.error && !trainErr) || (execQ.error && !execErr))}
          >
            <KeyValueGrid
              data={{
                training: trainQ.data ?? "nema podataka",
                executive: execQ.data ?? "nema podataka",
              }}
            />
          </AdminPanel>
        ) : null}

        {flags.certCommittee ? (
          <AdminPanel
            title="Certifikacijski odbor — eligibility dokazi"
            subtitle="Sažetak ukupnih brojki i pragova učenja, bez rasporeda po satima."
            loading={eligQ.isLoading}
            forbidden={eligErr}
            error={Boolean(eligQ.error && !eligErr)}
          >
            {eligQ.data ? <EligibilityTable payload={eligQ.data as Record<string, unknown>} /> : null}
          </AdminPanel>
        ) : null}
      </div>
    </div>
  );
}

function MetricCard(props: {
  readonly icon: ReactNode;
  readonly label: string;
  readonly value: string;
}): JSX.Element {
  return (
    <div className="rounded-2xl border border-border/50 bg-surface-secondary/35 p-4 ring-1 ring-white/[0.04]">
      <div className="flex items-center gap-2 text-text-muted">{props.icon}</div>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-text-muted">{props.label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-text-primary">{props.value}</p>
    </div>
  );
}

function AdminPanel(props: {
  readonly title: string;
  readonly subtitle: string;
  readonly loading: boolean;
  readonly forbidden: boolean;
  readonly error: boolean;
  readonly children: JSX.Element | null;
}): JSX.Element {
  return (
    <section className="rounded-2xl border border-border/50 bg-surface-secondary/20 p-6 ring-1 ring-white/[0.04]">
      <h2 className="text-lg font-semibold text-text-primary">{props.title}</h2>
      <p className="mt-1 text-sm text-text-secondary">{props.subtitle}</p>
      {props.loading ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Učitavanje…
        </div>
      ) : null}
      {props.forbidden ? (
        <p className="mt-4 text-sm text-amber-100">Nedovoljne ovlasti za ovaj dio (provjerite ulogu u profilu).</p>
      ) : null}
      {props.error ? (
        <p className="mt-4 text-sm text-rose-100">Greška pri dohvatu podataka.</p>
      ) : null}
      {!props.loading && !props.forbidden && props.children ? <div className="mt-4">{props.children}</div> : null}
    </section>
  );
}

function KeyValueGrid({ data }: { readonly data: Record<string, unknown> }): JSX.Element {
  const entries = Object.entries(data).filter(([k]) => k !== "rows");
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {entries.map(([k, v]) => (
        <div
          key={k}
          className="rounded-xl border border-border/40 bg-surface-primary/20 px-3 py-2 text-sm text-text-secondary"
        >
          <span className="font-mono text-xs text-text-muted">{k}</span>
          <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-all text-xs text-text-primary">
            {typeof v === "object" && v !== null ? JSON.stringify(v, null, 2) : String(v)}
          </pre>
        </div>
      ))}
    </div>
  );
}

function EligibilityTable({ payload }: { readonly payload: Record<string, unknown> }): JSX.Element {
  const rows = payload.rows as
    | Array<{
        applicationId: string;
        maskedUserId: string;
        courseTitle: string;
        applicationStatus: string;
        courseProgressPct: number | null;
        examBestScorePct: number | null;
        trainingCompleteGate: boolean;
        examMeetsPassingGate: boolean;
      }>
    | undefined;
  if (!rows?.length) {
    return <p className="text-sm text-text-muted">Nema redaka u uzorku.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border/40 text-xs uppercase text-text-muted">
            <th className="py-2 pr-2 font-medium">Prijava</th>
            <th className="py-2 pr-2 font-medium">Korisnik</th>
            <th className="py-2 pr-2 font-medium">Kurs</th>
            <th className="py-2 pr-2 font-medium">Status</th>
            <th className="py-2 pr-2 font-medium text-right">Napredak</th>
            <th className="py-2 pr-2 font-medium text-right">Ispit</th>
            <th className="py-2 font-medium">Obuka OK</th>
            <th className="py-2 font-medium">Ispit OK</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((r) => (
            <tr key={r.applicationId} className="border-b border-border/30">
              <td className="py-2 font-mono text-xs">
                {r.applicationId.length > 12 ? `${r.applicationId.slice(0, 12)}…` : r.applicationId}
              </td>
              <td className="py-2 text-text-muted">{r.maskedUserId}</td>
              <td className="py-2">{r.courseTitle}</td>
              <td className="py-2">{r.applicationStatus}</td>
              <td className="py-2 text-right tabular-nums">
                {r.courseProgressPct != null ? `${r.courseProgressPct}%` : "—"}
              </td>
              <td className="py-2 text-right tabular-nums">
                {r.examBestScorePct != null ? `${r.examBestScorePct}%` : "—"}
              </td>
              <td className="py-2">{r.trainingCompleteGate ? "Da" : "Ne"}</td>
              <td className="py-2">{r.examMeetsPassingGate ? "Da" : "Ne"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
