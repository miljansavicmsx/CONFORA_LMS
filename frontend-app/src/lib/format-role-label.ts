import { DASHBOARD_NS } from "@confora/i18n";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

const ROLE_KEY_MAP: Record<string, string> = {
  learner: "candidate",
  candidate: "candidate",
  admin: "training_admin",
  content_admin: "training_admin",
  instructor: "training_admin",
  author: "training_admin",
  training_admin: "training_admin",
  tech_committee: "technical_committee",
  technical_committee: "technical_committee",
  cert_committee: "certification_committee",
  certification_committee: "certification_committee",
  appeals_committee: "appeals_committee",
  iso_governance: "iso_governance",
  director: "director",
  auditor: "iso_governance",
  sys_admin: "sys_admin",
  impartiality_committee: "certification_committee",
};

/** Čitljiva oznaka uloge za badge u UI (bez tehničkih detalja). */
export function formatRoleLabel(role: string | null | undefined): string {
  const r = String(role ?? "")
    .trim()
    .toLowerCase();
  const map: Record<string, string> = {
    learner: "Polaznik",
    candidate: "Kandidat",
    admin: "Administrator",
    content_admin: "Urednik sadržaja",
    instructor: "Instruktor",
    author: "Autor",
    training_admin: "Administrator obuke",
    tech_committee: "Tehnički odbor",
    technical_committee: "Tehnički odbor",
    cert_committee: "Certifikacijski odbor",
    certification_committee: "Certifikacijski odbor",
    appeals_committee: "Žalbena komisija",
    iso_governance: "ISO / nadzor",
    director: "Uprava",
    auditor: "Revizija / nadzor",
    sys_admin: "Sistem administrator",
    impartiality_committee: "Odbor nepristranosti",
  };
  return map[r] || (r ? r.replaceAll("_", " ") : "Korisnik");
}

export function useFormatRoleLabel(): (role: string | null | undefined) => string {
  const { t } = useTranslation(DASHBOARD_NS);
  return useCallback(
    (role: string | null | undefined) => {
      const r = String(role ?? "")
        .trim()
        .toLowerCase();
      const key = ROLE_KEY_MAP[r] ?? (r && r in ROLE_KEY_MAP ? r : null);
      if (key) {
        const translated = t(`roles.${key}`, { defaultValue: "" });
        if (translated) {
          return translated;
        }
      }
      if (r) {
        return r.replaceAll("_", " ");
      }
      return t("roles.user");
    },
    [t],
  );
}
