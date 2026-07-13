import type { AppWorkspaceId } from "@/lib/app-workspace";

import type { CommandEntity, CommandEntityType, CommandResultBucket } from "./command-entity-types";

/** Public routes (marketing / auth) — no workspace. */
export const PUBLIC_ROUTE_PREFIXES = ["/login", "/register", "/", "/verify", "/public"] as const;

export function isLikelyPublicRoute(path: string): boolean {
  const p = path.split("?")[0] ?? path;
  return PUBLIC_ROUTE_PREFIXES.some((prefix) => prefix === "/" ? p === "/" : p === prefix || p.startsWith(`${prefix}/`));
}

export function inferWorkspaceFromRoute(path: string): AppWorkspaceId {
  if (path.startsWith("/dashboard/admin") || path.includes("/admin/")) {
    return "system";
  }
  if (path.startsWith("/dashboard/knowledge")) {
    return "knowledge";
  }
  if (
    path.startsWith("/dashboard/iso") ||
    path.startsWith("/dashboard/committee") ||
    path.includes("/iso/") ||
    path.includes("/committee/")
  ) {
    return "governance";
  }
  return "learning";
}

export function inferEntityTypeFromRoute(path: string): CommandEntityType {
  const p = path.toLowerCase();
  if (p.includes("/courses") || p.includes("/sadrzaj") || p.includes("/kreiraj-kurs")) return "course";
  if (p.includes("/exam")) return "quiz";
  if (p.includes("/lesson")) return "lesson";
  if (p.includes("/certificate") || p.includes("/my-certificates")) return "certificate";
  if (p.includes("/application") || p.includes("/certification")) return "application";
  if (p.includes("/decision")) return "decision";
  if (p.includes("/risk")) return "risk";
  if (p.includes("/capa")) return "capa";
  if (p.includes("/complaint")) return "complaint";
  if (p.includes("/appeal")) return "appeal";
  if (p.includes("/management-review")) return "management_review";
  if (p.includes("/scheme")) return "scheme";
  if (p.includes("/audit")) return "audit_event";
  if (p.includes("/user")) return "user";
  if (p.includes("/tenant")) return "tenant";
  if (p.includes("/workflow")) return "workflow";
  if (p.includes("/knowledge")) return "clause";
  return "report";
}
export function inferResultBucket(entity: Pick<CommandEntity, "route" | "entityType" | "workspace">): CommandResultBucket {
  const path = entity.route.toLowerCase();
  if (entity.entityType === "user" || entity.entityType === "tenant") {
    return "operations";
  }
  if (entity.entityType === "audit_event") {
    if (path.includes("/iso/")) return "governance";
    return "operations";
  }
  if (
    path.includes("/certification") ||
    path.includes("/certificate") ||
    path.includes("/committee") ||
    path.includes("/recertification") ||
    entity.entityType === "certificate" ||
    entity.entityType === "application" ||
    entity.entityType === "scheme"
  ) {
    return "certification";
  }
  if (
    path.includes("/iso/") ||
    path.includes("/governance") ||
    path.includes("/risk") ||
    path.includes("/capa") ||
    path.includes("/complaint") ||
    path.includes("/appeal") ||
    path.includes("/management-review")
  ) {
    return "governance";
  }
  if (path.includes("/dashboard/knowledge")) {
    return "knowledge";
  }
  if (entity.entityType === "clause" || path.includes("/dashboard/knowledge")) {
    return "knowledge";
  }
  if (path.includes("/dashboard/admin")) {
    return "operations";
  }
  return "learning";
}
export function breadcrumbsForEntity(entity: CommandEntity): readonly string[] {
  const ws =
    entity.workspace === "learning"
      ? "Learning"
      : entity.workspace === "governance"
        ? "Governance"
        : entity.workspace === "knowledge"
          ? "Standards Intelligence"
        : "System";
  const parts = entity.route.replace(/^\//u, "").split("/").filter(Boolean);
  const tail = parts.length ? parts[parts.length - 1]?.replace(/-/gu, " ") ?? "" : "";
  return tail ? [ws, tail] : [ws, entity.title];
}

export function stableCommandValue(entity: Pick<CommandEntity, "entityType" | "id">): string {
  return `${entity.entityType}::${entity.id}`;
}
