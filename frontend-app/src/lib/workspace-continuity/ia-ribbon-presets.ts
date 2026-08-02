import type { ContextRibbonItem } from "@/components/information-disclosure";

/** Statički IA skokovi — nema API poziva; cross-workspace coherence (Phase H). */
export const IA_RIBBON_KNOWLEDGE_HUB: readonly ContextRibbonItem[] = [
  { id: "ia-kn", label: "Standards Intelligence", to: "/dashboard/knowledge", hint: "Registry i tragovi" },
  { id: "ia-comp", label: "Compliance OS", to: "/dashboard/iso/compliance" },
  { id: "ia-gov", label: "Governance hub", to: "/dashboard/admin/governance" },
];

export const IA_RIBBON_GOVERNANCE_CORE: readonly ContextRibbonItem[] = [
  { id: "ia-audit", label: "Audit trag", to: "/dashboard/iso/audit" },
  { id: "ia-capa", label: "CAPA", to: "/dashboard/iso/capa" },
  { id: "ia-risk", label: "Rizici", to: "/dashboard/iso/risks" },
  { id: "ia-mr", label: "Upr. pregled", to: "/dashboard/iso/management-review" },
];

export const IA_RIBBON_LEARNER_TRUST: readonly ContextRibbonItem[] = [
  { id: "ia-verify", label: "Javna provjera", to: "/verify" },
  { id: "ia-knowledge", label: "Standards (referenca)", to: "/dashboard/knowledge" },
];
