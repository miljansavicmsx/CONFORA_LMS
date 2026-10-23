import { useQuery } from "@tanstack/react-query";
import type { JSX } from "react";

import { api } from "@/lib/api";

type ApplicationList = {
  readonly items?: readonly { readonly id?: string; readonly status?: string; readonly schemeRef?: string }[];
};

export default function CertificationApplicationsPage(): JSX.Element {
  const applications = useQuery({
    queryKey: ["learner", "applications"],
    queryFn: async () => {
      const { data } = await api.get<ApplicationList>("/v1/me/certification/applications");
      return data.items ?? [];
    },
  });
  return (
    <main className="mx-auto max-w-3xl px-4 py-10" data-testid="learner-cert-applications-page">
      <h1 className="text-2xl font-bold text-text-primary">Prijave za certifikaciju</h1>
      <p className="mt-3 rounded-lg border border-amber-300/50 p-3 text-sm text-text-secondary" data-testid="learner-cert-eligibility-boundary">
        Status prijave i podobnost određuje nadležni server-side postupak. Nedostupni podaci nisu potvrda podobnosti niti odluka o certifikaciji.
      </p>
      <section className="mt-6" data-testid="learner-cert-section-available">
        {(applications.data ?? []).length === 0 ? (
          <p className="text-sm text-text-secondary">Nema prijava za prikaz.</p>
        ) : (
          <ul>
            {(applications.data ?? []).map((item) => (
              <li key={item.id} data-testid="learner-application">
                {item.schemeRef} — {item.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
