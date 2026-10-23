import { useQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { Link } from "react-router";

import { api } from "@/lib/api";

type PublicProgram = {
  readonly courseId: string;
  readonly title: string;
  readonly description: string;
  readonly areaCode: string;
  readonly educationalLevel: string | null;
};

type CatalogResponse = { readonly courses?: readonly PublicProgram[] };

function isProgram(value: unknown): value is PublicProgram {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.courseId === "string" && typeof row.title === "string" && typeof row.areaCode === "string";
}

async function fetchCatalog(): Promise<readonly PublicProgram[]> {
  const { data } = await api.get<CatalogResponse>("/v1/public/catalog/courses");
  return (data.courses ?? []).filter(isProgram);
}

/** Read-only public catalogue. Enrolment stays on the signed-in learning API. */
export default function CoursesCatalogPage(): JSX.Element {
  const catalogQ = useQuery({ queryKey: ["catalog", "courses"], queryFn: fetchCatalog });
  const courses = catalogQ.data ?? [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10" data-testid="public-catalog-page" aria-labelledby="catalog-heading">
      <h1 id="catalog-heading" className="text-2xl font-bold text-text-primary">Javni katalog edukacijskih programa</h1>
      <p className="mt-2 text-sm text-text-secondary">Objavljeni programi, bez ličnih podataka. Pregled nije upis i nije certifikacijska odluka.</p>
      {catalogQ.isPending ? <p className="mt-6 text-sm text-text-secondary" data-testid="catalog-loading-state" role="status">Učitavanje kataloga…</p> : null}
      {catalogQ.isError ? <p className="mt-6 text-sm text-text-secondary" role="alert">Katalog trenutno nije dostupan.</p> : null}
      {!catalogQ.isPending && !catalogQ.isError && courses.length === 0 ? <p className="mt-6 text-sm text-text-secondary" data-testid="catalog-empty-state">Trenutno nema objavljenih edukacijskih programa.</p> : null}
      {courses.length > 0 ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2" data-testid="catalog-course-list">
          {courses.map((course) => (
            <li key={course.courseId} className="rounded-xl border border-border/50 p-4">
              <p className="text-xs text-text-muted" data-testid={`catalog-sector-${course.courseId}`}>{course.areaCode}</p>
              <h2 className="mt-1 text-lg font-semibold text-text-primary">{course.title}</h2>
              {course.educationalLevel ? <p className="mt-1 text-sm text-text-secondary">Nivo: {course.educationalLevel}</p> : null}
              {course.description ? <p className="mt-2 text-sm text-text-secondary">{course.description}</p> : null}
              <Link className="mt-3 inline-block text-sm text-brand underline" to={`/courses/${encodeURIComponent(course.courseId)}`}>Pogledajte edukaciju</Link>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
