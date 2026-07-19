import type { BreadcrumbItem } from "@/layouts/DashboardLayout";

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Početna",
  iso: "ISO/IEC 17024",
  schemes: "Sheme certifikacije",
  candidate: "Kandidat",
  decisions: "Odluke o certifikaciji",
  certificates: "Registar certifikata",
  appeals: "Žalbe",
  complaints: "Prigovori",
  "appeals-complaints": "Žalbe i prigovori",
  reports: "Objedinjeni izvještaji",
  katalog: "Katalog kurseva",
  "ai-tutor": "AI Tutor",
  certifikat: "Certifikat",
  exams: "Ispiti",
  "my-certificates": "Moji certifikati",
  support: "Podrška i kontakt",
  courses: "Moji kursevi",
  certification: "Certifikacija",
  entry: "Ulaz",
  applications: "Prijave",
  status: "Status",
  finance: "Financije",
  statistics: "Statistika",
  postavke: "Postavke",
  profil: "Profil",
  admin: "Administracija",
  "kreiraj-kurs": "Nova obuka",
  sadrzaj: "Uređivač sadržaja",
  knowledge: "Standards Intelligence",
  "audit-logs": "Audit logovi",
  roleplay: "AI Roleplay",
  learner: "Polaznik",
  education: "Moje edukacije",
  me: "Moj profil",
  accommodations: "Prilagođavanja",
  "identity-review": "Ručna provjera identiteta",
  governance: "Upravljanje",
  capa: "CAPA",
  risks: "Registar rizika",
  impartiality: "Nepristranost",
  compliance: "Compliance",
  "system-health": "Status sustava",
  users: "Korisnici",
  tenants: "Organizacije",
};

export function breadcrumbsFromPathname(
  pathname: string,
  workspaceLabel?: string | null,
): readonly BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0 || segments[0] !== "dashboard") {
    const chip = workspaceLabel?.trim();
    return chip ? [{ label: chip }, { label: "Home", href: "/dashboard" }] : [{ label: "Home", href: "/dashboard" }];
  }
  const items: BreadcrumbItem[] = [];
  if (workspaceLabel?.trim()) {
    items.push({ label: workspaceLabel.trim() });
  }
  items.push({ label: "Početna", href: "/dashboard" });
  let acc = "/dashboard";
  const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    if (!seg) {
      continue;
    }
    acc += `/${seg}`;
    const prev = segments[i - 1];
    const label =
      prev === "roleplay" && uuidLike.test(seg)
        ? "Aktivna simulacija"
        : prev === "admin" && seg === "support"
          ? "Registar žalbi"
          : prev === "admin" && seg === "certification"
            ? "Certifikacija — odluke"
            : prev === "admin" && seg === "reports"
              ? "Objedinjeni izvještaji"
              : prev === "admin" && seg === "education"
                ? "Upravljanje edukacijama"
                : prev === "admin" && seg === "identity-review"
                ? "Ručna provjera identiteta"
                : prev === "learner" && seg === "education"
                  ? "Moje edukacije"
                  : prev === "iso" && seg === "applications"
                    ? "Prijave"
                    : prev === "iso" && seg === "decisions"
                      ? "Odluke o certifikaciji"
                      : prev === "iso" && seg === "certificates"
                        ? "Registar certifikata"
                        : prev === "me" && seg === "accommodations"
                          ? "Prilagođavanja"
                          : (SEGMENT_LABELS[seg] ?? seg);
    const isLast = i === segments.length - 1;
    items.push(isLast ? { label } : { label, href: acc });
  }
  if (segments.length === 1) {
    items.push({ label: "Pregled" });
  }
  return items;
}
