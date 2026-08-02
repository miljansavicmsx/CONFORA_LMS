import type { KnownIssue } from "./types";

/**
 * Curated list for release-readiness UI. Update with each RC; not a substitute for issue tracker.
 */
export const KNOWN_ISSUES_REGISTRY: readonly KnownIssue[] = [
  {
    id: "intel-non-realtime",
    title: "Operativna inteligencija je snapshot/heuristika",
    severity: "informational",
    summary:
      "Operations intelligence, readiness i governance paneli koriste postojeće API presjeke — nema realtime websocket sloja.",
    workaround: "Osvježite stranicu ili koristite ugrađene refresh kontrole gdje postoje.",
    affectedModules: ["Executive control tower", "Governance dashboard", "Knowledge workspace"],
    mitigation: "Dokumentovati očekivano kašnjenje u pilot briefingu.",
    pilotImpact: "Očekivano — tim treba znati da su brojke orijentacijske.",
    productionImpact: "Prihvatljivo uz jasne SLA-e na API latenciju.",
  },
  {
    id: "graph-autoload-cap",
    title: "Veliki knowledge grafovi zahtijevaju eksplicitno učitavanje",
    severity: "low",
    summary:
      "Vizualni graf iznad praga čvorova ne mounta automatski (performanse / TBT). Tekstualni fallback je uvijek dostupan.",
    affectedModules: ["Standards knowledge center"],
    workaround: "Koristite gumb „Učitaj vizualni graf” ili tekstualnu listu veza.",
    pilotImpact: "Može iznenaditi ako očekuju instant graf na velikim registryjima.",
    productionImpact: "Niska — smanjuje rizik od UI freeze.",
  },
  {
    id: "director-nav-aliases",
    title: "Neke direktorske stavke sidebara dijele istu rutu",
    severity: "informational",
    summary:
      "U 'Uprava' bloku više labela vodi na istu governance površinu — namjerna konsolidacija do dubijih ISO modula.",
    affectedModules: ["Sidebar (director)", "Governance dashboard"],
    workaround: "Koristite ISO hub kartice ili command center za direktan skok na CAPA/audit.",
    pilotImpact: "Korisnik može očekivati različite stranice po stavci.",
    productionImpact: "UX polish kandidat; ne blokira RC.",
  },
  {
    id: "cmdk-session-snapshot",
    title: "Continuity snapshot je samo u sesiji preglednika",
    severity: "informational",
    summary:
      "Investigation context u command centru čuva se u sessionStorage — ne sinkronizira se između uređaja.",
    affectedModules: ["Global command center", "Workspace continuity"],
    mitigation: "Ne pohranjujte osjetljive podatke u naslov/trag.",
    pilotImpact: "Niska — očekivano za internal pilot.",
    productionImpact: "Prihvatljivo za većinu enterprise SSO scenarija.",
  },
];
