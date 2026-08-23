import { useQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { Link, useParams } from "react-router";

import { api } from "@/lib/api";

type CourseDetail = { readonly courseId: string; readonly title: string; readonly domain?: string | null; readonly level?: string | null; readonly description?: string | null };

function isCourseDetail(value: unknown): value is CourseDetail {
  return Boolean(value) && typeof value === "object" && typeof (value as Record<string, unknown>).courseId === "string" && typeof (value as Record<string, unknown>).title === "string";
}

async function fetchCourse(courseId: string): Promise<CourseDetail | null> {
  const { data } = await api.get<unknown>("/api/courses");
  return (Array.isArray(data) ? data : []).find((value): value is CourseDetail => isCourseDetail(value) && value.courseId === courseId) ?? null;
}

/** Read-only course presentation. It contains no enrolment, publication, or certification authority. */
export default function CourseDetailPage(): JSX.Element {
  const { courseId } = useParams();
  const courseQ = useQuery({ queryKey: ["catalog", "course", courseId], queryFn: () => courseId ? fetchCourse(courseId) : Promise.resolve(null), enabled: Boolean(courseId) });
  const course = courseQ.data;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10" aria-labelledby="course-detail-heading">
      {courseQ.isPending ? <p className="text-sm text-text-secondary" role="status">Učitavanje edukacije…</p> : null}
      {courseQ.isError ? <p className="text-sm text-text-secondary" role="alert">Edukacija trenutno nije dostupna.</p> : null}
      {!courseQ.isPending && !courseQ.isError && !course ? <p className="text-sm text-text-secondary">Edukacija nije pronađena.</p> : null}
      {course ? (
        <section data-testid="course-detail-page">
          <p className="text-sm text-text-muted">{course.domain ?? "Edukacija"}{course.level ? ` · ${course.level}` : ""}</p>
          <h1 id="course-detail-heading" className="mt-1 text-2xl font-bold text-text-primary">{course.title}</h1>
          {course.description ? <p className="mt-4 text-text-secondary">{course.description}</p> : null}
          <p className="mt-6 rounded-lg border border-amber-300/50 bg-amber-50/60 p-3 text-sm text-text-secondary" data-testid="education-certification-boundary">Ova edukacija nije certifikat i prikaz ne predstavlja odluku o certifikacijskoj podobnosti.</p>
        </section>
      ) : null}
      <p className="mt-6"><Link className="text-sm text-brand underline" to="/courses">Nazad na katalog</Link></p>
    </main>
  );
}
