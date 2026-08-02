import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type JSX } from "react";
import { Link } from "react-router";

import { CertificationCatalogDisclaimer } from "@/components/catalog/CertificationCatalogDisclaimer";
import { PublicCourseCard } from "@/components/public/PublicCourseCard";
import {
  PublicEmptyState,
  PublicErrorState,
  PublicLoadingState,
} from "@/components/public/PublicPageStates";
import { PublicTrustMessaging } from "@/components/public/PublicTrustMessaging";
import { Button } from "@/components/ui/button";
import { groupCatalogCoursesBySector } from "@/lib/learner-polish-labels";
import { fetchCatalogCourses } from "@/lib/lms-learner-api";

export default function CoursesCatalogPage(): JSX.Element {
  const [scopeId, setScopeId] = useState("");
  const [language, setLanguage] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [level, setLevel] = useState("");

  const q = useQuery({
    queryKey: ["catalog", "courses", scopeId, language, maxPrice, level],
    queryFn: () => {
      const params: {
        scopeId?: string;
        language?: string;
        maxPrice?: number;
        level?: string;
      } = {};
      const s = scopeId.trim();
      if (s) params.scopeId = s;
      const lang = language.trim();
      if (lang) params.language = lang;
      const mp = maxPrice.trim();
      if (mp) {
        const n = Number(mp);
        if (!Number.isNaN(n)) params.maxPrice = n;
      }
      const lv = level.trim();
      if (lv) params.level = lv;
      return fetchCatalogCourses(params);
    },
  });

  const courses = q.data ?? [];
  const sectorGroups = useMemo(() => groupCatalogCoursesBySector(courses), [courses]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 overflow-x-hidden px-4 py-10 text-text-primary" data-testid="public-catalog-page">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">CONFORA</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" data-testid="catalog-heading">
              Javni katalog edukacijskih programa
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
              Pregledajte dostupne programe, ishode učenja i module. Upis i certifikacija su odvojeni
              postupci — detalji su na stranici programa.
            </p>
          </div>
          <span
            className="rounded-full border border-border/60 bg-surface-secondary/40 px-3 py-1 text-[11px] font-medium text-text-muted"
            data-testid="catalog-synthetic-badge"
          >
            Lokalni pilot · sintetički podaci
          </span>
        </div>
      </header>

      <CertificationCatalogDisclaimer />

      <section
        aria-labelledby="cat-filters"
        className="flex flex-wrap gap-3 rounded-xl border border-border/50 bg-surface-secondary/30 p-4"
      >
        <h2 id="cat-filters" className="sr-only">
          Filteri kataloga
        </h2>
        <label className="flex flex-col text-xs text-text-muted">
          Opseg (scope)
          <input
            className="mt-1 rounded border border-border/60 bg-surface-primary px-2 py-1 text-sm text-text-primary"
            value={scopeId}
            onChange={(e) => setScopeId(e.target.value)}
            placeholder="UUID opsega (opcionalno)"
          />
        </label>
        <label className="flex flex-col text-xs text-text-muted">
          Jezik
          <input
            className="mt-1 rounded border border-border/60 bg-surface-primary px-2 py-1 text-sm text-text-primary"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="npr. hr"
          />
        </label>
        <label className="flex flex-col text-xs text-text-muted">
          Max cijena
          <input
            className="mt-1 rounded border border-border/60 bg-surface-primary px-2 py-1 text-sm text-text-primary"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            type="number"
            min={0}
          />
        </label>
        <label className="flex flex-col text-xs text-text-muted">
          Razina
          <input
            className="mt-1 rounded border border-border/60 bg-surface-primary px-2 py-1 text-sm text-text-primary"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          />
        </label>
        <Button type="button" variant="secondary" className="self-end" onClick={() => void q.refetch()}>
          Primijeni filtere
        </Button>
      </section>

      {q.isPending ? (
        <PublicLoadingState
          title="Učitavanje kataloga"
          description="Dohvaćamo objavljene programe iz lokalnog pilota."
          testId="catalog-loading-state"
        />
      ) : null}

      {q.isError ? (
        <PublicErrorState
          title="Katalog trenutno nije dostupan"
          description="Provjerite je li Nest API pokrenut i dostupan na istom originu kao /v1."
          testId="catalog-error-state"
          action={
            <Button type="button" variant="secondary" size="sm" onClick={() => void q.refetch()}>
              Pokušaj ponovo
            </Button>
          }
        />
      ) : null}

      {!q.isPending && !q.isError && courses.length === 0 ? (
        <PublicEmptyState
          title="Nema objavljenih programa"
          description="Trenutno nema programa u javnom katalogu. Pokušajte kasnije ili kontaktirajte podršku."
          testId="catalog-empty-state"
          action={
            <Button type="button" variant="secondary" size="sm" asChild>
              <Link to="/contact">Kontakt / podrška</Link>
            </Button>
          }
        />
      ) : null}

      {!q.isPending && !q.isError && courses.length > 0 ? (
        <div className="space-y-10" data-testid="catalog-course-list">
          {sectorGroups.map(({ sector, courses: sectorCourses }) => (
            <section key={sector} aria-labelledby={`sector-${sector}`} data-testid={`catalog-sector-${sector}`}>
              <h2 id={`sector-${sector}`} className="mb-4 text-lg font-semibold text-text-primary">
                {sector}
              </h2>
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">
                {sectorCourses.map((c) => (
                  <li key={c.id}>
                    <PublicCourseCard course={c} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : null}

      <PublicTrustMessaging variant="catalogue" />

      <p className="text-center text-xs text-text-muted">
        Imate certifikat za provjeru?{" "}
        <Link to="/verify" className="font-medium text-brand underline-offset-2 hover:underline">
          Javna verifikacija
        </Link>
        {" · "}
        <Link to="/contact" className="font-medium text-brand underline-offset-2 hover:underline">
          Kontakt
        </Link>
      </p>
    </div>
  );
}
