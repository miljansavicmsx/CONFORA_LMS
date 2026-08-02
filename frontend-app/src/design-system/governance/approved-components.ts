/**
 * Canonical design-system primitives (approve new components only via PR + matrix update).
 */
export const APPROVED_ENTERPRISE_PRIMITIVES: readonly string[] = [
  "EnterpriseSectionHeader",
  "EnterpriseHero",
  "EnterprisePageShell",
  "EnterpriseWorkflowRibbon",
  "EnterpriseKpiCard",
  "EnterpriseStatusBadge",
  "EnterpriseAiBadge",
  "EnterpriseEmptyState",
  "DashboardSection",
  "DashboardGrid",
];

/** Feature composites that may wrap primitives but must not fork token scales. */
export const APPROVED_FEATURE_COMPOSITES: readonly string[] = [
  "ContextRibbon",
  "ProgressivePanel",
  "EntitySurfaceShell",
  "ExecutiveSummaryPanel",
  "ReleaseReadinessDashboard",
];
