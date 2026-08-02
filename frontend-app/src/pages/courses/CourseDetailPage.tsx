import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, type JSX } from "react";
import { Link, useParams } from "react-router";

import { AiDisclosure } from "@/components/ai/AiDisclosure";
import { CertificationCatalogDisclaimer } from "@/components/catalog/CertificationCatalogDisclaimer";
import { EducationCertificationBoundary } from "@/components/public/EducationCertificationBoundary";
import {
  PublicLoadingState,
  PublicNotFoundState,
  PublicBackToCatalogAction,
} from "@/components/public/PublicPageStates";
import { PublicTrustMessaging } from "@/components/public/PublicTrustMessaging";
import { Button } from "@/components/ui/button";
import {
  fetchEducationEnrolments,
  postEducationEnrolment,
} from "@/lib/learner-education-api";
import {
  fetchCatalogCourseDetail,
  fetchMyEnrollments,
} from "@/lib/lms-learner-api";
import { useAuthStore } from "@/stores/authStore";

export default function CourseDetailPage(): JSX.Element {
  const { courseId = "" } = useParams<{ courseId: string }>();
  const token = useAuthStore((s) => s.accessToken);

  const detailQ = useQuery({
    queryKey: ["catalog", "course", courseId],
    queryFn: () => fetchCatalogCourseDetail(courseId),
    enabled: Boolean(courseId),
  });

  const enQ = useQuery({
    queryKey: ["me", "enrollments"],
    queryFn: () => fetchMyEnrollments(),
    enabled: Boolean(token),
  });

  const eduEnQ = useQuery({
    queryKey: ["learner", "education", "enrolments"],
    queryFn: () => fetchEducationEnrolments(),
    enabled: Boolean(token),
  });

  const educationEnrolment = useMemo(
    () => eduEnQ.data?.find((e) => e.courseId === courseId) ?? null,
    [eduEnQ.data, courseId],
  );

  const enrollment = useMemo(
    () => enQ.data?.find((e) => e.courseId === courseId) ?? null,
    [enQ.data, courseId],
  );

  const enrol = useMutation({
    mutationFn: () => postEducationEnrolment(courseId),
    onSuccess: async () => {
      await eduEnQ.refetch();
    },
  });

  if (!courseId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <PublicNotFoundState
          title="Program nije naveden"
          description="Nedostaje identifikator programa u adresi."
          testId="course-detail-missing-id"
          action={<PublicBackToCatalogAction />}
        />
      </div>
    );
  }

  if (detailQ.isPending) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <PublicLoadingState
          title="Učitavanje programa"
          description="Dohvaćamo javne podatke o edukacijskom programu."
          testId="course-detail-loading"
        />
      </div>
    );
  }

  if (detailQ.isError || !detailQ.data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <PublicNotFoundState
          title="Program nije pronađen"
          description="Traženi program nije dostupan u javnom katalogu ili je uklonjen."
          testId="course-detail-not-found"
          action={<PublicBackToCatalogAction />}
        />
      </div>
    );
  }

  const d = detailQ.data;
  const firstCh = d.syllabus[0];
  const firstLesson = firstCh?.lessons[0];

  return (
    <article
      className="mx-auto max-w-4xl space-y-8 overflow-x-hidden px-4 py-10 text-text-primary"
      data-testid="course-detail-page"
    >
      <nav aria-label="Breadcrumb">
        <Link to="/courses" className="text-xs font-medium text-brand hover:underline">
          ← Natrag na katalog
        </Link>
      </nav>

      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">Edukacijski program</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" data-testid="course-detail-title">
          {d.title}
        </h1>
        <p className="text-sm text-text-secondary">
          {d.scope.name}
          {d.targetAudience ? ` · ${d.targetAudience}` : ""}
        </p>
      </header>

      <CertificationCatalogDisclaimer compact />
      <EducationCertificationBoundary />

      {d.previewUrl ? (
        <section aria-label="Video najave">
          <a
            href={d.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-brand underline-offset-4 hover:underline"
          >
            Pogledaj najavu programa (video)
          </a>
        </section>
      ) : null}

      <section aria-labelledby="obj-heading">
        <h2 id="obj-heading" className="text-lg font-semibold">
          Cilj programa
        </h2>
        <p
          className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary"
          data-testid="course-detail-objective"
        >
          {d.objective ?? d.description ?? "—"}
        </p>
      </section>

      {(d.learningOutcomes?.length ?? 0) > 0 ? (
        <section aria-labelledby="lo-heading" data-testid="course-detail-learning-outcomes">
          <h2 id="lo-heading" className="text-lg font-semibold">
            Ishodi učenja
          </h2>
          <ul className="mt-3 space-y-2">
            {d.learningOutcomes!.map((lo) => (
              <li key={lo.code} className="rounded-lg border border-border/40 px-3 py-2 text-sm">
                <span className="font-mono text-xs text-text-muted">{lo.code}</span> — {lo.name}
                {lo.description ? (
                  <p className="mt-1 text-xs text-text-secondary">{lo.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {(d.programmeModules?.length ?? 0) > 0 ? (
        <section aria-labelledby="mod-heading" data-testid="course-detail-programme-modules">
          <h2 id="mod-heading" className="text-lg font-semibold">
            Moduli programa
          </h2>
          <ul className="mt-3 space-y-2">
            {d.programmeModules!.map((m) => (
              <li key={m.id} className="rounded-lg border border-border/40 px-3 py-2 text-sm">
                <p className="font-medium">
                  {m.order}. {m.title}
                  {m.durationMin ? (
                    <span className="ml-2 text-xs text-text-muted">({m.durationMin} min)</span>
                  ) : null}
                </p>
                {m.description ? <p className="mt-1 text-xs text-text-secondary">{m.description}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {d.trainer ? (
        <section aria-labelledby="trainer-heading" data-testid="course-detail-trainer">
          <h2 id="trainer-heading" className="text-sm font-semibold text-text-primary">
            Voditelj / trener (javni prikaz)
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {d.trainer.name}
            {d.trainer.role ? ` · ${d.trainer.role}` : ""}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Prikazani su samo javno sigurni podaci — bez internih bilješki ili osobnih dokumenata.
          </p>
        </section>
      ) : null}

      <section aria-labelledby="syl-heading">
        <h2 id="syl-heading" className="text-lg font-semibold">
          Pregled sadržaja
        </h2>
        <p className="mt-1 text-xs text-text-muted">
          Naslovi modula i lekcija. Puni sadržaj dostupan nakon prijave i upisa na program.
        </p>
        <ul className="mt-3 space-y-4">
          {d.syllabus.map((ch) => (
            <li key={ch.id} className="rounded-lg border border-border/40 px-3 py-2">
              <p className="text-sm font-medium">{ch.title}</p>
              <ul className="mt-2 list-inside list-disc text-xs text-text-muted">
                {ch.lessons.map((l) => (
                  <li key={l.id}>{l.title}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <aside className="rounded-xl border border-border/50 bg-surface-secondary/30 p-4 text-xs text-text-secondary">
        <AiDisclosure />
      </aside>

      <section aria-labelledby="cta-heading" className="rounded-xl border border-border/50 bg-surface-secondary/20 p-4">
        <h2 id="cta-heading" className="text-sm font-semibold text-text-primary">
          Sljedeći koraci
        </h2>
        <p className="mt-1 text-xs text-text-muted" data-testid="course-detail-cta-disclaimer">
          Upis na edukaciju ne pokreće automatski certifikaciju osobe prema ISO/IEC 17024.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {token ? (
            <>
              {educationEnrolment ? (
                <Button type="button" variant="outline" asChild data-testid="course-detail-view-enrolment">
                  <Link to="/dashboard/learner/education">
                    Nastavi edukaciju ({educationEnrolment.progressStatus})
                  </Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  data-testid="course-detail-enrol"
                  disabled={enrol.isPending}
                  onClick={() => enrol.mutate()}
                >
                  Upiši se na program
                </Button>
              )}
              {enrollment && firstCh && firstLesson ? (
                <Button type="button" variant="secondary" asChild>
                  <Link
                    to={`/learn/${encodeURIComponent(enrollment.id)}/${encodeURIComponent(firstCh.id)}/${encodeURIComponent(firstLesson.id)}`}
                  >
                    Otvori sadržaj
                  </Link>
                </Button>
              ) : null}
            </>
          ) : (
            <>
              <Button type="button" asChild data-testid="course-detail-sign-in">
                <Link to="/login">Prijava za upis</Link>
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/register">Registracija</Link>
              </Button>
            </>
          )}
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link to="/verify">Provjeri certifikat</Link>
          </Button>
        </div>
      </section>

      <PublicTrustMessaging variant="compact" />
    </article>
  );
}
