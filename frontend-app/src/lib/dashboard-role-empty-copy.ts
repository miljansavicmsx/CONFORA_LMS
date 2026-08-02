import type { DashboardPersona } from "@/lib/dashboard-context-api";

/** Poruke kad nema KPI payloada ili su svi KPI=0 idle — specifične po ulozi kada je poznato. */
export type RoleIdleMessaging = {
  readonly title: string;
  readonly description: string;
};

export function messagingForDashboardIdle(
  persona: DashboardPersona,
  normalizedRoleSlug: string,
): RoleIdleMessaging | undefined {
  const r = normalizedRoleSlug.trim().toLowerCase();

  switch (persona) {
    case "candidate":
      return {
        title: "Niste upisani ni na jedan kurs.",
        description:
          "Pregledajte katalog edukacije, odaberite shemu i počnite modul koji vaše tijelo dopušta. Bez upisa LMS neće prikazati napredak pojedinačnog programa.",
      };
    case "certification_committee":
      return {
        title: "Trenutno nema prijava dodijeljenih vašem odboru.",
        description:
          "Predmeti se pojavljuju tek kada sustav ima formalne korake ili zadatke u vašem redu. Za pitanja o SLA-u koristite modul izvještaja ili podršku.",
      };
    case "iso_governance":
      if (r === "quality_manager") {
        return {
          title: "Nema otvorenih CAPA/rizika za vaš tenant.",
          description:
            "Brzi brojači su prazni — dubinski zapisi i dalje mogu postojati u ISO modulima. Koristite strukturirane stranice za CAPA, rizike i management review.",
        };
      }
      if (r === "internal_auditor" || r === "auditor") {
        return {
          title: "Nema novih audit događaja u odabranom periodu.",
          description:
            "Detaljni trag i kontrolne liste nalaze se u strukturiranom ISO modulu. Ovdje vidite samo agregabilni rezime za brzo skeniranje cockpit-a.",
        };
      }
      return undefined;
    case "sys_admin":
      return {
        title: "Nema aktivnih incidenta.",
        description:
          "Presjek KPI-a iznad ostaje tehnički: ako trag ili alarm nedostaju na cockpit-u, servisi i dalje pokreću poslove u pozadini — koristite system health i audit za složenije signale.",
      };
    default:
      return undefined;
  }
}
