import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { JSX } from "react";
import { Link, useParams } from "react-router";

import { api } from "@/lib/api";

type CourseDetail = {
  readonly courseId: string;
  readonly title: string;
  readonly description: string;
  readonly areaCode: string;
  readonly educationalLevel: string | null;
  readonly learningObjectives: string | null;
  readonly typicalLearningTimeMinutes: number | null;
};

function isCourseDetail(value: unknown): value is CourseDetail {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.courseId === "string" && typeof row.title === "string";
}

async function fetchCourse(courseId: string): Promise<CourseDetail | null> {
  try {
    const { data } = await api.get<unknown>(`/v1/public/catalog/courses/${encodeURIComponent(courseId)}`);
    return isCourseDetail(data) ? data : null;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}

/** Read-only programme page. It does not enrol the reader and it is not a certification decision. */
export default function CourseDetailPage(): JSX.Element {
  const { courseId } = useParams();
  const courseQ = useQuery({
    queryKey: ["catalog", "course", courseId],
    queryFn: () => (courseId ? fetchCourse(courseId) : Promise.resolve(null)),
    enabled: Boolean(courseId),
  });
  const course = courseQ.data;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10" aria-labelledby="course-detail-heading">
      {courseQ.isPending ? <p className="text-sm text-text-secondary" role="status">Učitavanje edukacije…</p> : null}
      {courseQ.isError ? <p className="text-sm text-text-secondary" role="alert">Edukacija trenutno nije dostupna.</p> : null}
      {!courseQ.isPending && !courseQ.isError && !course ? <p className="text-sm text-text-secondary">Edukacija nije pronađena.</p> : null}
      {course ? (
        <section data-testid="course-detail-page">
          <p className="text-sm text-text-muted">{course.areaCode}{course.educationalLevel ? ` · ${course.educationalLevel}` : ""}</p>
          <h1 id="course-detail-heading" className="mt-1 text-2xl font-bold text-text-primary">{course.title}</h1>
          {course.description ? <p className="mt-4 text-text-secondary">{course.description}</p> : null}
          {course.learningObjectives ? <p className="mt-3 text-sm text-text-secondary">Ishodi: {course.learningObjectives}</p> : null}
          {course.typicalLearningTimeMinutes ? <p className="mt-2 text-sm text-text-secondary">Uobičajeno trajanje: {course.typicalLearningTimeMinutes} min</p> : null}
          <p className="mt-6 rounded-lg border border-amber-300/50 bg-amber-50/60 p-3 text-sm text-text-secondary" data-testid="education-certification-boundary">Ova edukacija nije certifikat i prikaz ne predstavlja odluku o certifikacijskoj podobnosti.</p>
          <p className="mt-3 text-sm">
            <Link className="text-brand underline" to="/login">Prijavite se da biste se upisali</Link>
          </p>
        </section>
      ) : (
        <h1 id="course-detail-heading" className="sr-only">Edukacija</h1>
      )}
      <p className="mt-6"><Link className="text-sm text-brand underline" to="/courses">Nazad na katalog</Link></p>
    </main>
  );
}
