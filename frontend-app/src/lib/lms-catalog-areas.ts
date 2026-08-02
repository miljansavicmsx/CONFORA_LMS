import type { CourseListRow } from "@/lib/enrich-course-detail";

/**
 * Horizontalni filtri oblasti za LMS katalog (heuristika na title/domain/categorySlug).
 * Ne mijenja backend — samo UI mapiranje.
 */
export type LmsCatalogAreaId =
  | "all"
  | "standardizacija"
  | "iso-17024"
  | "iso-17065"
  | "iso-9001"
  | "iso-27001"
  | "ocjenjivanje"
  | "rizici"
  | "interni-audit"
  | "ostalo";

export const LMS_CATALOG_FILTERS: readonly { readonly id: LmsCatalogAreaId; readonly label: string }[] = [
  { id: "all", label: "Sve oblasti" },
  { id: "standardizacija", label: "Standardizacija" },
  { id: "iso-17024", label: "ISO/IEC 17024" },
  { id: "iso-17065", label: "ISO/IEC 17065" },
  { id: "iso-9001", label: "ISO 9001" },
  { id: "iso-27001", label: "ISO 27001" },
  { id: "ocjenjivanje", label: "Ocjenjivanje usklađenosti" },
  { id: "rizici", label: "Upravljanje rizicima" },
  { id: "interni-audit", label: "Interni auditi" },
  { id: "ostalo", label: "Ostalo" },
] as const;

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function blob(row: CourseListRow): string {
  return norm(`${row.domain ?? ""} ${row.title} ${row.categorySlug ?? ""}`);
}

/** Specifične oblasti (bez „all” i „ostalo”). */
const SPECIFIC: readonly LmsCatalogAreaId[] = [
  "standardizacija",
  "iso-17024",
  "iso-17065",
  "iso-9001",
  "iso-27001",
  "ocjenjivanje",
  "rizici",
  "interni-audit",
];

export function courseMatchesLmsCatalogArea(row: CourseListRow, areaId: LmsCatalogAreaId): boolean {
  if (areaId === "all") {
    return true;
  }
  const b = blob(row);

  if (areaId === "ostalo") {
    return !SPECIFIC.some((id) => matchesSpecific(b, id));
  }
  return matchesSpecific(b, areaId);
}

function matchesSpecific(b: string, areaId: LmsCatalogAreaId): boolean {
  switch (areaId) {
    case "standardizacija":
      return b.includes("standardiz") || b.includes("standardisation") || b.includes("standardizacij");
    case "iso-17024":
      return b.includes("17024") || b.includes("osob") || b.includes("person certif");
    case "iso-17065":
      return b.includes("17065") || b.includes("proizvod") || b.includes("product cert");
    case "iso-9001":
      return b.includes("9001") || b.includes("kvalitet") || b.includes("quality manag");
    case "iso-27001":
      return b.includes("27001") || b.includes("isms") || b.includes("sigurnost informacij");
    case "ocjenjivanje":
      return b.includes("ocjenj") || b.includes("usklađen") || b.includes("compliance") || b.includes("conformity");
    case "rizici":
      return b.includes("rizik") || b.includes("risk");
    case "interni-audit":
      return b.includes("interni audit") || b.includes("internal audit") || b.includes("audit trail");
    default:
      return false;
  }
}

export function courseMatchesSearchQuery(row: CourseListRow, q: string): boolean {
  const t = norm(q);
  if (!t) {
    return true;
  }
  return blob(row).includes(t) || norm(row.title).includes(t);
}
