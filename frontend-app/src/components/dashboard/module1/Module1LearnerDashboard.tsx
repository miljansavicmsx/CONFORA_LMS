import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BookOpen, ChevronRight, Clock3, GraduationCap, Trophy } from "lucide-react";
import { Link } from "react-router";
import { useMemo, useState, useEffect, type JSX, type ReactNode } from "react";

import { ActivityBlock } from "@/components/dashboard/ActivityBlock";
import { DashboardSupportChat } from "@/components/dashboard/module1/DashboardSupportChat";
import { HeroProgressRing } from "@/components/dashboard/HeroProgressRing";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import type { DashboardActivity } from "@/lib/dashboard-home-api";
import {
  MODULE1_DASHBOARD_QUERY_KEY,
  MODULE1_PUBLIC_QUERY_KEY,
  fetchCertificationBodyInfo,
  fetchMeDashboard,
  type MeDashboardActivity,
} from "@/lib/module1-dashboard-api";

const PUBLIC_SECTION_LABEL: Record<string, string> = {
  scopeOfCertification: "Opseg certifikacije",
  prerequisites: "Preduvjeti",
  initialCertification: "Početna certifikacija",
  surveillance: "Nadzor",
  recertification: "Recertifikacija",
  certificationProcess: "Proces certifikacije",
};

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&h=360&fit=crop";

