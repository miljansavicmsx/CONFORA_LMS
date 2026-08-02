import { EntityKind } from "./relationship-types";

export type NavigationResolution =
  | { readonly kind: "internal"; readonly to: string }
  | { readonly kind: "external"; readonly href: string }
  | { readonly kind: "search"; readonly query: string }
  | { readonly kind: "none" };

function isLikelyVerifyHash(id: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(id.trim());
}

/**
 * Best-effort navigation from relationship targets. Deep entity pages are not always available —
 * command-center search is the graceful fallback.
 */
export function resolveEntityNavigation(entityType: string, entityId: string): NavigationResolution {
  const t = entityType.trim();
  const id = entityId.trim();
  if (!t || !id) return { kind: "none" };

  switch (t) {
    case EntityKind.APPLICATION:
      return { kind: "internal", to: `/dashboard/certification/applications/${encodeURIComponent(id)}/wizard` };
    case EntityKind.SCHEME:
      return { kind: "internal", to: `/dashboard/iso/schemes/${encodeURIComponent(id)}` };
    case EntityKind.CAPA:
    case EntityKind.NONCONFORMITY:
      return { kind: "internal", to: "/dashboard/iso/capa" };
    case EntityKind.RISK:
      return { kind: "internal", to: "/dashboard/iso/risks" };
    case EntityKind.COMPLAINT:
      return { kind: "internal", to: "/dashboard/iso/complaints" };
    case EntityKind.APPEAL:
      return { kind: "internal", to: "/dashboard/iso/appeals" };
    case EntityKind.MANAGEMENT_REVIEW:
    case EntityKind.MANAGEMENT_ACTION:
    case EntityKind.REVIEW_INPUT:
      return { kind: "internal", to: "/dashboard/iso/management-review" };
    case EntityKind.AUDIT_EVENT:
      return { kind: "internal", to: "/dashboard/iso/audit" };
    case EntityKind.IMPARTIALITY:
      return { kind: "internal", to: "/dashboard/iso/impartiality" };
    case EntityKind.COURSE:
      return { kind: "internal", to: "/dashboard/courses" };
    case EntityKind.EXAM:
      return { kind: "internal", to: "/dashboard/exams" };
    case EntityKind.CERTIFICATE:
      if (isLikelyVerifyHash(id)) {
        return { kind: "external", href: `/verify/${encodeURIComponent(id)}` };
      }
      return { kind: "internal", to: "/dashboard/iso/certificates" };
    case EntityKind.VERIFICATION_HASH:
      return { kind: "external", href: `/verify/${encodeURIComponent(id)}` };
    case EntityKind.WORKFLOW_STATE:
      return { kind: "search", query: id };
    case EntityKind.DECISION:
      return { kind: "internal", to: "/dashboard/iso/decisions" };
    case EntityKind.PROCESS:
      return { kind: "search", query: `${t} ${id}` };
    default:
      return { kind: "search", query: `${t} ${id}` };
  }
}

export function buildCommandCenterSearchQuery(entityType: string, entityId: string): string {
  return `${entityType}:${entityId}`.replaceAll("_", " ");
}
