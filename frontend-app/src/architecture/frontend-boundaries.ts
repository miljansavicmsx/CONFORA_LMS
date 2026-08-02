/**
 * Bounded contexts (frontend modules) — ownership and orchestration boundaries.
 */

export type FrontendBoundaryId =
  | "learning-workspace"
  | "certification"
  | "governance-cockpit"
  | "standards-intelligence"
  | "observability"
  | "trust-public"
  | "system-operations"
  | "command-orchestration"
  | "shared-kernel";

export type BoundaryMeta = {
  readonly id: FrontendBoundaryId;
  readonly rootPathHints: readonly string[];
  readonly ownsUX: readonly string[];
  readonly mayImportFrom: readonly FrontendBoundaryId[];
  readonly mustNotOwn: readonly string[];
};

export const FRONTEND_BOUNDARIES: readonly BoundaryMeta[] = [
  {
    id: "learning-workspace",
    rootPathHints: ["pages/learner/", "components/learning/"],
    ownsUX: ["catalog", "course player shell", "learner billing", "exams list"],
    mayImportFrom: ["shared-kernel", "trust-public", "command-orchestration"],
    mustNotOwn: ["committee decisions", "ISO scheme CRUD"],
  },
  {
    id: "certification",
    rootPathHints: ["pages/iso/Candidate", "pages/committee/", "pages/learner/Certification"],
    ownsUX: ["applications", "wizard", "committee queues", "decisions read surfaces"],
    mayImportFrom: ["shared-kernel", "governance-cockpit", "command-orchestration"],
    mustNotOwn: ["workflow state machine (backend)"],
  },
  {
    id: "governance-cockpit",
    rootPathHints: ["pages/admin/GovernanceDashboard", "components/dashboard/", "components/digital-twin/"],
    ownsUX: ["digital twin map", "role cockpits", "executive strips"],
    mayImportFrom: ["shared-kernel", "observability", "standards-intelligence", "command-orchestration"],
    mustNotOwn: ["ABAC policy definitions"],
  },
  {
    id: "standards-intelligence",
    rootPathHints: ["pages/knowledge/", "components/knowledge/", "lib/knowledge"],
    ownsUX: ["clause registry UX", "matrices", "knowledge graph presentation"],
    mayImportFrom: ["shared-kernel", "observability", "governance-cockpit"],
    mustNotOwn: ["authoritative clause law — backend/registry SoT"],
  },
  {
    id: "observability",
    rootPathHints: ["lib/operations-intelligence/", "lib/observability-model/", "lib/audit-readiness/"],
    ownsUX: ["scores", "narration helpers", "band mapping"],
    mayImportFrom: ["shared-kernel"],
    mustNotOwn: ["raw telemetry pipelines"],
  },
  {
    id: "trust-public",
    rootPathHints: ["pages/public/Verify", "pages/public/VerifyLookup"],
    ownsUX: ["public verify narrative", "hash display"],
    mayImportFrom: ["shared-kernel"],
    mustNotOwn: ["internal audit logs"],
  },
  {
    id: "system-operations",
    rootPathHints: ["pages/admin/SysAdminConsole", "components/release-readiness/", "components/platform-governance/"],
    ownsUX: ["internal readiness", "platform aggregates sample"],
    mayImportFrom: ["shared-kernel", "command-orchestration"],
    mustNotOwn: ["tenant business workflows"],
  },
  {
    id: "command-orchestration",
    rootPathHints: ["components/command-center/", "lib/workspace-continuity/"],
    ownsUX: ["global search UX", "continuity snapshots"],
    mayImportFrom: ["shared-kernel"],
    mustNotOwn: ["domain persistence"],
  },
  {
    id: "shared-kernel",
    rootPathHints: ["lib/utils", "lib/api", "design-system/"],
    ownsUX: ["tokens", "auth context types", "http clients"],
    mayImportFrom: [],
    mustNotOwn: ["feature-specific copy"],
  },
];
