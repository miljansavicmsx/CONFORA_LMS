import { useQuery } from "@tanstack/react-query";
import { type JSX } from "react";

import { api } from "@/lib/api";
import { fetchEducationDocuments, fetchExamPassDocuments, type EducationDocumentRow, type ExamPassRow } from "@/lib/case-public";
import { useAuthStore } from "@/stores/authStore";

type CourseCatalogue = {
  readonly courses?: readonly { readonly id?: string; readonly title?: string }[];
};

type ApplicationList = {
  readonly items?: readonly { readonly id?: string; readonly status?: string; readonly schemeRef?: string }[];
};

export default function SessionProfilePage(): JSX.Element {
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const courses = useQuery({
    queryKey: ["session", "courses"],
    queryFn: async () => {
      const { data } = await api.get<CourseCatalogue>("/v1/me/learning/courses");
      return data.courses ?? [];
    },
  });
  const applications = useQuery({
    queryKey: ["session", "applications"],
    queryFn: async () => {
      const { data } = await api.get<ApplicationList>("/v1/me/certification/applications");
      return data.items ?? [];
    },
  });
  const education = useQuery({ queryKey: ["session", "education"], queryFn: fetchEducationDocuments });
  const examPasses = useQuery({ queryKey: ["session", "exam-passes"], queryFn: fetchExamPassDocuments });

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10" data-testid="session-profile">
      <header>
        <h1 className="text-2xl font-semibold text-text-primary">Profil</h1>
        <p data-testid="session-display-name">{user?.name ?? ""}</p>
        <p data-testid="session-email">{user?.email ?? ""}</p>
        <p data-testid="session-roles">{roles.join(", ")}</p>
      </header>
      <section data-testid="session-courses">
        <h2 className="text-lg font-semibold">Kursevi</h2>
        <ul>
          {(courses.data ?? []).map((course) => (
            <li key={course.id}>{course.title}</li>
          ))}
        </ul>
      </section>
      <section data-testid="session-applications">
        <h2 className="text-lg font-semibold">Prijave</h2>
        <ul>
          {(applications.data ?? []).map((item) => (
            <li key={item.id}>
              {item.schemeRef} — {item.status}
            </li>
          ))}
        </ul>
      </section>
      <section data-testid="session-edu">
        <h2 className="text-lg font-semibold">EDU</h2>
        <DocumentList rows={education.data} label={(row: EducationDocumentRow) => `${row.number} ${row.courseTitle}`} />
      </section>
      <section data-testid="session-exm">
        <h2 className="text-lg font-semibold">EXM</h2>
        <DocumentList rows={examPasses.data} label={(row: ExamPassRow) => `${row.number} ${row.examTitle}`} />
      </section>
    </main>
  );
}

function DocumentList<T extends { readonly number: string }>({
  rows,
  label,
}: {
  readonly rows: readonly T[] | undefined;
  readonly label: (row: T) => string;
}): JSX.Element {
  return (
    <ul>
      {(rows ?? []).map((row) => (
        <li key={row.number}>{label(row)}</li>
      ))}
    </ul>
  );
}
