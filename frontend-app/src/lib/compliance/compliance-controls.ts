import type { ComplianceControl, GovernanceDomain } from "./compliance-types";

export const COMPLIANCE_CONTROLS: readonly ComplianceControl[] = [
  {
    id: "ctl-coi",
    label: "COI provjera prije odluke",
    domain: "certification",
    description: "Odbor ne izdaje odluku dok COI nije potvrđen u modelu workflowa.",
  },
  {
    id: "ctl-quorum",
    label: "Kvorum i zapisnik",
    domain: "workflows",
    description: "Odluke prolaze kroz KVORUM_PENDING signal u dashboard kontekstu.",
  },
  {
    id: "ctl-mr",
    label: "Management review petlja",
    domain: "governance",
    description: "MR akcije i pregled rizika ne smiju ostati u trajnom prekoračenju.",
  },
  {
    id: "ctl-capa",
    label: "CAPA zatvaranje",
    domain: "quality_ms",
    description: "NCR → CAPA → effectiveness uz audit trag.",
  },
  {
    id: "ctl-complaint",
    label: "Pritužbe SLA",
    domain: "complaints",
    description: "Inventar pritužbi/žalbi ne smije eskalirati bez governance triagea.",
  },
  {
    id: "ctl-comp",
    label: "Kompetencija i valjanost",
    domain: "competence",
    description: "Profili pred istekom generiraju audit gap signal.",
  },
  {
    id: "ctl-isms",
    label: "Platform audit osjetljivost",
    domain: "information_security",
    description: "Audit sensitive flags iz sys_admin konteksta.",
  },
];

export function controlsForDomain(domain: GovernanceDomain): readonly ComplianceControl[] {
  return COMPLIANCE_CONTROLS.filter((c) => c.domain === domain);
}
