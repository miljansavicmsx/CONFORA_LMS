import { useQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { Link } from "react-router";

import { api } from "@/lib/api";

type CatalogCourse = { readonly courseId: string; readonly title: string; readonly slug?: string | null; readonly domain?: string | null; readonly level?: string | null; readonly description?: string | null };

function isCatalogCourse(value: unknown): value is CatalogCourse {
  return Boolean(value) && typeof value === "object" && typeof (value as Record<string, unknown>).courseId === "string" && typeof (value as Record<string, unknown>).title === "string";
}

async function fetchCatalog(): Promise<readonly CatalogCourse[]> {
  const { data } = await api.get<unknown>("/api/courses");
  return (Array.isArray(data) ? data : []).filter(isCatalogCourse);
}

/** Read-only view of the established public course catalog. */
export default function CoursesCatalogPage(): JSX.Element {
  const catalogQ = useQuery({ queryKey: ["catalog", "courses"], queryFn: fetchCatalog });
  const courses = catalogQ.data ?? [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10" data-testid="public-catalog-page" aria-labelledby="catalog-heading">
      <h1 id="catalog-heading" className="text-2xl font-bold text-text-primary">Javni katalog edukacijskih programa</h1>
      <p className="mt-2 text-sm text-text-secondary">Informacije o edukacijama služe za učenje; ne predstavljaju certifikacijsku odluku.</p>
      {catalogQ.isPending ? <p className="mt-6 text-sm text-text-secondary" data-testid="catalog-loading-state" role="status">Učitavanje kataloga…</p> : null}
      {catalogQ.isError ? <p className="mt-6 text-sm text-text-secondary" role="alert">Katalog trenutno nije dostupan.</p> : null}
      {!catalogQ.isPending && !catalogQ.isError && courses.length === 0 ? <p className="mt-6 text-sm text-text-secondary" data-testid="catalog-empty-state">Trenutno nema dostupnih edukacijskih programa.</p> : null}
      {courses.length > 0 ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2" data-testid="catalog-course-list">
          {courses.map((course) => (
            <li key={course.courseId} className="rounded-xl border border-border/50 p-4">
              {course.domain ? <p className="text-xs text-text-muted" data-testid={`catalog-sector-${course.courseId}`}>{course.domain}</p> : null}
              <h2 className="mt-1 text-lg font-semibold text-text-primary">{course.title}</h2>
              {course.level ? <p className="mt-1 text-sm text-text-secondary">Nivo: {course.level}</p> : null}
              {course.description ? <p className="mt-2 text-sm text-text-secondary">{course.description}</p> : null}
              <Link className="mt-3 inline-block text-sm text-brand underline" to={`/courses/${encodeURIComponent(course.courseId)}`}>Pogledajte edukaciju</Link>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