function useCountdownLabel(iso: string | null): string | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!iso) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [iso]);
  if (!iso) return null;
  const t = new Date(iso).getTime();
  const s = Math.max(0, Math.floor((t - now) / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${String(d)}d ${String(h)}h ${String(m)}m`;
  if (h > 0) return `${String(h)}h ${String(m)}m ${String(sec)}s`;
  return `${String(m)}m ${String(sec)}s`;
}

function accountStatusLabel(status: string): string {
  const u = status.toUpperCase();
  if (u === "ACTIVE") return "Aktivan";
  if (u === "SUSPENDED") return "Suspendiran";
  if (u === "WITHDRAWN") return "Povučen";
  if (u === "PENDING") return "Na čekanju";
  return status;
}

function mapActivitiesForBlock(activities: readonly MeDashboardActivity[]): DashboardActivity[] {
  return activities.map((a) => ({
    id: a.id,
    kind: a.kind,
    title: a.title,
    courseTag: a.courseTag,
    timeLabel: a.timeLabel,
    ...(a.detail ? { detail: a.detail } : {}),
  }));
}

export type Module1LearnerDashboardProps = {
  readonly fallback: ReactNode;
};

export function Module1LearnerDashboard({ fallback }: Module1LearnerDashboardProps): JSX.Element {
  const dashQ = useQuery({
    queryKey: MODULE1_DASHBOARD_QUERY_KEY,
    queryFn: () => fetchMeDashboard(),
    retry: 1,
  });
  const pubQ = useQuery({
    queryKey: MODULE1_PUBLIC_QUERY_KEY,
    queryFn: () => fetchCertificationBodyInfo(),
    staleTime: 3600_000,
    retry: 1,
  });

  const [scopeFilter, setScopeFilter] = useState<string>("all");
  const [langFilter, setLangFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const examCountdown = useCountdownLabel(dashQ.data?.progress?.nextExam?.scheduledFor ?? null);

  const activityItems = useMemo(
    () => mapActivitiesForBlock(dashQ.data?.activities ?? []),
    [dashQ.data?.activities],
  );

  const filteredCatalog = useMemo(() => {
    if (!dashQ.data) return [];
    return dashQ.data.catalog.byScope
      .map((g) => ({
        ...g,
        courses: g.courses.filter((c) => {
          if (scopeFilter !== "all" && c.scopeId !== scopeFilter) return false;
          if (langFilter !== "all" && !c.languages.includes(langFilter)) return false;
          if (levelFilter !== "all" && (c.level ?? "").trim() !== levelFilter) return false;
          return true;
        }),
      }))
      .filter((g) => g.courses.length > 0);
  }, [dashQ.data, scopeFilter, langFilter, levelFilter]);

  if (dashQ.isPending) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Učitavanje modula 1">
        <div className="h-32 animate-pulse rounded-2xl bg-surface-secondary/80" />
        <div className="h-48 animate-pulse rounded-2xl bg-surface-secondary/80" />
      </div>
    );
  }

  if (dashQ.isError || !dashQ.data) {
    return <>{fallback}</>;
  }

  const d = dashQ.data;
  const guards = d.guards;
  const v = d.viewer;
  const suspended = v.accountStatus === "SUSPENDED";
  const withdrawn = guards.readOnlyHistory;

  return (
    <div className="relative space-y-10 pb-28 text-text-primary">
      {v.previewMode ? (
        <div
          role="status"
          className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-text-primary"
        >
          Pregled nadzorne ploče kao polaznik (QA). Prikazuje se dashboard za ciljnog korisnika — akcija je zabilježena u
          revizijskom zapisu.
        </div>
      ) : null}

      <section aria-labelledby="module1-welcome-heading" className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 id="module1-welcome-heading" className="text-2xl font-bold tracking-tight">
            Dobro došli, {v.firstName}
          </h1>
          <span
            className="inline-flex items-center rounded-full border border-border/60 bg-surface-secondary px-3 py-1 text-xs font-medium text-text-secondary"
            aria-label={`Status računa: ${accountStatusLabel(v.accountStatus)}`}
          >
            {accountStatusLabel(v.accountStatus)}
          </span>
        </div>

        {suspended ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-2xl border border-amber-500/35 bg-amber-500/10 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-text-primary">Račun je suspendiran</p>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  ISO §4.4 — prije novih upisa ili kupnji tečajeva potrebno je podmiriti obveze. Nastavite na financijskom
                  modulu.
                </p>
              </div>
            </div>
            <Button type="button" className="shrink-0 bg-brand text-white hover:bg-brand/90" asChild>
              <Link to="/dashboard/finance" className="inline-flex items-center gap-2">
                Podmiriti obveze
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        ) : null}
      </section>

      <section
        aria-labelledby="module1-hero-heading"
        className="rounded-2xl border border-border/50 bg-surface-secondary/35 p-5 sm:p-6"
      >
        <h2 id="module1-hero-heading" className="sr-only">
          Sažetak učenja
        </h2>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            <p className="text-sm font-medium leading-relaxed text-text-primary">{d.hero.subtitle}</p>
            <div className="flex flex-wrap gap-2">
              {d.hero.continueCourseId ? (
                <Button type="button" className="bg-brand text-white hover:bg-brand/90" asChild>
                  <Link
                    to={`/learn/${encodeURIComponent(d.hero.continueCourseId)}`}
                    className="inline-flex items-center gap-2"
                  >
                    Nastavi učenje
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              ) : (
                <Button type="button" variant="outline" className="border-border/60" disabled aria-disabled="true">
                  Nastavi učenje
                </Button>
              )}
            </div>
            <dl className="grid gap-1 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-text-muted">Aktivni programi</dt>
                <dd className="font-semibold text-text-primary">
                  {d.stats.activeCourses} / {d.stats.totalCourses}
                </dd>
              </div>
              <div>
                <dt className="text-text-muted">Tempo ove sedmice</dt>
                <dd className="font-semibold text-text-primary">{d.stats.weekLearningLabel}</dd>
              </div>
            </dl>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-2">
            <HeroProgressRing percent={d.hero.overallProgressPct} />
            <p className="text-xs text-text-muted">Ukupan napredak</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="module1-stats-heading" className="space-y-4">
        <h2 id="module1-stats-heading" className="text-lg font-semibold tracking-tight">
          Pokazatelji učenja
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={GraduationCap}
            label="Upisani programi"
            value={`${d.stats.activeCourses}/${d.stats.totalCourses}`}
            subtitle="od ukupnog kataloga"
            trend={d.stats.trendActive}
          />
          <StatCard
            icon={Clock3}
            label="Sedmični tempo"
            value={d.stats.weekLearningLabel}
            subtitle="procjena učenja"
            trend={d.stats.trendWeek}
          />
          <StatCard
            icon={BookOpen}
            label="Prosjek ispita"
            value={`${d.stats.avgScorePct}%`}
            subtitle="agregirani rezultat"
            trend={d.stats.trendScore}
          />
          <StatCard
            icon={Trophy}
            label="Certifikati"
            value={d.stats.certificatesCount}
            subtitle={d.stats.lastCertificateLabel}
            trend={d.stats.trendCerts}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border/50 bg-surface-secondary/25 p-4 sm:p-5">
        <ActivityBlock activities={activityItems} />
      </section>

      <section aria-labelledby="module1-public-heading" className="space-y-3">
        <h2 id="module1-public-heading" className="text-lg font-semibold tracking-tight">
          Javne informacije o tijelu za certifikaciju
        </h2>
        {pubQ.isError ? (
          <p className="text-sm text-text-secondary">Javni sadržaj trenutno nije dostupan. Pokušajte kasnije.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {(pubQ.data?.sections ?? []).map((s) => (
              <li
                key={s.documentId}
                className="rounded-xl border border-border/50 bg-surface-secondary/40 p-4"
              >
                <p className="text-sm font-medium text-text-primary">
                  {PUBLIC_SECTION_LABEL[s.key] ?? s.title}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  Dokument v{s.version} — objavljeno iz upravljanja dokumentima.
                </p>
                {s.contentUrl ? (
                  <a
                    href={s.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex text-xs font-semibold text-brand underline-offset-4 hover:underline"
                  >
                    Otvori službeni materijal (PDF/stranica)
                  </a>
                ) : (
                  <p className="mt-2 text-xs text-text-muted">Poveznica još nije objavljena.</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="module1-catalog-heading" className="space-y-4">
        <h2 id="module1-catalog-heading" className="text-lg font-semibold tracking-tight">
          Katalog tečajeva
        </h2>
        {withdrawn ? (
          <p className="text-sm text-text-secondary">
            Povučeni račun — katalog je skriven; dostupna je samo povijest u nastavku.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtri kataloga">
              <label className="sr-only" htmlFor="flt-scope">
                Opseg
              </label>
              <select
                id="flt-scope"
                className="rounded-lg border border-border/60 bg-surface-secondary px-2 py-1.5 text-xs"
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value)}
              >
                <option value="all">Svi opsezi</option>
                {d.catalog.scopes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="flt-lang">
                Jezik
              </label>
              <select
                id="flt-lang"
                className="rounded-lg border border-border/60 bg-surface-secondary px-2 py-1.5 text-xs"
                value={langFilter}
                onChange={(e) => setLangFilter(e.target.value)}
              >
                <option value="all">Svi jezici</option>
                {d.catalog.filters.languages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="flt-level">
                Razina
              </label>
              <select
                id="flt-level"
                className="rounded-lg border border-border/60 bg-surface-secondary px-2 py-1.5 text-xs"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="all">Sve razine</option>
                {d.catalog.filters.levels.map((lv) => (
                  <option key={lv} value={lv}>
                    {lv}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-8">
              {filteredCatalog.map((g) => (
                <div key={g.scopeId}>
                  <h3 className="mb-3 text-sm font-semibold text-text-secondary">{g.scopeName}</h3>
                  <div
                    className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory motion-reduce:scroll-auto"
                    tabIndex={0}
                    role="list"
                    aria-label={`Tečajevi za opseg ${g.scopeName}`}
                  >
                    {g.courses.map((c) => (
                      <article
                        key={c.id}
                        role="listitem"
                        className="w-[min(100%,280px)] shrink-0 snap-start overflow-hidden rounded-xl border border-border/50 bg-surface-secondary/30"
                      >
                        <img
                          src={c.coverImage?.trim() ? c.coverImage : PLACEHOLDER_IMG}
                          alt=""
                          className="h-36 w-full object-cover"
                        />
                        <div className="space-y-2 p-3">
                          <p className="text-sm font-semibold leading-snug text-text-primary">{c.title}</p>
                          <p className="text-xs text-text-muted">
                            {g.scopeName} ·{" "}
                            {c.durationMin != null ? `${String(c.durationMin)} min` : "Trajanje TBD"}
                          </p>
                          <p className="text-xs font-medium text-text-secondary">
                            {c.price.amount} {c.price.currency}
                          </p>
                          {guards.courseActionsDisabled ? (
                            <Button type="button" className="w-full" disabled aria-disabled="true">
                              Detalji (nedostupno)
                            </Button>
                          ) : (
                            <Button type="button" className="w-full" asChild>
                              <Link to={`/learn/${encodeURIComponent(c.id)}`}>Detalji</Link>
                            </Button>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
              {filteredCatalog.length === 0 ? (
                <p className="text-sm text-text-secondary">Nema tečajeva za odabrane filtere.</p>
              ) : null}
            </div>
          </>
        )}
      </section>

      <section aria-labelledby="module1-progress-heading" className="space-y-4">
        <h2 id="module1-progress-heading" className="text-lg font-semibold tracking-tight">
          Napredak i ispiti
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-border/50 bg-surface-secondary/35 p-4 lg:col-span-1">
            <h3 className="text-sm font-semibold text-text-primary">U tijeku</h3>
            <ul className="mt-3 space-y-4">
              {d.progress.inProgressCourses.length === 0 ? (
                <li className="text-xs text-text-muted">Nema aktivnih upisa.</li>
              ) : null}
              {d.progress.inProgressCourses.map((row) => (
                <li key={row.enrollmentId}>
                  <div className="flex justify-between gap-2 text-xs text-text-secondary">
                    <span className="font-medium text-text-primary">{row.title}</span>
                    <span className="tabular-nums">{Math.round(row.progressPct)}%</span>
                  </div>
                  <div
                    className="mt-2 h-2 rounded-full bg-surface-tertiary"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(row.progressPct)}
                    aria-label={`Napredak za ${row.title}`}
                  >
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-brand/80 to-sky-500/70"
                      style={{ width: `${Math.min(100, Math.max(0, row.progressPct))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border/50 bg-surface-secondary/35 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Clock3 className="h-4 w-4 text-text-muted" aria-hidden />
              Sljedeći ispit
            </h3>
            {d.progress.nextExam && d.progress.nextExam.scheduledFor ? (
              <div className="mt-3 space-y-2 text-xs text-text-secondary">
                <p className="font-medium text-text-primary">{d.progress.nextExam.courseTitle}</p>
                <p>{new Date(d.progress.nextExam.scheduledFor).toLocaleString()}</p>
                <p className="tabular-nums text-sm font-semibold text-brand" aria-live="polite">
                  {examCountdown ? `Preostalo: ${examCountdown}` : "—"}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-text-muted">Nema zakazanih ispita.</p>
            )}
          </div>
          <div className="rounded-xl border border-border/50 bg-surface-secondary/35 p-4">
            <h3 className="text-sm font-semibold text-text-primary">Certifikati (istek ≤ 90 dana)</h3>
            <ul className="mt-3 space-y-2 text-xs text-text-secondary">
              {d.progress.certificatesExpiringSoon.length === 0 ? (
                <li className="text-text-muted">Nema certifikata u prozoru isteka.</li>
              ) : null}
              {d.progress.certificatesExpiringSoon.map((c) => (
                <li key={c.id}>
                  <span className="font-medium text-text-primary">{c.scopeText}</span>
                  {c.expiryDate ? <span className="ml-2 text-text-muted">do {c.expiryDate}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="module1-notify-heading" className="space-y-3">
        <h2 id="module1-notify-heading" className="text-lg font-semibold tracking-tight">
          Obavijesti
        </h2>
        <ul className="space-y-2">
          {d.notifications.length === 0 ? (
            <li className="text-sm text-text-muted">Nema nedavnih obavijesti.</li>
          ) : null}
          {d.notifications.map((n) => (
            <li key={n.id} className="rounded-lg border border-border/40 bg-surface-secondary/25 px-3 py-2">
              <p className="text-sm font-medium text-text-primary">{n.title}</p>
              <p className="mt-1 text-xs text-text-secondary">{n.body}</p>
              <p className="mt-1 text-[11px] text-text-muted">{new Date(n.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </section>

      <DashboardSupportChat />
    </div>
  );
}
