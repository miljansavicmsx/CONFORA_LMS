import type { ReactNode } from "react";

import { EnterpriseSectionHeader } from "@/design-system";

import {
  AICompliancePanel,
  ArchitectureHealthPanel,
  DesignSystemCompliancePanel,
  DomainGovernancePanel,
  PerformanceGovernancePanel,
  ReleaseGovernancePanel,
  TechnicalDebtPanel,
} from "./PlatformGovernancePanels";

/** INTERNAL — platform governance overview for sys_admin. */
export function PlatformGovernanceDashboard(): ReactNode {
  return (
    <section
      className="space-y-4 rounded-2xl border border-border/50 bg-surface-secondary/25 p-4 ring-1 ring-white/[0.04]"
      aria-label="Platform governance dashboard"
    >
      <EnterpriseSectionHeader
        title="Platform governance (internal)"
        description="Agregat pravila održivosti — bez novih backend servisa. Koristi se za operativni pregled, ne za vanjske audite."
        titleLevel="h2"
      />
      <p className="sr-only">Sedam panela: domena, arhitektura, design system, AI compliance, performanse, dugovi, release.</p>

      <div className="grid gap-4 lg:grid-cols-2">
        <DomainGovernancePanel />
        <ArchitectureHealthPanel />
        <DesignSystemCompliancePanel />
        <AICompliancePanel />
        <PerformanceGovernancePanel />
        <TechnicalDebtPanel />
        <ReleaseGovernancePanel />
      </div>
    </section>
  );
}
